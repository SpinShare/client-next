using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

/// <summary>
/// A command that starts a full rebuild of the <see cref="LibraryCache.Library"/>
/// </summary>
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