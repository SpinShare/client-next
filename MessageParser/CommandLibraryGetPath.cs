using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryGetPath : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        Message response = new() {
            Command = "library-get-path-response",
            Data = LibraryCache.GetLibraryPath()
        };

        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}