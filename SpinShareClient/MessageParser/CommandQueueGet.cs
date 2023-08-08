using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

/// <summary>
/// A command that returns the <see cref="DownloadQueue.Queue"/>
/// </summary>
public class CommandQueueGet : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    private readonly ILogger<CommandQueueGet> _logger;

    public CommandQueueGet(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandQueueGet>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _downloadQueue = DownloadQueue.GetInstance();

        Message response = new() {
            Command = "queue-get-response",
            Data = _downloadQueue.GetQueue()
        };

        await Task.Yield();
        
        MessageHandler.SendResponse(sender, response);
    }
}