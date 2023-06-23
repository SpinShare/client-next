using System.Diagnostics;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandOpenAndInstallBackup : ICommand
{
    public static readonly (string Name, string[] Extensions)[] Filters = new[]
    {
        ("Spin Rhythm XD Backup", new string[] { ".zip" })
    };
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        Debug.WriteLine("[CommandOpenAndInstallBackup] Opening Picker");
        
        string defaultLibraryPath = LibraryCache.GetLibraryPath() ?? "";
        string[]? resultPath = sender?.ShowOpenFile(
            "Open backup file",
            Directory.Exists(defaultLibraryPath) ? defaultLibraryPath : null,
            false,
            Filters
        );
        
        await Task.Yield();

        if (File.Exists(resultPath?[0]))
        {
            Debug.WriteLine($"[CommandOpenAndInstallBackup] Installing backup: {resultPath[0]}");
            
            // TODO: Extracting Backup to Library
            // TODO: Cache

            Message response = new() {
                Command = "library-open-and-install-backup-response",
                Data = resultPath[0]
            };

            MessageHandler.SendResponse(sender, response);
        }
    }
}