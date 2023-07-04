using System.Diagnostics;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

public class CommandOpenAndInstallBackup : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    public static readonly (string Name, string[] Extensions)[] Filters = new[]
    {
        ("Spin Rhythm XD Backup", new string[] { ".zip" })
    };
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _downloadQueue = DownloadQueue.GetInstance();
        
        Debug.WriteLine("[CommandOpenAndInstallBackup] Opening Picker");
        
        string defaultLibraryPath = SettingsManager.GetLibraryPath() ?? "";
        string[]? resultPath = sender?.ShowOpenFile(
            "Open backup file",
            Directory.Exists(defaultLibraryPath) ? defaultLibraryPath : null,
            false,
            Filters
        );
        
        await Task.Yield();

        if (resultPath?.Length == 1 && File.Exists(resultPath[0]))
        {
            Debug.WriteLine($"[CommandOpenAndInstallBackup] Installing backup: {resultPath[0]}");
            
            await _downloadQueue.AddLocalBackup(sender, resultPath[0]);
        }
    }
}