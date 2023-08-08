using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;
using UpdateManager;

/// <summary>
/// Returns the latest <see cref="GithubRelease"/> and whether the client is out of date
/// </summary>
public class CommandUpdateGetLatest : ICommand
{
    private readonly ILogger<CommandUpdateGetLatest> _logger;
    
    private UpdateManager? _updateManager;

    public CommandUpdateGetLatest(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandUpdateGetLatest>>();
        _updateManager = UpdateManager.GetInstance();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _logger.LogInformation("Getting latest Version");

        var releases = await _updateManager.LoadReleases();
        var latestRelease = releases.FirstOrDefault(x => x.Prerelease == false);

        Message response = new() {
            Command = "update-get-latest-response",
            Data = JsonConvert.SerializeObject(latestRelease)
        };

        MessageHandler.SendResponse(sender, response);
    }
}