using System.IO;
using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

public class CommandGameSelectPath : ICommand
{
    private SettingsManager? _settingsManager;
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _settingsManager = SettingsManager.GetInstance();
        
        string defaultGamePath = _settingsManager.Get<string>("game.path") ?? SettingsManager.GetGamePath() ?? "";
        string[]? resultPath = sender?.ShowOpenFolder(
            "Spin Rhythm XD game location",
            Directory.Exists(defaultGamePath) ? defaultGamePath : null, 
            false
        );
        
        await Task.Yield();

        if (resultPath?.Length == 1 && Directory.Exists(resultPath[0]))
        {
            Message response = new() {
                Command = "game-get-path-response",
                Data = resultPath[0]
            };
            
            MessageHandler.SendResponse(sender, response);
        }
    }
}