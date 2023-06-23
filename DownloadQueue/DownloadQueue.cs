using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using PhotinoNET;
using SpinShareClient.MessageParser;

namespace SpinShareClient.DownloadQueue;

public class DownloadQueue
{
    private SettingsManager? _settingsManager;
    private static DownloadQueue? _instance;
    private static readonly object _lock = new();
    private readonly string? _libraryPath;
    public List<DownloadItem> Queue = new();
    public bool IsRunning = false;
    
    private readonly HttpClient _client = new();

    private DownloadQueue()
    {
        Debug.WriteLine("[DownloadQueue] Initializing");

        _settingsManager = SettingsManager.GetInstance();
        _libraryPath = _settingsManager.Get<string>("library.path");
    }

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

    public void ClearQueue()
    {
        Queue.Clear();
    }

    public List<DownloadItem> ClearQueueWithState(DownloadState state)
    {
        Queue.RemoveAll(x => x.State == state);

        return Queue;
    }

    public List<DownloadItem> GetQueue()
    {
        return Queue;
    }

    public int GetQueueCount(DownloadState? state = null)
    {
        if (state != null)
        {
            return Queue.Count(x => x.State == state);
        }
        
        return Queue.Count(x => x.State != DownloadState.Done);
    }

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

    private async Task WorkQueue(PhotinoWindow? sender)
    {
        if (GetQueueCount(DownloadState.Queued) == 0) return;
        if (_libraryPath == null) return;
        if (IsRunning) return;

        IsRunning = true;
        
        DownloadItem item = Queue.First(x => x.State == DownloadState.Queued);

        Debug.WriteLine("[DownloadQueue] #" + item.ID + " > Starting");

        string tempFolder = Path.GetTempPath();
        string zipFilePath = Path.Combine(tempFolder, item.FileReference + ".zip");
        string extractedFilePath = Path.Combine(tempFolder, item.FileReference ?? "");

        Debug.WriteLine($"[DownloadQueue] #{item.ID} > Downloading to Temp");
        item.State = DownloadState.Downloading;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        await DownloadFileAsync("https://spinsha.re/api/song/" + item.ID + "/download", zipFilePath);
        
        Debug.WriteLine($"[DownloadQueue] #{item.ID} > Extracing to Temp");
        item.State = DownloadState.Extracting;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        await UnzipAsync(zipFilePath, extractedFilePath);

        Debug.WriteLine($"[DownloadQueue] #{item.ID} > Copying to Library");
        item.State = DownloadState.Copying;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        await MoveFilesAsync(extractedFilePath, _libraryPath);
        await CleanupAsync(zipFilePath, extractedFilePath);
        
        Debug.WriteLine($"[DownloadQueue] #{item.ID} > Caching");
        item.State = DownloadState.Caching;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        string srtbFilePath = Path.Combine(_libraryPath ?? "", item.FileReference + ".srtb");
        LibraryCache.LibraryCache libraryCache = LibraryCache.LibraryCache.GetInstance();
        await libraryCache.AddToCache(srtbFilePath);
        await libraryCache.SaveCache();
        
        Debug.WriteLine($"[DownloadQueue] #{item.ID} > Finished");
        item.State = DownloadState.Done;
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-item-update-response", Data = item });
        if(sender != null) MessageHandler.SendResponse(sender, new Message { Command = "queue-get-count-response", Data = GetQueueCount() });

        IsRunning = false;
        
        if (GetQueueCount(DownloadState.Queued) > 0)
        {
            await WorkQueue(sender);
        }
    }

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

    private Task UnzipAsync(string zipFilePath, string extractPath)
    {
        return Task.Run(() =>
        {
            ZipFile.ExtractToDirectory(zipFilePath, extractPath, true);
        });
    }

    private Task MoveFilesAsync(string sourceFolder, string targetFolder)
    {
        return Task.Run(() =>
        {
            foreach (string file in Directory.EnumerateFiles(sourceFolder, "*.*", SearchOption.AllDirectories))
            {
                string relativePath = Path.GetRelativePath(sourceFolder, file);
                string destFile = Path.Combine(targetFolder, relativePath);
            
                string destDirectory = Path.GetDirectoryName(destFile) ?? throw new InvalidOperationException();
                if (!Directory.Exists(destDirectory))
                {
                    Directory.CreateDirectory(destDirectory);
                }

                File.Move(file, destFile, true);
            }
        });
    }
    
    private async Task CleanupAsync(string zipFilePath, string extractPath)
    {
        await Task.Run(() =>
        {
            // Delete the zip file
            if (File.Exists(zipFilePath))
            {
                try
                {
                    File.Delete(zipFilePath);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"[DownloadQueue] Cleanup Error: {ex.Message}");
                }
            }

            // Delete the extracted files
            if (Directory.Exists(extractPath))
            {
                try
                {
                    Directory.Delete(extractPath, true);
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"[DownloadQueue] Cleanup Error: {ex.Message}");
                }
            }
        });
    }
}