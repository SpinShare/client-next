using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace SpinShareClient.MessageParser;

public class CommandOpenInExplorer : ICommand
{
    public async Task<object> Execute(object? data)
    {
        if (data == null) return false;
        var path = data.ToString();
        
        if (!System.IO.Directory.Exists(path)) return false;

        string cmd;
        switch (Environment.OSVersion.Platform)
        {
            case PlatformID.Unix:
                cmd = "xdg-open";
                break;
            case PlatformID.Win32NT:
                cmd = "explorer.exe";
                break;
            case PlatformID.MacOSX:
                cmd = "open";
                break;
            default:
                throw new Exception("Unknown platform");
        }
        
        Process openExplorerProcess = new Process();
        openExplorerProcess.StartInfo.FileName = cmd;
        openExplorerProcess.StartInfo.Arguments = "\"" + path + "\"";
        openExplorerProcess.StartInfo.UseShellExecute = false;
        openExplorerProcess.StartInfo.CreateNoWindow = true;
        openExplorerProcess.Start();
        
        await Task.Yield();

        return true;
    }
}