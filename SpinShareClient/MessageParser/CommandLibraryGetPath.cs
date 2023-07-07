using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that returns the default Spin Rhythm XD library path
/// </summary>
public class CommandLibraryGetPath : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        Message response = new() {
            Command = "library-get-path-response",
            Data = SettingsManager.GetLibraryPath()
        };

        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}