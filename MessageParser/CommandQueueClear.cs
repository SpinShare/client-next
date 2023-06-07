using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

public class CommandQueueClear : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        _downloadQueue = DownloadQueue.GetInstance();
        
        var downloadState = int.Parse(data.ToString());

        Message response = new() {
            Command = "queue-get-response",
            Data = _downloadQueue.ClearQueueWithState((DownloadState)downloadState)
        };

        await Task.Yield();
        
        MessageHandler.SendResponse(sender, response);
    }
}