using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryBuildCache : ICommand
{
    private LibraryCache? _libraryCache;
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _libraryCache = LibraryCache.GetInstance();
        
        await _libraryCache.RebuildCache(sender);

        Message response = new() {
            Command = "library-build-cache-response",
            Data = "ready"
        };

        MessageHandler.SendResponse(sender, response);
    }
}