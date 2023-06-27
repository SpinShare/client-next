using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryOpenInExplorer : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        CommandOpenInExplorer command = new();
        await command.Execute(sender, LibraryCache.GetLibraryPath());
    }
}