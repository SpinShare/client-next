using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;
using SpinShareClient.MessageParser;

namespace SpinShareClient.DownloadQueue;

public class DownloadQueue
{
    private readonly ILogger<DownloadQueue> _logger;
    
    private SettingsManager? _settingsManager;
    private static DownloadQueue? _instance;
    private static readonly object _lock = new();
    private readonly string? _libraryPath;
    public List<DownloadItem> Queue = new();
    public bool IsRunning = false;
    
    private readonly HttpClient _client = new();

    public DownloadQueue()
    {
        using var serviceProvider = new ServiceCollection()
            .AddLogging(configure => configure.AddConsole())
            .AddLogging(configure => configure.AddDebug())
            .BuildServiceProvider();
        
        _logger = serviceProvider.GetRequiredService<ILogger<DownloadQueue>>();
        
        _logger.LogInformation("Initializing");

        _settingsManager = SettingsManager.GetInstance();
        _libraryPath = _settingsManager.Get<string>("library.path");
    }

    /// <summary>
    /// Returns an instance of <see cref="DownloadQueue"/>
    /// </summary>
    /// <returns><see cref="DownloadQueue"/> Instance</returns>
    public static DownloadQueue GetInstance()
    {
        if (_instance == null)
        {
            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = new DownloadQueue();
                }
            }
        }
        return _instance;
    }

    /// <summary>
    /// Clears the <see cref="DownloadQueue.Queue"/>
    /// </summary>
    public void ClearQueue()
    {
        Queue.Clear();
    }

    /// <summary>
    /// Clears all <see cref="DownloadItem"/> in the <see cref="DownloadQueue.Queue"/> with <see cref="DownloadState"/>
    /// </summary>
    /// <param name="state"><see cref="DownloadState"/></param>
    /// <returns>New queue as <see cref="List{T}"/></returns>
    public List<DownloadItem> ClearQueueWithState(DownloadState state)
    {
        Queue.RemoveAll(x => x.State == state);

        return Queue;
    }

    /// <summary>
    /// Returns the <see cref="DownloadQueue.Queue"/>
    /// </summary>
    /// <returns>Queue as <see cref="List{T}"/></returns>
    public List<DownloadItem> GetQueue()
    {
        return Queue;
    }

    /// <summary>
    /// Returns the count of <see cref="DownloadItem"/>
    /// </summary>
    /// <remarks>If <c>state</c> is set, this returns the count of <see cref="DownloadItem"/> with the given <see cref="DownloadState"/></remarks>
    /// <param name="state">(optional) <see cref="DownloadState"/></param>
    /// <returns>Count as <see cref="int"/></returns>
    public int GetQueueCount(DownloadState? state = null)
    {
        if (state != null)
        {
            return Queue.Count(x => x.State == state);
        }
        
        return Queue.Count(x => x.State != DownloadState.Done);
    }

    /// <summary>
    /// Adds a <see cref="DownloadItem"/> to the <see cref="DownloadQueue.Queue"/>
    /// </summary>
    /// <remarks>
    /// This returns a new queue count to <see cref="PhotinoWindow"/> and starts the <see cref="DownloadQueue.Queue"/> if it is not working already 
    /// </remarks>
    /// <param name="sender">(optional) <see cref="PhotinoWindow"/></param>
    /// <param name="newItem"><see cref="DownloadItem"/></param>
    public async Task AddToQueue(PhotinoWindow? sender, DownloadItem newItem)
    {
        if (Queue.All(x => x.ID != newItem.ID))
        {
            Queue.Add(newItem);
        }

        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-get-count-response", Data = GetQueueCount() });
        _ = WorkQueue(sender);
        
        await Task.Yield();
    }

    /// <summary>
    /// Works off one <see cref="DownloadItem"/>
    /// </summary>
    /// <remarks>
    /// This gives updates to the current status to the <see cref="PhotinoWindow"/> if set
    /// </remarks>
    /// <param name="sender">(optional) <see cref="PhotinoWindow"/></param>
    private async Task WorkQueue(PhotinoWindow? sender)
    {
        if (GetQueueCount(DownloadState.Queued) == 0) return;
        if (_libraryPath == null) return;
        if (IsRunning) return;

        IsRunning = true;
        
        DownloadItem item = Queue.First(x => x.State == DownloadState.Queued);

        _logger.LogInformation("#{ItemID} > Starting", item.ID);

        string tempFolder = Path.GetTempPath();
        string zipFilePath = Path.Combine(tempFolder, item.FileReference + ".zip");
        string extractedFilePath = Path.Combine(tempFolder, item.FileReference ?? "");

        _logger.LogInformation("#{ItemID} > Downloading to Temp", item.ID);
        item.State = DownloadState.Downloading;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        await DownloadFileAsync("https://spinsha.re/api/song/" + item.ID + "/download", zipFilePath);
        
        _logger.LogInformation("#{ItemID} > Extracting to Temp", item.ID);
        item.State = DownloadState.Extracting;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        await UnzipAsync(zipFilePath, extractedFilePath);
        
        _logger.LogInformation("#{ItemID} > Copying to Library", item.ID);
        item.State = DownloadState.Copying;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        await MoveFilesAsync(extractedFilePath, _libraryPath);
        await CleanupAsync(zipFilePath);
        await CleanupAsync(extractedFilePath);
        
        _logger.LogInformation("#{ItemID} > Caching", item.ID);
        item.State = DownloadState.Caching;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        string srtbFilePath = Path.Combine(_libraryPath, item.FileReference + ".srtb");
        LibraryCache.LibraryCache libraryCache = LibraryCache.LibraryCache.GetInstance();
        await libraryCache.AddToCache(srtbFilePath);
        await libraryCache.SaveCache();
        
        _logger.LogInformation("#{ItemID} > Finished", item.ID);
        item.State = DownloadState.Done;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-get-count-response", Data = GetQueueCount() });

        IsRunning = false;
        
        if (GetQueueCount(DownloadState.Queued) > 0)
        {
            await WorkQueue(sender);
        }
    }

    /// <summary>
    /// Adds a local .zip Backup
    /// </summary>
    /// <remarks>
    /// This gives updates to the current status to the <see cref="PhotinoWindow"/> if set
    /// </remarks>
    /// <param name="sender">(optional) <see cref="PhotinoWindow"/></param>
    /// <param name="filePath">Backup.zip path as <see cref="String"/></param>
    public async Task AddLocalBackup(PhotinoWindow? sender, string filePath)
    {
        if (_libraryPath == null) return;
        
        _logger.LogInformation("Adding local backup: {FilePath}", filePath);

        string tempFolder = Path.GetTempPath();
        string fileName = Path.GetFileNameWithoutExtension(filePath);
        string extractedFilePath = Path.Combine(tempFolder, fileName);
        
        _logger.LogInformation("{FileName} > Extracing to Temp", fileName);
        await UnzipAsync(filePath, extractedFilePath);
        
        // If a backup has no .srtb files, expect it's not a backup
        string[] srtbFilePathsInTemp = Directory.GetFiles(extractedFilePath, "*.srtb");
        if (srtbFilePathsInTemp.Length == 0)
        {
            throw new LocalBackupHasNoChartsException();
        }

        _logger.LogInformation("{FileName} > Copying to Library", fileName);
        string[] srtbFilePathsInLibrary = Directory.GetFiles(extractedFilePath, "*.srtb");
        await MoveFilesAsync(extractedFilePath, _libraryPath);
        await CleanupAsync(extractedFilePath);
        
        _logger.LogInformation("{FileName} > Caching", fileName);
        foreach (string srtbFilePath in srtbFilePathsInLibrary)
        {
            string srtbFileName = Path.GetFileName(srtbFilePath);
            string srtbFullFilePath = Path.Combine(_libraryPath, srtbFileName);
            
            _logger.LogInformation("{FileName} > Caching .srtb: {SrtbFullFilePath}", fileName, srtbFullFilePath);
            
            LibraryCache.LibraryCache libraryCache = LibraryCache.LibraryCache.GetInstance();
            await libraryCache.AddToCache(srtbFullFilePath);
            await libraryCache.SaveCache();
        }

        _logger.LogInformation("{FileName} > Finished", fileName);
        
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "library-open-and-install-backup-response", Data = true });
    }

    /// <summary>
    /// Downloads a file asynchronously
    /// </summary>
    /// <param name="url">URL to the file as <see cref="String"/></param>
    /// <param name="filePath">Output path as <see cref="String"/></param>
    private async Task DownloadFileAsync(string url, string filePath)
    {
        using (HttpResponseMessage response = await _client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead))
        {
            using (FileStream fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await response.Content.CopyToAsync(fileStream);
            }
        }
    }

    /// <summary>
    /// Unzips a file asynchronously
    /// </summary>
    /// <param name="zipFilePath">Input.zip path as <see cref="String"/></param>
    /// <param name="extractPath">Output folder path as <see cref="String"/></param>
    /// <returns><see cref="Task"/></returns>
    private Task UnzipAsync(string zipFilePath, string extractPath)
    {
        return Task.Run(() =>
        {
            ZipFile.ExtractToDirectory(zipFilePath, extractPath, true);
        });
    }

    /// <summary>
    /// Moves all files from <c>sourceFolder</c> to <c>targetFolder</c>
    /// </summary>
    /// <param name="sourceFolder">Path as <see cref="String"/></param>
    /// <param name="targetFolder">Path as <see cref="String"/></param>
    /// <returns><see cref="Task"/></returns>
    /// <exception cref="InvalidOperationException">The destination is invalid</exception>
    private Task MoveFilesAsync(string sourceFolder, string targetFolder)
    {
        return Task.Run(() =>
        {
            foreach (string file in Directory.EnumerateFiles(sourceFolder, "*.*", SearchOption.AllDirectories))
            {
                string relativePath = Path.GetRelativePath(sourceFolder, file);
                string destFile = Path.Combine(targetFolder, relativePath);
            
                string destDirectory = Path.GetDirectoryName(destFile) ?? throw new InvalidOperationException("The destination is invalid.");
                if (!Directory.Exists(destDirectory))
                {
                    Directory.CreateDirectory(destDirectory);
                }

                File.Move(file, destFile, true);
            }
        });
    }
    
    /// <summary>
    /// Cleans up any temporary files
    /// </summary>
    /// <param name="path">Path as <see cref="String"/></param>
    private async Task CleanupAsync(string path)
    {
        await Task.Run(() =>
        {
            try
            {
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
                if (Directory.Exists(path))
                {
                    Directory.Delete(path, true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Cleanup Error: {ExMessage}", ex.Message);
            }
        });
    }
}