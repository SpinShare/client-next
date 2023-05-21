using Newtonsoft.Json.Linq;
using System.Threading.Tasks;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

public class CommandAddToQueue : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    public async Task<object> Execute(object? data)
    {
        if (data == null) return false;
        _downloadQueue = DownloadQueue.GetInstance();
        
        JObject dataItem = (JObject)data;
            
        int? id = dataItem.GetValue("id")?.ToObject<int>();
        string? title = dataItem.GetValue("title")?.ToObject<string>();
        string? artist = dataItem.GetValue("artist")?.ToObject<string>();
        string? charter = dataItem.GetValue("charter")?.ToObject<string>();
        string? cover = dataItem.GetValue("cover")?.ToObject<string>();
        string? fileReference = dataItem.GetValue("fileReference")?.ToObject<string>();

        await _downloadQueue.AddToQueue(new DownloadItem()
        {
            ID = id,
            Title = title,
            Artist = artist,
            Charter = charter,
            Cover = cover,
            FileReference = fileReference
        });

        Message response = new() {
            Command = "queue-get-count-response",
            Data = _downloadQueue.GetQueueCount()
        };

        return response;
    }
}