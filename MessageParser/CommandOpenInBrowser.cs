using System.Diagnostics;
using System.Threading.Tasks;

namespace SpinShareClient.MessageParser;

public class CommandOpenInBrowser : ICommand
{
    public async Task<object> Execute(object? data)
    {
        if (data == null) return false;
        var url = data.ToString();

        Process openBrowserProcess = new Process();
        openBrowserProcess.StartInfo.UseShellExecute = true;
        openBrowserProcess.StartInfo.FileName = url;
        openBrowserProcess.Start();

        await Task.Yield();

        return true;
    }
}