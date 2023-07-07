using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using DownloadQueue;

/// <summary>
/// A command that adds a <see cref="DownloadItem"/> to the <see cref="DownloadQueue.Queue"/> 
/// </summary>
public class CommandQueueAdd : ICommand
{
    private DownloadQueue? _downloadQueue;
    
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        if (data == null) return;
        _downloadQueue = DownloadQueue.GetInstance();
        
        JObject dataItem = (JObject)data;
            
        int? id = dataItem.GetValue("id")?.ToObject<int>();
        string? title = dataItem.GetValue("title")?.ToObject<string>();
        string? artist = dataItem.GetValue("artist")?.ToObject<string>();
        string? charter = dataItem.GetValue("charter")?.ToObject<string>();
        string? cover = dataItem.GetValue("cover")?.ToObject<string>();
        string? fileReference = dataItem.GetValue("fileReference")?.ToObject<string>();

        await _downloadQueue.AddToQueue(sender, new DownloadItem()
        {
            ID = id,
            Title = title,
            Artist = artist,
            Charter = charter,
            Cover = cover,
            FileReference = fileReference,
            State = DownloadState.Queued,
        });
    }
}