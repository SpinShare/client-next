using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that returns all settings as an object
/// </summary>
public class CommandSettingsGetFull : ICommand
{
    private SettingsManager? _settingsManager;
    
    private readonly ILogger<CommandSettingsGetFull> _logger;

    public CommandSettingsGetFull(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandSettingsGetFull>>();
    }
    
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