using System.Reflection;
using PhotinoNET;
using PhotinoNET.Server;
using SpinShareClient.MessageParser;

namespace SpinShareClient;

using MessageParser;

internal static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        PhotinoServer
            .CreateStaticFileServer(args, out string baseUrl)
            .RunAsync();

        string windowTitle = "SpinShare";
        
        Console.WriteLine("[MAIN] Creating Window");

        MessageHandler messageHandler = new MessageHandler();

        var window = new PhotinoWindow()
            .SetTitle(windowTitle)
            .SetSize(1100, 750)
            .SetUseOsDefaultSize(false)
            .Center()
            .SetResizable(true)
            .SetLogVerbosity(1)
            .RegisterWebMessageReceivedHandler(messageHandler.RegisterWebMessageReceivedHandler);

        var initPage = "#/";

        // Setup if there are no settings
        if (!SettingsManager.SettingsFileExists())
        {
            initPage = "#/setup/step-0";
        }
        else
        {
            SettingsManager settingsManager = SettingsManager.GetInstance();

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
        window.Load(new Uri("http://localhost:5173/" + initPage));
#else
        window.Load($"{baseUrl}/index.html" + initPage);
#endif

        window.WaitForClose();
    }
}
