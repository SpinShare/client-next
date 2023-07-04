using System.Diagnostics;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

public class CommandGameDetectDLCs : ICommand
{
    private SettingsManager? _settingsManager;
    private DlcManager? _dlcManager;
    
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