using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace SpinShareClient.MessageParser;

using LibraryCache;

public class CommandLibraryGetState : ICommand
{
    private LibraryCache? _libraryCache;
    
    public async Task<object> Execute(object data)
    {
        _libraryCache = LibraryCache.GetInstance();
        
        JObject dataItem = (JObject)data;
            
        string fileReference = dataItem.GetValue("fileReference")?.ToObject<string>() ?? "";
        string updateHash = dataItem.GetValue("updateHash")?.ToObject<string>() ?? "";

        Message response = new() {
            Command = "library-get-state-response",
            Data = _libraryCache.GetState(fileReference, updateHash)
        };

        return response;
    }
}