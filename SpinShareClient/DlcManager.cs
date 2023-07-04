using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;

namespace SpinShareClient;

public class DlcManager
{
    private static DlcManager? _instance;
    private static readonly object _lock = new();
    private Dictionary<string, List<string>> _dlcs = new();

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

    public Dictionary<string, List<string>> GetDlcs()
    {
        return _dlcs;
    }

    public async Task<Dictionary<string, List<string>>> DetectDlcs(string gameFolderPath)
    {
        List<string> dlcFiles = new();
        dlcFiles.AddRange(Directory.GetFiles(Path.Combine(gameFolderPath, "dlc", "OSX"), "t_dlc_*"));
        dlcFiles.AddRange(Directory.GetFiles(Path.Combine(gameFolderPath, "dlc", "Windows"), "t_dlc_*"));

        foreach (string filePath in dlcFiles)
        {
            string fileName = Path.GetFileName(filePath);
            string[] fileNameParts = fileName.Split("_");
            string? dlcName = fileNameParts[2] ?? null;

            if (dlcName != null)
            {
                if (_dlcs.TryGetValue(dlcName, out var dlc))
                {
                    string fileMD5 = await GenerateMD5(filePath);
                             
                    if(!dlc.Exists(x => x == fileMD5))
                        dlc.Add(fileMD5);
                }
                else
                {
                    _dlcs.Add(dlcName, new List<string>() { await GenerateMD5(filePath) });
                }
            }
        }
        
        await Task.Yield();

        Debug.WriteLine($"[DlcManager] Detected {_dlcs.Count} DLCs.");

        return _dlcs;
    }

    private async Task<string> GenerateMD5(string filePath)
    {
        byte[] fileData = await File.ReadAllBytesAsync(filePath);
        
        using (var md5 = MD5.Create())
        {
            var hash = md5.ComputeHash(fileData);
            return BitConverter.ToString(hash);
        }
    }
}