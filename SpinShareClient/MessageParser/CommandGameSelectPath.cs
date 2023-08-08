using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that opens an OS folder picker to select the Spin Rhythm XD game location
/// </summary>
/// <remarks>
/// By default, the picker starts in the saved path or, if not available, in the default install location of Spin Rhythm XD
/// </remarks>
public class CommandGameSelectPath : ICommand
{
    private SettingsManager? _settingsManager;
    
    private readonly ILogger<CommandGameSelectPath> _logger;

    public CommandGameSelectPath(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandGameSelectPath>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _settingsManager = SettingsManager.GetInstance();
        
        string defaultGamePath = _settingsManager.Get<string>("game.path") ?? SettingsManager.GetGamePath() ?? "";
        string[]? resultPath = sender?.ShowOpenFolder(
            "Spin Rhythm XD game location",
            Directory.Exists(defaultGamePath) ? defaultGamePath : null, 
            false
        );
        
        await Task.Yield();

        if (resultPath?.Length == 1 && Directory.Exists(resultPath[0]))
        {
            Message response = new() {
                Command = "game-get-path-response",
                Data = resultPath[0]
            };
            
            MessageHandler.SendResponse(sender, response);
        }
    }
}