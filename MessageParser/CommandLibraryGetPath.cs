using System.Threading.Tasks;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryGetPath : ICommand
{
    public async Task<object> Execute(object? data)
    {
        Message response = new() {
            Command = "library-get-path-response",
            Data = LibraryCache.GetLibraryPath()
        };

        await Task.Yield();

        return response;
    }
}