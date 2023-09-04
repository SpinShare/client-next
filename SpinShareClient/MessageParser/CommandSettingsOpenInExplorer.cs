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
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        CommandOpenInExplorer command = new();
        await command.Execute(sender, SettingsManager.GetAppFolder());
    }
}