using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace SpinShareClient.DownloadQueue;

public class DownloadQueue
{
    private SettingsManager? _settingsManager;
    private static DownloadQueue? _instance;
    private static readonly object _lock = new();
    private readonly string _libraryPath;
    public Queue<DownloadItem> Queue = new();
    
    private readonly HttpClient _client = new();

    private DownloadQueue()
    {
        Console.WriteLine("[DownloadQueue] Initializing");

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

    public List<DownloadItem> GetQueue()
    {
        return Queue.ToList();
    }

    public int GetQueueCount()
    {
        return Queue.Count;
    }

    public async Task AddToQueue(DownloadItem newItem)
    {
        Queue.Enqueue(newItem);
        _ = WorkQueue();
    }

    private async Task WorkQueue()
    {
        if (Queue.Count == 0) return;
        
        DownloadItem item = Queue.Peek();

        Console.WriteLine("[DownloadQueue] #" + item.ID + " > Starting");

        string tempFolder = Path.GetTempPath();
        string zipFilePath = Path.Combine(tempFolder, item.FileReference + ".zip");
        string extractedFilePath = Path.Combine(tempFolder, item.FileReference);

        Console.WriteLine("[DownloadQueue] #" + item.ID + " > Downloading to Temp");
        item.State = DownloadState.Downloading;
        await DownloadFileAsync("https://spinsha.re/api/song/" + item.ID + "/download", zipFilePath);
        
        Console.WriteLine("[DownloadQueue] #" + item.ID + " > Extracing to Temp");
        item.State = DownloadState.Extracting;
        await UnzipAsync(zipFilePath, extractedFilePath);

        Console.WriteLine("[DownloadQueue] #" + item.ID + " > Copying to Library");
        item.State = DownloadState.Copying;
        await MoveFilesAsync(extractedFilePath, _libraryPath);
        await CleanupAsync(zipFilePath, extractedFilePath);
        
        Console.WriteLine("[DownloadQueue] #" + item.ID + " > Caching");
        item.State = DownloadState.Caching;
        string srtbFilePath = Path.Combine(_libraryPath, item.FileReference + ".srtb");
        LibraryCache.LibraryCache libraryCache = LibraryCache.LibraryCache.GetInstance();
        await libraryCache.AddToCache(srtbFilePath);
        await libraryCache.SaveCache();
        
        Console.WriteLine("[DownloadQueue] #" + item.ID + " > Finished");
        item.State = DownloadState.Done;

        // Dequeue afterwards to display count properly until process is done
        Queue.Dequeue();
        
        // TODO: Send Update Queue to Client
        
        if (Queue.Count > 0)
        {
            _ = WorkQueue();
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
                    Console.WriteLine($"[DownloadQueue] Cleanup Error: {ex.Message}");
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
                    Console.WriteLine($"[DownloadQueue] Cleanup Error: {ex.Message}");
                }
            }
        });
    }
}