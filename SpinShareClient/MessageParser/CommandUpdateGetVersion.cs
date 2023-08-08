using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using UpdateManager;

/// <summary>
/// Returns the current client version
/// </summary>
public class CommandUpdateGetVersion : ICommand
{
    private readonly ILogger<CommandUpdateGetVersion> _logger;
    
    private UpdateManager? _updateManager;

    public CommandUpdateGetVersion(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandUpdateGetVersion>>();
        _updateManager = UpdateManager.GetInstance();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        Message response = new() {
            Command = "update-get-version-response",
            Data = UpdateManager.CurrentVersion
        };

        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}