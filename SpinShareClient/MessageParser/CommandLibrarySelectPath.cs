using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that opens an OS folder picker to select the Spin Rhythm XD library location
/// </summary>
/// <remarks>
/// By default, the picker starts in the saved path or, if not available, in the default location of a Spin Rhythm XD library
/// </remarks>
public class CommandLibrarySelectPath : ICommand
{
    private SettingsManager? _settingsManager;
    
    private readonly ILogger<CommandLibrarySelectPath> _logger;

    public CommandLibrarySelectPath(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandLibrarySelectPath>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _settingsManager = SettingsManager.GetInstance();
        
        string defaultLibraryPath = _settingsManager.Get<string>("library.path") ?? SettingsManager.GetLibraryPath() ?? "";
        string[]? resultPath = sender?.ShowOpenFolder(
            "Spin Rhythm XD library location",
            Directory.Exists(defaultLibraryPath) ? defaultLibraryPath : null, 
            false
        );
        
        await Task.Yield();

        if (resultPath?.Length == 1 && Directory.Exists(resultPath[0]))
        {
            Message response = new() {
                Command = "library-get-path-response",
                Data = resultPath[0]
            };
            
            MessageHandler.SendResponse(sender, response);
        }
    }
}