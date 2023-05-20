using System.Threading.Tasks;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryOpenInExplorer : ICommand
{
    public async Task<object> Execute(object data)
    {
        CommandOpenInExplorer command = new();
        await command.Execute(LibraryCache.GetLibraryPath());

        return true;
    }
}