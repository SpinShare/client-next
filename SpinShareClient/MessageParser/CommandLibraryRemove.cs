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
    private readonly ILogger<CommandLibraryRemove> _logger;
    
    private LibraryCache? _libraryCache;
    private readonly string? _libraryPath;

    public CommandLibraryRemove(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandLibraryRemove>>();
        _libraryPath = SettingsManager.GetLibraryPath();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        if (data == null) return;
        if (_libraryPath == null) return;  
        var fileReference = (string)data;
        
        _libraryCache = LibraryCache.GetInstance();
        
        _logger.LogInformation("{FileReference} > Removing Cache Item", fileReference);
        var libraryItem = _libraryCache.Library.Find(x => x.SpinShareReference == fileReference);
        if (libraryItem != null)
        {
            await _libraryCache.RemoveFromCache(libraryItem);
        }

        var srtbFilePath = Path.Combine(_libraryPath, fileReference + ".srtb");
        if (!File.Exists(srtbFilePath))
        {
            _logger.LogError("{FileReference} > SRTB file does not exist", fileReference);
        }
        else
        {
            _logger.LogInformation("{FileReference} > Removing SRTB file", fileReference);
            File.Delete(srtbFilePath);
        }
        
        // TODO: Remove Audio/AlbumArt

        Message response = new() {
            Command = "library-remove-response",
            Data = ""
        };

        MessageHandler.SendResponse(sender, response);
    }
}