using System;

namespace SpinShareClient.MessageParser;

/// <summary>
/// The CommandFactory class is responsible for producing instances of ICommand, based on a provided string.
/// </summary>
public class CommandFactory
{
    /// <summary>
    /// Returns an instance of a class that implements <see cref="ICommand"/>, corresponding to the provided <c>command</c> string.
    /// </summary>
    /// <param name="command">Command as <see cref="String"/></param>
    /// <returns>An instance of a class implementing <see cref="ICommand"/> that corresponds to the <c>command</c> string.</returns>
    /// <exception cref="Exception">Thrown when an unknown command string is provided.</exception>
    public ICommand GetCommand(string command)
    {
        switch(command)
        {
            case "open-in-browser":
                return new CommandOpenInBrowser();
            case "open-in-explorer":
                return new CommandOpenInExplorer();
            case "game-select-path":
                return new CommandGameSelectPath();
            case "game-get-path":
                return new CommandGameGetPath();
            case "game-detect-dlcs":
                return new CommandGameDetectDLCs();
            case "library-select-path":
                return new CommandLibrarySelectPath();
            case "library-get-path":
                return new CommandLibraryGetPath();
            case "library-open-in-explorer":
                return new CommandLibraryOpenInExplorer();
            case "library-open-and-install-backup":
                return new CommandOpenAndInstallBackup();
            case "library-build-cache":
                return new CommandLibraryBuildCache();
            case "library-get":
                return new CommandLibraryGet();
            case "library-get-state":
                return new CommandLibraryGetState();
            case "queue-add":
                return new CommandQueueAdd();
            case "queue-get-count":
                return new CommandQueueGetCount();
            case "queue-get":
                return new CommandQueueGet();
            case "queue-clear":
                return new CommandQueueClear();
            case "settings-open-in-explorer":
                return new CommandSettingsOpenInExplorer();
            case "settings-get":
                return new CommandSettingsGet();
            case "settings-get-full":
                return new CommandSettingsGetFull();
            case "settings-set":
                return new CommandSettingsSet();
            default:
                throw new Exception($"Unknown command: {command}");
        }
    }
}