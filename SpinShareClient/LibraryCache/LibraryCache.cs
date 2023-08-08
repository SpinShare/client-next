using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PhotinoNET;
using SpinShareClient.MessageParser;

namespace SpinShareClient.LibraryCache;

public class LibraryCache
{
    private readonly ILogger<LibraryCache> _logger;
    
    private SettingsManager? _settingsManager;
    private static LibraryCache? _instance;
    private static readonly object _lock = new();
    private readonly string _libraryCacheFilePath;
    private readonly string? _libraryPath;
    public List<LibraryItem> Library = new();

    public LibraryCache()
    {
        using var serviceProvider = new ServiceCollection()
            .AddLogging(configure => configure.AddConsole())
            .AddLogging(configure => configure.AddDebug())
            .BuildServiceProvider();
        
        _logger = serviceProvider.GetRequiredService<ILogger<LibraryCache>>();
        
        _logger.LogInformation("Initializing");

        _settingsManager = SettingsManager.GetInstance();
        _libraryPath = _settingsManager.Get<string>("library.path");
        _libraryCacheFilePath = Path.Combine(SettingsManager.GetAppFolder(), "libraryCache.json");
        
        if (File.Exists(_libraryCacheFilePath))
        {
            LoadCache();
        }
    }

    /// <summary>
    /// Returns an instance of <see cref="LibraryCache"/>
    /// </summary>
    /// <returns><see cref="LibraryCache"/> Instance</returns>
    public static LibraryCache GetInstance()
    {
        if (_instance == null)
        {
            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = new LibraryCache();
                }
            }
        }
        return _instance;
    }

    /// <summary>
    /// Rebuilds the <see cref="LibraryCache.Library"/>
    /// </summary>
    /// <remarks>
    /// Depending on the size of a library, this may take a while
    /// </remarks>
    /// <param name="sender">(optional) <see cref="PhotinoWindow"/></param>
    /// <exception cref="Exception">The library path does not exist</exception>
    public async Task RebuildCache(PhotinoWindow? sender)
    {
        _logger.LogInformation("Rebuilding cache");
        
        if (!Directory.Exists(_libraryPath))
        {
            throw new Exception("Library path does not exist.");
        }
        
        Library.Clear();

        Stopwatch fullWatch = new Stopwatch();
        fullWatch.Start();
        
        string[] filePaths = Directory.GetFiles(_libraryPath, "*.srtb");
        for (int i = 0; i < filePaths.Length; i++)
        {
            Stopwatch itemWatch = new Stopwatch();
            itemWatch.Start();
            
            await AddToCache(filePaths[i]);
        
            itemWatch.Stop();
            _logger.LogInformation("Finished {I} of {FilePathsLength} (in {ItemWatchElapsed})", i + 1, filePaths.Length, itemWatch.Elapsed);
            
            if(sender != null) {
                MessageHandler.SendResponse(sender, new Message {
                    Command = "library-build-cache-progress-response",
                    Data = new
                    {
                        Current = i + 1,
                        Total = filePaths.Length,
                        Percentage = ((i + 1f) / filePaths.Length * 100f).ToString("F1")
                    }
                });
            }
        }

        fullWatch.Stop();
        _logger.LogInformation("Finished rebuilding cache in {FullWatchElapsed}", fullWatch.Elapsed);
        
        await SaveCache();
    }

    /// <summary>
    /// Parses and adds or updates a .SRTB file to the cache
    /// </summary>
    /// <param name="filePath">.srtb path as <see cref="String"/></param>
    public async Task AddToCache(string filePath)
    {
        string fileName = Path.GetFileName(filePath);
        string spinshareReference = Path.GetFileNameWithoutExtension(filePath);

        LibraryItem? existingItem = Library.Find(x => x.FileName == fileName || x.SpinShareReference == spinshareReference);

        if (existingItem == null)
        {
            _logger.LogInformation("Adding new: {FileName}", Path.GetFileName(filePath));
        }
        else
        {
            _logger.LogInformation("Updating existing: {FileName}", Path.GetFileName(filePath));
        }
        
        LibraryItem libraryItem = existingItem ?? new();

        string srtbJson = await File.ReadAllTextAsync(filePath);
        UnityScriptableObject? srtbData = JsonConvert.DeserializeObject<UnityScriptableObject>(srtbJson) ?? null;
        if (srtbData == null) return; // Skip over broken charts

        await libraryItem.Load(srtbData);

        libraryItem.FileName = fileName;
        libraryItem.SpinShareReference = spinshareReference;
            
        // Generating MD5 Update Hash
        using (var md5 = MD5.Create())
        {
            var hash = md5.ComputeHash(Encoding.UTF8.GetBytes(srtbJson));
            libraryItem.UpdateHash = BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
            
        if(existingItem == null) Library.Add(libraryItem);
    }

    /// <summary>
    /// Removes a LibraryItem from the cache
    /// </summary>
    /// <param name="libraryItem"><see cref="LibraryItem"/></param>
    public async Task RemoveFromCache(LibraryItem libraryItem)
    {
        var existingItem = Library.Find(x => x == libraryItem);

        if (existingItem == null)
        {
            _logger.LogInformation("{FileName} does not exist", libraryItem.FileName);
            return;
        }

        Library.Remove(libraryItem);
        await SaveCache();
    }

    /// <summary>
    /// Loads the <see cref="LibraryCache.Library"/> from the persistent cache file.
    /// </summary>
    private void LoadCache()
    {
        string json = File.ReadAllText(_libraryCacheFilePath);
        Library = JsonConvert.DeserializeObject<List<LibraryItem>>(json) ?? new List<LibraryItem>();
    }

    /// <summary>
    /// Clears the <see cref="LibraryCache.Library"/> and saves.
    /// </summary>
    public async Task ClearCache()
    {
        Library.Clear();
        await SaveCache();
    }

    /// <summary>
    /// Saves the <see cref="LibraryCache.Library"/> to the persistent cache file.
    /// </summary>
    public async Task SaveCache()
    {
        string json = JsonConvert.SerializeObject(Library, Formatting.Indented);
        await File.WriteAllTextAsync(_libraryCacheFilePath, json);
    }

    /// <summary>
    /// Returns the <see cref="LibraryCache.Library"/> as a <see cref="List{T}"/> of <see cref="LibraryItem"/>
    /// </summary>
    /// <returns><see cref="List{T}"/> of <see cref="LibraryItem"/></returns>
    public List<LibraryItem> GetLibrary()
    {
        return Library;
    }

    /// <summary>
    /// Returns the state of a <see cref="LibraryItem"/> given a <c>fileReference</c> and <c>currentUpdateHash</c><br /><br />
    /// <b>spinshareReference</b> - A reference to the SpinSha.re item<br />
    /// <b>installed</b> - Whether the chart is in the cache (installed)<br />
    /// <b>updated</b> - Whether the local item has the same <c>updateHash</c>
    /// </summary>
    /// <param name="fileReference">SpinShare FileReference as <see cref="String"/></param>
    /// <param name="currentUpdateHash">.SRTB MD5 hash as <see cref="String"/></param>
    /// <returns><see cref="Dictionary{TKey,TValue}"/></returns>
    public Dictionary<string, object> GetState(string fileReference, string currentUpdateHash)
    {
        Dictionary<string, object> response = new();

        LibraryItem? item = Library.Find(x => x.SpinShareReference == fileReference) ?? null;
        response.Add("spinshareReference", fileReference);
        response.Add("installed", item != null);
        response.Add("updated", item?.UpdateHash == currentUpdateHash);

        return response;
    }
}
