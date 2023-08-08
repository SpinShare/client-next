using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

/// <summary>
/// A command that clears the <see cref="DownloadQueue.Queue"/> given a <see cref="DownloadState"/>
/// </summary>
/// <remarks>
/// If no <see cref="DownloadState"/> is set, any <see cref="DownloadState.Queued"/> items will be cleared
/// </remarks>
public class CommandQueueClear : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    private readonly ILogger<CommandQueueClear> _logger;

    public CommandQueueClear(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandQueueClear>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _downloadQueue = DownloadQueue.GetInstance();
        
        int downloadState = (int)DownloadState.Queued;
        if (int.TryParse(data?.ToString(), out int state))
        {
            downloadState = state;
        }

        Message response = new() {
            Command = "queue-get-response",
            Data = _downloadQueue.ClearQueueWithState((DownloadState)downloadState)
        };

        await Task.Yield();
        
        MessageHandler.SendResponse(sender, response);
    }
}