using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that detects the users bought DLCs and saves them as a setting
/// </summary>
public class CommandGameDetectDLCs : ICommand
{
    private SettingsManager? _settingsManager;
    private DlcManager? _dlcManager;
    private readonly ILogger<CommandGameDetectDLCs> _logger;

    public CommandGameDetectDLCs(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandGameDetectDLCs>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _settingsManager = SettingsManager.GetInstance();
        _dlcManager = DlcManager.GetInstance();

        string gameFolderPath = _settingsManager.Get<string>("game.path") ?? SettingsManager.GetGamePath() ?? "";
        Dictionary<string, List<string>> detectedDlcs = await _dlcManager.DetectDlcs(gameFolderPath);
        
        _settingsManager.Set("dlcs", detectedDlcs);
        
        Message response = new() {
            Command = "game-detect-dlcs-response",
            Data = detectedDlcs
        };

        await Task.Yield();
        await Task.Delay(500);

        MessageHandler.SendResponse(sender, response);
    }
}