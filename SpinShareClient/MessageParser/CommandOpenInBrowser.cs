using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that opens an <c>url</c> in the OS default browser
/// </summary>
public class CommandOpenInBrowser : ICommand
{
    private readonly ILogger<CommandOpenInBrowser> _logger;

    public CommandOpenInBrowser(ServiceProvider serviceProvider)
    {
        _logger = serviceProvider.GetRequiredService<ILogger<CommandOpenInBrowser>>();
    }
    
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