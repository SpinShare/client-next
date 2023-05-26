using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

public class CommandQueueGetCount : ICommand
{
    private DownloadQueue? _downloadQueue;
    
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