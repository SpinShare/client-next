using System.Diagnostics;
using System.Reflection;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PhotinoNET;
using PhotinoNET.Server;
using Sentry;

namespace SpinShareClient;

using MessageParser;

public class Program
{
    private static ILogger<Program>? _logger;
    private static FileStream? _lockFile;
    
    [STAThread]
    private static void Main(string[] args)
    {
        // Error Logging
        using var serviceProvider = new ServiceCollection()
            .AddLogging(configure => configure.AddConsole())
            .AddLogging(configure => configure.AddDebug())
            .BuildServiceProvider();
        
        _logger = serviceProvider.GetRequiredService<ILogger<Program>>();
        
        _logger.LogInformation("Starting SentrySDK");
        SentrySdk.Init(options =>
        {
            options.Dsn = "https://8ee3ec205d27494ebaff5ce378db752c@o1420803.ingest.sentry.io/4505318580879360";
            options.Debug = true;
            options.AutoSessionTracking = true;
            options.IsGlobalModeEnabled = true;
            options.EnableTracing = true;
        });
        
        // Setting working directory
        var entryAssemblyLocation = Path.GetDirectoryName(Assembly.GetEntryAssembly()?.Location);
        if (entryAssemblyLocation != null)
        {
            Directory.SetCurrentDirectory(entryAssemblyLocation);
        }

        // Single Instance Lock
        AppDomain.CurrentDomain.ProcessExit += OnProcessExit;
        if (!IsSingleInstance())
        {
            _logger.LogError("Single Instance Check failed");
            
            // TODO: Error Dialog
            return;
        }
        
        PhotinoServer
            .CreateStaticFileServer(args, out string baseUrl)
            .RunAsync();

        MessageHandler messageHandler = new MessageHandler();
        SettingsManager settingsManager = SettingsManager.GetInstance();
        
        _logger.LogInformation("Creating Window");
        var window = new PhotinoWindow()
            .SetLogVerbosity(2)
            .SetTitle("SpinShare")
            .SetSize(1280, 800)
            .SetUseOsDefaultSize(false)
            .Center()
            .SetResizable(true)
            .RegisterCustomSchemeHandler("app", (object sender, string scheme, string url, out string contentType) =>
            {
                contentType = "text/javascript";

                var settings = new
                {
                    Language = settingsManager.Get<string>("app.language", "en"),
                    Theme = settingsManager.Get<string>("app.theme", "dark"),
                    IsConsole = settingsManager.Get<bool>("app.console.enabled", SettingsManager.GetIsSteamDeck()),
                };

                var settingsJson = JsonConvert.SerializeObject(settings);
                var script = $"window.spinshare = window.spinshare || {{}}; window.spinshare.settings = {settingsJson};";
                
                return new MemoryStream(Encoding.UTF8.GetBytes(script));
            })
            // LINUX FIXME: https://github.com/tryphotino/photino.NET/issues/83#issuecomment-1554395461
            .RegisterSizeChangedHandler((sender, size) =>
            {
                var senderWindow = (PhotinoWindow?)sender;
                
                if (size.Width < 800) senderWindow?.SetWidth(800);
                if (size.Height < 650) senderWindow?.SetHeight(650);
            })
            .RegisterWebMessageReceivedHandler(messageHandler.RegisterWebMessageReceivedHandler);

        // Check if Setup is needed
        var initPage = "#/";
        if (!SettingsManager.SettingsFileExists())
        {
            _logger.LogInformation("No Settings detected, starting Setup");
            initPage = "#/setup/step-0";
        }
        else
        {
            if (!settingsManager.Exists("app.setup.done"))
            {
                _logger.LogInformation("Settings are not complete, starting Setup");
                initPage = "#/setup/step-0";
            }
        }
        
        _logger.LogInformation("BaseUrl: {BaseUrl}", baseUrl);

#if DEBUG
        _logger.LogInformation("Debug Mode, starting dev site");
        
        window.SetDevToolsEnabled(true);
        window.Load(new Uri($"http://localhost:5173/{initPage}"));
#else
        _logger.LogInformation("Production Mode, starting built site");
        window.Load($"{baseUrl}/index.html" + initPage);
#endif

        window.WaitForClose();
    }

    private static void OnProcessExit(object? sender, EventArgs e)
    {
        if (_lockFile is null) return;
        
        _lockFile.Close();
        _lockFile = null;
    }
    
    static bool IsSingleInstance()
    {
        string appFolder = SettingsManager.GetAppFolder();

        if (string.IsNullOrEmpty(appFolder) || !Directory.Exists(appFolder))
        {
            throw new InvalidOperationException("[IsSingleInstance] Application folder not found.");
        }

        string lockFileName = Path.Combine(appFolder, "app.lock");

        try
        {
            using(_lockFile = new FileStream(
                lockFileName,
                FileMode.OpenOrCreate,
                FileAccess.ReadWrite,
                FileShare.None
            )) 
            {
                return true;
            }
        }
        catch (IOException)
        {
            return false;
        }
    }
}
