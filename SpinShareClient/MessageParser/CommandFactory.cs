using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

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
        using var serviceProvider = new ServiceCollection()
            .AddLogging(configure => configure.AddConsole())
            .AddLogging(configure => configure.AddDebug())
            .BuildServiceProvider();
        
        switch(command)
        {
            case "open-in-browser":
                return new CommandOpenInBrowser(serviceProvider);
            case "open-in-explorer":
                return new CommandOpenInExplorer();
            case "game-select-path":
                return new CommandGameSelectPath(serviceProvider);
            case "game-get-path":
                return new CommandGameGetPath(serviceProvider);
            case "game-detect-dlcs":
                return new CommandGameDetectDLCs(serviceProvider);
            case "library-select-path":
                return new CommandLibrarySelectPath(serviceProvider);
            case "library-get-path":
                return new CommandLibraryGetPath(serviceProvider);
            case "library-open-in-explorer":
                return new CommandLibraryOpenInExplorer();
            case "library-open-and-install-backup":
                return new CommandOpenAndInstallBackup(serviceProvider);
            case "library-build-cache":
                return new CommandLibraryBuildCache(serviceProvider);
            case "library-get":
                return new CommandLibraryGet(serviceProvider);
            case "library-get-state":
                return new CommandLibraryGetState(serviceProvider);
            case "library-remove":
                return new CommandLibraryRemove(serviceProvider);
            case "queue-add":
                return new CommandQueueAdd(serviceProvider);
            case "queue-get-count":
                return new CommandQueueGetCount(serviceProvider);
            case "queue-get":
                return new CommandQueueGet(serviceProvider);
            case "queue-clear":
                return new CommandQueueClear(serviceProvider);
            case "settings-open-in-explorer":
                return new CommandSettingsOpenInExplorer();
            case "settings-get":
                return new CommandSettingsGet(serviceProvider);
            case "settings-get-full":
                return new CommandSettingsGetFull(serviceProvider);
            case "settings-set":
                return new CommandSettingsSet(serviceProvider);
            case "update-get-version":
                return new CommandUpdateGetVersion(serviceProvider);
            case "update-get-latest":
                return new CommandUpdateGetLatest(serviceProvider);
            case "is-steamdeck":
                return new CommandIsSteamdeck();
            default:
                throw new Exception($"Unknown command: {command}");
        }
    }
}