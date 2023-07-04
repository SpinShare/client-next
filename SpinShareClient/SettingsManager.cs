using System.Diagnostics;
using Newtonsoft.Json;

namespace SpinShareClient;

public class SettingsManager
{
    private static SettingsManager? _instance;
    private static readonly object _lock = new();
    private Dictionary<string, object?> _settings = new();
    private readonly string _settingsFilePath;

    private SettingsManager()
    {
        Debug.WriteLine("[SettingsManager] Initializing");
        
        string appFolder = GetAppFolder();

        _settingsFilePath = Path.Combine(appFolder, "settings.json");

        if (File.Exists(_settingsFilePath))
        {
            LoadSettings();
        }
        else
        {
            _settings = new Dictionary<string, object?>();
        }
    }

    public static SettingsManager GetInstance()
    {
        if (_instance == null)
        {
            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = new SettingsManager();
                }
            }
        }
        return _instance;
    }

    public T? Get<T>(string key)
    {
        if (_settings.TryGetValue(key, out var value))
        {
            return (T)Convert.ChangeType(value, typeof(T))!;
        }

        return default;
    }

    public void Set<T>(string key, T? value)
    {
        _settings[key] = value;
        SaveSettings();
    }

    public bool Exists(string key)
    {
        return _settings.ContainsKey(key);
    }

    public void Clear()
    {
        _settings.Clear();
        SaveSettings();
    }

    public Dictionary<string, object?> GetFull()
    {
        return _settings;
    }

    public static bool SettingsFileExists()
    {
        return File.Exists(Path.Combine(GetAppFolder(), "settings.json"));
    }

    private void LoadSettings()
    {
        string json = File.ReadAllText(_settingsFilePath);
        _settings = JsonConvert.DeserializeObject<Dictionary<string, object?>>(json) ?? new();
    }

    private void SaveSettings()
    {
        string json = JsonConvert.SerializeObject(_settings, Formatting.Indented);
        File.WriteAllText(_settingsFilePath, json);
    }

    public static string GetAppFolder()
    {
        string folder = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        string appFolder = Path.Combine(folder, "SpinShare");

        if (!Directory.Exists(appFolder))
        {
            Directory.CreateDirectory(appFolder);
        }

        return appFolder;
    }

    public static string? GetLibraryPath()
    {
        string? libraryPath = "";

        switch (Environment.OSVersion.Platform)
        {
            case PlatformID.Unix:
                libraryPath = Path.Combine(
                    Environment.GetEnvironmentVariable("HOME") ?? "",
                    ".steam", "steam", "steamapps", "compatdata", "1058830", "pfx", "drive_c", "users", "steamuser", "AppData", "LocalLow", "Super Spin Digital", "Spin Rhythm XD", "Custom"
                );
                break;

            case PlatformID.Win32NT:
                libraryPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData) + "Low",
                    "Super Spin Digital", "Spin Rhythm XD", "Custom"
                );
                break;

            case PlatformID.MacOSX:
                libraryPath = Path.Combine(
                    Environment.GetEnvironmentVariable("HOME") ?? "",
                    "Library", "Application Support", "Steam", "steamapps", "common", "Spin Rhythm", "Custom"
                );
                break;

            default:
                throw new Exception("Unknown platform");
        }

        return Directory.Exists(libraryPath) ? libraryPath : null;
    }

    public static string? GetGamePath()
    {
        string? gamePath = "";

        switch (Environment.OSVersion.Platform)
        {
            case PlatformID.Unix:
                gamePath = Path.Combine(
                    Environment.GetEnvironmentVariable("HOME") ?? "",
                    ".steam", "steam", "steamapps", "common", "Spin Rhythm"
                );
                break;

            case PlatformID.Win32NT:
                gamePath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
                    "Steam", "steamapps", "common", "Spin Rhythm"
                );
                break;

            case PlatformID.MacOSX:
                gamePath = Path.Combine(
                    Environment.GetEnvironmentVariable("HOME") ?? "",
                    "Library", "Application Support", "Steam", "steamapps", "common", "Spin Rhythm"
                );
                break;

            default:
                throw new Exception("Unknown platform");
        }

        return Directory.Exists(gamePath) ? gamePath : null;
    }
}