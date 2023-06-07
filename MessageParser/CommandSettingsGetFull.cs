using PhotinoNET;

namespace SpinShareClient.MessageParser;

public class CommandSettingsGetFull : ICommand
{
    private SettingsManager? _settingsManager;
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _settingsManager = SettingsManager.GetInstance();

        Message response = new() {
            Command = "settings-get-full-response",
            Data = _settingsManager.GetFull()
        };
        
        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}