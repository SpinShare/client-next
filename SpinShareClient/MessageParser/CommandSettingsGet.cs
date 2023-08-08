using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that returns the value of a setting given a <c>key</c>
/// </summary>
public class CommandSettingsGet : ICommand
{
    private SettingsManager? _settingsManager;
    
    private readonly ILogger<CommandSettingsGet> _logger;

    public CommandSettingsGet(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandSettingsGet>>();
    }
    
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