using System.Threading.Tasks;

namespace SpinShareClient.MessageParser;

using NativeFileDialogSharp;
using LibraryCache;

public class CommandLibrarySelectPath : ICommand
{
    public async Task<object> Execute(object data)
    {
        DialogResult result = Dialog.FolderPicker(LibraryCache.GetLibraryPath());

        Message response = new() {
            Command = "library-get-path",
            Data = ""
        };
        
        if (result.IsOk)
        {
            response.Data = result.Path;
        }

        return response;
    }
}