using Newtonsoft.Json.Linq;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

public class CommandSettingsGet : ICommand
{
    private SettingsManager? _settingsManager;
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        if (data == null) return;
        _settingsManager = SettingsManager.GetInstance();
        
        var key = data.ToString();
        if (key == null) return;

        JObject responseData = new JObject(
            new JProperty("key", key),
            new JProperty("data", _settingsManager.Get<object>(key))
        );

        Message response = new() {
            Command = "settings-get-response",
            Data = responseData
        };
        
        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}