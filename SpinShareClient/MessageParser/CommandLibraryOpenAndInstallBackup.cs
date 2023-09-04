using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

/// <summary>
/// A command that opens an OS file picker for a Spin Rhythm XD Backup.zip and installs it
/// </summary>
public class CommandOpenAndInstallBackup : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    private readonly ILogger<CommandOpenAndInstallBackup> _logger;

    public CommandOpenAndInstallBackup(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandOpenAndInstallBackup>>();
    }
    
    public static readonly (string Name, string[] Extensions)[] Filters = new[]
    {
        ("Spin Rhythm XD Backup", new string[] { ".zip" })
    };
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _downloadQueue = DownloadQueue.GetInstance();
        
        _logger.LogInformation("Opening Picker");
        
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
            _logger.LogInformation("Installing backup: {Path}", resultPath[0]);

            try
            {
                await _downloadQueue.AddLocalBackup(sender, resultPath[0]);
            }
            catch (LocalBackupHasNoChartsException localBackupHasNoChartsException)
            {
                MessageHandler.SendResponse(
                    sender,
                    new Message
                    {
                        Command = "library-open-and-install-backup-response",
                        Data = "local-backup-has-no-charts-exception"
                    });
            }
        }
    }
}