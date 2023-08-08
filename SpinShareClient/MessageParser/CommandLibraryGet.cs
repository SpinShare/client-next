using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

/// <summary>
/// A command that returns a users full <see cref="LibraryCache.Library"/>
/// </summary>
public class CommandLibraryGet : ICommand
{
    private LibraryCache? _libraryCache;
    
    private readonly ILogger<CommandLibraryGet> _logger;

    public CommandLibraryGet(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandLibraryGet>>();
    }
    
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