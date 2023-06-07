using System;
using System.Diagnostics;
using System.Threading.Tasks;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

public class CommandOpenInExplorer : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        if (data == null) return;
        var path = data.ToString();
        
        if (!System.IO.Directory.Exists(path)) return;

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
    }
}