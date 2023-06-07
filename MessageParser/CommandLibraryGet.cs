using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryGet : ICommand
{
    private LibraryCache? _libraryCache;
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _libraryCache = LibraryCache.GetInstance();

        await Task.Delay(500);

        Message response = new() {
            Command = "library-get-response",
            Data = _libraryCache.GetLibrary()
        };

        MessageHandler.SendResponse(sender, response);
    }
}