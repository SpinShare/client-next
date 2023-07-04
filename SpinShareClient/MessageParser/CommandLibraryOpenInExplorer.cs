using PhotinoNET;

namespace SpinShareClient.MessageParser;

public class CommandLibraryOpenInExplorer : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        CommandOpenInExplorer command = new();
        await command.Execute(sender, SettingsManager.GetLibraryPath());
    }
}