using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace SpinShareClient;

public class SettingsManager
{
    private readonly ILogger<SettingsManager> _logger;

    private static SettingsManager? _instance;
    private static readonly object _lock = new();
    private Dictionary<string, object?> _settings = new();
    private readonly string _settingsFilePath;

    public SettingsManager()
    {
        using var serviceProvider = new ServiceCollection()
            .AddLogging(configure => configure.AddConsole())
            .AddLogging(configure => configure.AddDebug())
            .BuildServiceProvider();
        
        _logger = serviceProvider.GetRequiredService<ILogger<SettingsManager>>();
        
        _logger.LogInformation("Initializing");
        
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

    /// <summary>
    /// Returns an instance of <see cref="SettingsManager"/>
    /// </summary>
    /// <returns><see cref="SettingsManager"/> Instance</returns>
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

    /// <summary>
    /// Returns a value by key
    /// </summary>
    /// <param name="key">Settings key</param>
    /// <param name="defaultValue">Optional default return value if the setting does not exist</param>
    /// <typeparam name="T">Type of the value</typeparam>
    /// <returns>Value or the default value for the type</returns>
    public T? Get<T>(string key, T? defaultValue = default)
    {
        if (_settings.TryGetValue(key, out var value))
        {
            return (T)Convert.ChangeType(value, typeof(T))!;
        }

        return defaultValue;
    }

    /// <summary>
    /// Sets a value by key
    /// </summary>
    /// <param name="key">Settings key</param>
    /// <param name="value">Settings value</param>
    /// <typeparam name="T">Type of the value</typeparam>
    public void Set<T>(string key, T? value)
    {
        _settings[key] = value;
        SaveSettings();
    }

    /// <summary>
    /// Returns whether a key exists
    /// </summary>
    /// <param name="key">Settings key</param>
    /// <returns>True/False</returns>
    public bool Exists(string key)
    {
        return _settings.ContainsKey(key);
    }

    /// <summary>
    /// Clears all settings and saves
    /// </summary>
    public void Clear()
    {
        _settings.Clear();
        SaveSettings();
    }

    /// <summary>
    /// Returns a <see cref="Dictionary{TKey,TValue}"/> of all settings
    /// </summary>
    /// <returns><see cref="Dictionary{TKey,TValue}"/></returns>
    public Dictionary<string, object?> GetFull()
    {
        return _settings;
    }

    /// <summary>
    /// Returns whether the persistent settings file exists
    /// </summary>
    /// <returns>True/False</returns>
    public static bool SettingsFileExists()
    {
        return File.Exists(Path.Combine(GetAppFolder(), "settings.json"));
    }

    /// <summary>
    /// Loads all settings from the persistent settings file
    /// </summary>
    private void LoadSettings()
    {
        string json = File.ReadAllText(_settingsFilePath);
        _settings = JsonConvert.DeserializeObject<Dictionary<string, object?>>(json) ?? new();
    }

    /// <summary>
    /// Saves all settings to the persistent settings file
    /// </summary>
    private void SaveSettings()
    {
        string json = JsonConvert.SerializeObject(_settings, Formatting.Indented);
        File.WriteAllText(_settingsFilePath, json);
    }

    /// <summary>
    /// Returns the application folder
    /// </summary>
    /// <remarks>If the folder does not exist, it will be created</remarks>
    /// <returns>Path as <see cref="String"/></returns>
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

    /// <summary>
    /// Returns the default path of the Spin Rhythm XD library
    /// </summary>
    /// <remarks>It always points to the default path, regardless of the launch parameters in Steam.</remarks>
    /// <returns>Path as <see cref="String"/> or <c>null</c> if the folder does not exist.</returns>
    /// <exception cref="Exception">The platform is not supported</exception>
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

    /// <summary>
    /// Returns the default path of the Spin Rhythm XD installation
    /// </summary>
    /// <remarks>It always points to the default path (C drive on Windows).</remarks>
    /// <returns>Path as <see cref="String"/> or <c>null</c> if the folder does not exist.</returns>
    /// <exception cref="Exception">The platform is not supported</exception>
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

    public static bool GetIsSteamDeck()
    {
        // TODO: Revert Debug
        return !Environment.OSVersion.VersionString.Contains("SteamOS");
    }
}