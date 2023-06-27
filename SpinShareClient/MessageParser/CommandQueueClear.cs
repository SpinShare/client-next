using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

public class CommandQueueClear : ICommand
{
    private DownloadQueue? _downloadQueue;
    
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