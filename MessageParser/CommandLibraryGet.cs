using System.Threading.Tasks;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryGet : ICommand
{
    private LibraryCache? _libraryCache;
    
    public async Task<object> Execute(object data)
    {
        _libraryCache = LibraryCache.GetInstance();

        await Task.Delay(500);

        Message response = new() {
            Command = "library-get-response",
            Data = _libraryCache.GetLibrary()
        };

        return response;
    }
}