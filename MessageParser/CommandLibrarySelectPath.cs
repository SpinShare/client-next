using System.IO;
using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibrarySelectPath : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        string defaultLibraryPath = LibraryCache.GetLibraryPath() ?? "";
        string[]? resultPath = sender?.ShowOpenFolder(
            "Spin Rhythm XD library location",
            Directory.Exists(defaultLibraryPath) ? defaultLibraryPath : null, 
            false
        );
        
        await Task.Yield();

        if (Directory.Exists(resultPath?[0]))
        {
            Message response = new() {
                Command = "library-get-path-response",
                Data = resultPath[0]
            };
            
            MessageHandler.SendResponse(sender, response);
        }
    }
}