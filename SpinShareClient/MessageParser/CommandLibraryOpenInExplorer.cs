using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that opens the Spin Rhythm XD library in the OS explorer/finder
/// </summary>
public class CommandLibraryOpenInExplorer : ICommand
{
    private readonly ILogger<CommandLibraryOpenInExplorer> _logger;
    private readonly ServiceProvider _serviceProvider;

    public CommandLibraryOpenInExplorer(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandLibraryOpenInExplorer>>();
        _serviceProvider = serviceProvider;
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        CommandOpenInExplorer command = new(_serviceProvider);
        await command.Execute(sender, SettingsManager.GetLibraryPath());
    }
}