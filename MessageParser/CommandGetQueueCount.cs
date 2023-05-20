using System.Threading.Tasks;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

public class CommandGetQueueCount : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    public async Task<object> Execute(object data)
    {
        _downloadQueue = DownloadQueue.GetInstance();

        Message response = new() {
            Command = "queue-get-count-response",
            Data = _downloadQueue.GetQueueCount()
        };

        return response;
    }
}