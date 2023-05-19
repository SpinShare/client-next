namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryBuildCache : ICommand
{
    private LibraryCache? _libraryCache;
    
    public async Task<object> Execute(object data)
    {
        _libraryCache = LibraryCache.GetInstance();
        
        await _libraryCache.RebuildCache();

        Message response = new() {
            Command = "library-build-cache-response",
            Data = "ready"
        };

        return response;
    }
}