using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

/// <summary>
/// A command that returns the count of the <see cref="DownloadQueue.Queue"/>
/// </summary>
public class CommandQueueGetCount : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    private readonly ILogger<CommandQueueGetCount> _logger;

    public CommandQueueGetCount(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandQueueGetCount>>();
    }
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _downloadQueue = DownloadQueue.GetInstance();

        Message response = new() {
            Command = "queue-get-count-response",
            Data = _downloadQueue.GetQueueCount()
        };

        await Task.Yield();
        
        MessageHandler.SendResponse(sender, response);
    }
}