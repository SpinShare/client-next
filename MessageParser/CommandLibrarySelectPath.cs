using System.IO;
using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

using NativeFileDialogSharp;
using LibraryCache;

public class CommandLibrarySelectPath : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        string defaultLibraryPath = LibraryCache.GetLibraryPath() ?? "";
        DialogResult result;
        if (Directory.Exists(defaultLibraryPath))
        {
            result = Dialog.FolderPicker(LibraryCache.GetLibraryPath());            
        }
        else
        {
            result = Dialog.FolderPicker();
        }

        Message response = new() {
            Command = "library-get-path-response",
            Data = ""
        };
        
        if (result.IsOk)
        {
            response.Data = result.Path;
        }
        
        Console.WriteLine(result);
        
        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}