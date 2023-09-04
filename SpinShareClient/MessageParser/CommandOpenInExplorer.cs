using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that opens a <c>path</c> in the OS explorer/finder
/// </summary>
/// <remarks>
/// Does nothing if the <c>path</c> does not exist.
/// </remarks>
public class CommandOpenInExplorer : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        if (data == null) return;
        var path = data.ToString();
        
        if (!Directory.Exists(path)) return;

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
        openExplorerProcess.StartInfo.Arguments = $@"""{path}""";
        openExplorerProcess.StartInfo.UseShellExecute = false;
        openExplorerProcess.StartInfo.CreateNoWindow = true;
        openExplorerProcess.Start();
        
        await Task.Yield();
    }
}