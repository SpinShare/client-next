using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that opens the Spin Rhythm XD library in the OS explorer/finder
/// </summary>
public class CommandLibraryOpenInExplorer : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        CommandOpenInExplorer command = new();
        await command.Execute(sender, SettingsManager.GetLibraryPath());
    }
}