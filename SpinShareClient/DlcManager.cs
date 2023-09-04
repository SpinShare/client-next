using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace SpinShareClient;

public class DlcManager
{
    private readonly ILogger<DlcManager> _logger;

    private static DlcManager? _instance;
    private static readonly object _lock = new();
    private Dictionary<string, List<string>> _dlcs = new();

    public DlcManager()
    {
        using var serviceProvider = new ServiceCollection()
            .AddLogging(configure => configure.AddConsole())
            .AddLogging(configure => configure.AddDebug())
            .BuildServiceProvider();
        
        _logger = serviceProvider.GetRequiredService<ILogger<DlcManager>>();
    }

    /// <summary>
    /// Returns an instance of <see cref="DlcManager"/>
    /// </summary>
    /// <returns><see cref="DlcManager"/> Instance</returns>
    public static DlcManager GetInstance()
    {
        if (_instance == null)
        {
            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = new DlcManager();
                }
            }
        }
        return _instance;
    }

    /// <summary>
    /// Returns a dictionary of installed DLCs and a list of MD5 hashes for verification
    /// </summary>
    /// <returns><see cref="Dictionary{TKey,TValue}"/> of DLC key and <see cref="List{T}"/> of MD5 hashes</returns>
    public Dictionary<string, List<string>> GetDlcs()
    {
        return _dlcs;
    }

    /// <summary>
    /// Detects any installed DLCs given a <c>gameFolderPath</c>
    /// </summary>
    /// <param name="gameFolderPath">Path as <see cref="String"/></param>
    /// <returns><see cref="Dictionary{TKey,TValue}"/> of DLC key and <see cref="List{T}"/> of MD5 hashes</returns>
    public async Task<Dictionary<string, List<string>>> DetectDlcs(string gameFolderPath)
    {
        // The game has both OSX and Windows folders regardless of platform (if you have any DLC), we're checking both
        var osxPath = Path.Combine(gameFolderPath, "dlc", "OSX");
        var winPath = Path.Combine(gameFolderPath, "dlc", "Windows");
        
        List<string> dlcFiles = new();
        if(Path.Exists(osxPath)) dlcFiles.AddRange(Directory.GetFiles(osxPath, "t_dlc_*"));
        if(Path.Exists(winPath)) dlcFiles.AddRange(Directory.GetFiles(winPath, "t_dlc_*"));

        foreach (string filePath in dlcFiles)
        {
            string fileName = Path.GetFileName(filePath);
            string[] fileNameParts = fileName.Split("_");
            string? dlcName = fileNameParts[2] ?? null;

            if (dlcName != null)
            {
                if (_dlcs.TryGetValue(dlcName, out var dlc))
                {
                    string fileMd5 = await GenerateMd5(filePath);
                             
                    if(!dlc.Exists(x => x == fileMd5))
                        dlc.Add(fileMd5);
                }
                else
                {
                    _dlcs.Add(dlcName, new List<string>() { await GenerateMd5(filePath) });
                }
            }
        }
        
        await Task.Yield();

        _logger.LogInformation("Detected {DlcsCount} DLCs", _dlcs.Count);

        return _dlcs;
    }

    /// <summary>
    /// Generated an MD5 hash of a file given a <c>filePath</c>
    /// </summary>
    /// <param name="filePath">Path as <see cref="String"/></param>
    /// <returns>MD5 hash</returns>
    public async Task<string> GenerateMd5(string filePath)
    {
        byte[] fileData = await File.ReadAllBytesAsync(filePath);
        
        using (var md5 = MD5.Create())
        {
            var hash = md5.ComputeHash(fileData);
            return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
        }
    }
}