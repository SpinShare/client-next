namespace SpinShareClient.MessageParser;

public class CommandFactory
{
    public ICommand GetCommand(string command)
    {
        switch(command)
        {
            case "Ping":
                return new CommandPing();
            case "open-in-browser":
                return new CommandOpenInBrowser();
            case "library-select-path":
                return new CommandLibrarySelectPath();
            case "library-get-path":
                return new CommandLibraryGetPath();
            case "library-build-cache":
                return new CommandLibraryBuildCache();
            case "library-get":
                return new CommandLibraryGet();
            case "settings-set":
                return new CommandSettingsSet();
            default:
                throw new Exception($"Unknown command: {command}");
        }
    }
}