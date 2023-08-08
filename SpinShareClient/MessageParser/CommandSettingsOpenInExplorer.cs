using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that opens the settings <see cref="SettingsManager.GetAppFolder"/> in the OS explorer/finder
/// </summary>
public class CommandSettingsOpenInExplorer : ICommand
{
    
    private readonly ILogger<CommandSettingsOpenInExplorer> _logger;
    private readonly ServiceProvider _serviceProvider;

    public CommandSettingsOpenInExplorer(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandSettingsOpenInExplorer>>();
        _serviceProvider = serviceProvider;
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        CommandOpenInExplorer command = new(_serviceProvider);
        await command.Execute(sender, SettingsManager.GetAppFolder());
    }
}