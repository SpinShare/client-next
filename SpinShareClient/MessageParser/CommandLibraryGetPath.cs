using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that returns the default Spin Rhythm XD library path
/// </summary>
public class CommandLibraryGetPath : ICommand
{
    private readonly ILogger<CommandLibraryGetPath> _logger;

    public CommandLibraryGetPath(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandLibraryGetPath>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        Message response = new() {
            Command = "library-get-path-response",
            Data = SettingsManager.GetLibraryPath()
        };

        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}