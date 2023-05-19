using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;

namespace SpinShareClient.LibraryCache;

using Newtonsoft.Json.Linq;

public class LibraryCache
{
    private SettingsManager? _settingsManager;
    private static LibraryCache? _instance;
    private static readonly object _lock = new();
    private readonly string _libraryCacheFilePath;
    private readonly string _libraryPath;
    public List<LibraryItem> Library = new();

    private LibraryCache()
    {
        Console.WriteLine("[ChartLibrary] Initializing");

        _settingsManager = SettingsManager.GetInstance();
        _libraryPath = _settingsManager.Get<string>("library.path");
        _libraryCacheFilePath = Path.Combine(SettingsManager.GetAppFolder(), "libraryCache.json");
        
        if (File.Exists(_libraryCacheFilePath))
        {
            LoadCache();
        }
    }

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

    public async Task RebuildCache()
    {
        Console.WriteLine("[LibraryCache] Rebuilding cache");
        
        if (!Directory.Exists(_libraryPath))
        {
            throw new Exception("Library path does not exist.");
        }
        
        Library.Clear();

        Stopwatch fullWatch = new Stopwatch();
        fullWatch.Start();
        
        string[] filePaths = Directory.GetFiles(_libraryPath);
        for (int i = 0; i < filePaths.Length; i++)
        {
            Stopwatch itemWatch = new Stopwatch();
            itemWatch.Start();
            
            string filePath = filePaths[i];
            LibraryItem libraryItem = new();
            
            string fileName = Path.GetFileName(filePath);
            string spinshareReference = Path.GetFileNameWithoutExtension(filePath);

            string srtbJson = await File.ReadAllTextAsync(filePath);
            UnityScriptableObject? srtbData = JsonConvert.DeserializeObject<UnityScriptableObject>(srtbJson) ?? null;
            if (srtbData == null) continue; // Skip over broken charts
            
            await libraryItem.Load(srtbData);

            libraryItem.FileName = fileName;
            libraryItem.SpinShareReference = spinshareReference;
            
            // Generating MD5 Update Hash
            using (var md5 = MD5.Create())
            {
                var inputBytes = Encoding.UTF8.GetBytes(srtbJson);
                using (var stream = new MemoryStream(inputBytes))
                {
                    var hashBytes = await md5.ComputeHashAsync(stream);
                    libraryItem.UpdateHash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
                }
            }
            
            Library.Add(libraryItem);
        
            itemWatch.Stop();
            Console.WriteLine("[LibraryCache] Finished " + i + " of " + filePaths.Length + " (in " + itemWatch.Elapsed.ToString("mm\\:ss\\.ff") + ")");
        }

        fullWatch.Stop();
        Console.WriteLine("[LibraryCache] Finished rebuilding cache in " + fullWatch.Elapsed.ToString("mm\\:ss\\.ff") + ".");
        
        await SaveCache();
    }

    private void LoadCache()
    {
        string json = File.ReadAllText(_libraryCacheFilePath);
        Library = JsonConvert.DeserializeObject<List<LibraryItem>>(json) ?? new();
    }

    public async Task Clear()
    {
        Library.Clear();
        await SaveCache();
    }

    private async Task SaveCache()
    {
        string json = JsonConvert.SerializeObject(Library, Formatting.Indented);
        await File.WriteAllTextAsync(_libraryCacheFilePath, json);
    }

    public List<LibraryItem> GetLibrary()
    {
        return Library;
    }
    
    public static string GetLibraryPath()
    {
        string libraryPath = "";

        switch (Environment.OSVersion.Platform)
        {
            case PlatformID.Unix:
                libraryPath = Path.Combine(
                    Environment.GetEnvironmentVariable("HOME"),
                    ".steam/steam/steamapps/compatdata/1058830/pfx/drive_c/users/steamuser/AppData/LocalLow/Super Spin Digital/Spin Rhythm XD/Custom"
                );
                break;

            case PlatformID.Win32NT:
                libraryPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Super Spin Digital/Spin Rhythm XD/Custom"
                );
                break;

            case PlatformID.MacOSX:
                libraryPath = Path.Combine(
                    Environment.GetEnvironmentVariable("HOME"),
                    "Library/Application Support/Steam/steamapps/common/Spin Rhythm/Custom"
                );
                break;

            default:
                throw new Exception("Unknown platform");
        }

        return libraryPath;
    }
}
