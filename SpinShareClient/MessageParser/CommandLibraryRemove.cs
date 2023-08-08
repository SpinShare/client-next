using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

/// <summary>
/// Removes a chart from the customs folder and the cache
/// </summary>
public class CommandLibraryRemove : ICommand
{
    private LibraryCache? _libraryCache;
    private readonly ILogger<CommandLibraryRemove> _logger;

    public CommandLibraryRemove(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandLibraryRemove>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        if (data == null) return;        
        string fileReference = (string)data;
        
        _libraryCache = LibraryCache.GetInstance();
        
        _logger.LogInformation("Test: {FileRef}", fileReference);

        Message response = new() {
            Command = "library-remove-response",
            Data = true
        };
        
        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}