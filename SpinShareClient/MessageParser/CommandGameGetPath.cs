using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that returns the default path of a Spin Rhythm XD installation
/// </summary>
public class CommandGameGetPath : ICommand
{
    private readonly ILogger<CommandGameGetPath> _logger;

    public CommandGameGetPath(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandGameGetPath>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        Message response = new() {
            Command = "game-get-path-response",
            Data = SettingsManager.GetGamePath()
        };

        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}