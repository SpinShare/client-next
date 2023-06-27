using System.Diagnostics;
using PhotinoNET;
using PhotinoNET.Server;
using Sentry;

namespace SpinShareClient;

using MessageParser;

internal static class Program
{
    private static FileStream? _lockFile;
    
    [STAThread]
    static void Main(string[] args)
    {
        // Error Logging
        SentrySdk.Init(options =>
        {
            options.Dsn = "https://8ee3ec205d27494ebaff5ce378db752c@o1420803.ingest.sentry.io/4505318580879360";
            options.Debug = true;
            options.AutoSessionTracking = true;
            options.IsGlobalModeEnabled = true;
            options.EnableTracing = true;
        });
        
        // Single Instance Lock
        AppDomain.CurrentDomain.ProcessExit += OnProcessExit;
        if (!IsSingleInstance())
        {
            // TODO: Error Dialog
            return;
        }
        
        PhotinoServer
            .CreateStaticFileServer(args, out string baseUrl)
            .RunAsync();

        MessageHandler messageHandler = new MessageHandler();
        SettingsManager settingsManager = SettingsManager.GetInstance();
        
        Debug.WriteLine("[MAIN] Creating Window");
        var window = new PhotinoWindow()
            .SetLogVerbosity(2)
            .SetTitle("SpinShare")
            .SetSize(1100, 750)
            .SetUseOsDefaultSize(false)
            .Center()
            .SetResizable(true)
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
            initPage = "#/setup/step-0";
        }
        else
        {
            if (!settingsManager.Exists("library.path") || !settingsManager.Exists("app.silentQueue") ||
                !settingsManager.Exists("app.language") || !settingsManager.Exists("app.setup.done"))
            {
                initPage = "#/setup/step-0";
            }
        
            // Checking for Update
            /*
            if (settingsManager.Exists("app.setup.done"))
            {
                string version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? string.Empty;
                // TODO: API Call for Latest Version Check
                initPage = "#/update";
            } */
        }

#if DEBUG
        window.SetDevToolsEnabled(true);
        window.Load(new Uri($"http://localhost:5173/{initPage}"));
#else
        window.Load($"{baseUrl}/index.html" + initPage);
#endif

        window.WaitForClose();
    }

    private static void OnProcessExit(object? sender, EventArgs e)
    {
        _lockFile?.Close();
        _lockFile = null;
    }

    static bool IsSingleInstance()
    {
        string lockFileName = Path.Combine(SettingsManager.GetAppFolder(), "app.lock");

        try
        {
            _lockFile = new FileStream(lockFileName, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None);
            return true;
        }
        catch (IOException)
        {
            return false;
        }
    }
}
