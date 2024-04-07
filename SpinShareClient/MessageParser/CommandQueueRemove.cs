using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

/// <summary>
/// A command that removes an item from <see cref="DownloadQueue.Queue"/>
/// </summary>
public class CommandQueueRemove : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    private readonly ILogger<CommandQueueRemove> _logger;

    public CommandQueueRemove(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandQueueRemove>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        if (data == null) return;
        var validQueueId = int.TryParse(data.ToString(), out var queueId);
        if (!validQueueId) return;
        
        _downloadQueue = DownloadQueue.GetInstance();

        await _downloadQueue.RemoveFromQueue(sender, queueId);

        Message response = new() {
            Command = "queue-get-response",
            Data = _downloadQueue.GetQueue()
        };

        await Task.Yield();
        
        MessageHandler.SendResponse(sender, response);
    }
}