using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

/// <summary>
/// A command that starts a full rebuild of the <see cref="LibraryCache.Library"/>
/// </summary>
public class CommandLibraryBuildCache : ICommand
{
    private LibraryCache? _libraryCache;
    
    private readonly ILogger<CommandLibraryBuildCache> _logger;

    public CommandLibraryBuildCache(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandLibraryBuildCache>>();
    }
    
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