using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace SpinShareClient.UpdateManager;

public class UpdateManager
{
    private readonly ILogger<UpdateManager> _logger;

    private static UpdateManager? _instance;
    private static readonly object _lock = new();

    public static string CurrentVersion = "0.0.0";

    public UpdateManager()
    {
        using var serviceProvider = new ServiceCollection()
            .AddLogging(configure => configure.AddConsole())
            .AddLogging(configure => configure.AddDebug())
            .BuildServiceProvider();
        
        _logger = serviceProvider.GetRequiredService<ILogger<UpdateManager>>();

        var version = Assembly.GetExecutingAssembly().GetName().Version;
        CurrentVersion = version != null ? $"{version.Major}.{version.Minor}.{version.Build}" : "0.0.0";
        _logger.LogInformation("Test");
    }

    /// <summary>
    /// Returns an instance of <see cref="UpdateManager"/>
    /// </summary>
    /// <returns><see cref="UpdateManager"/> Instance</returns>
    public static UpdateManager GetInstance()
    {
        if (_instance == null)
        {
            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = new UpdateManager();
                }
            }
        }
        return _instance;
    }

    public async Task<List<GithubRelease>> LoadReleases()
    {
        // TODO: Change Owner/Repo
        try
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.UserAgent.Add(new("SpinShareClient", CurrentVersion));

            var rawResponse =
                await client.GetStringAsync("https://api.github.com/repos/LauraWebdev/client-next/releases");
            var releases = JsonConvert.DeserializeObject<List<GithubRelease>>(rawResponse);
            _logger.LogInformation("Found {ReleaseCount} Releases", releases?.Count ?? 0);

            return releases ?? new List<GithubRelease>();
        }
        catch (Exception e)
        {
            _logger.LogError("Error while getting latest GitHub Releases: {Exception}", e?.Message);
            return new List<GithubRelease>();
        }
    }
}