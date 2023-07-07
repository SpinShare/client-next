using System.Diagnostics;
using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that opens an <c>url</c> in the OS default browser
/// </summary>
public class CommandOpenInBrowser : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        if (data == null) return;
        var url = data.ToString();

        Process openBrowserProcess = new Process();
        openBrowserProcess.StartInfo.UseShellExecute = true;
        openBrowserProcess.StartInfo.FileName = url;
        openBrowserProcess.Start();

        await Task.Yield();
    }
}