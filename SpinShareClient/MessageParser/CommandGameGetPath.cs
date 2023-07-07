using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that returns the default path of a Spin Rhythm XD installation
/// </summary>
public class CommandGameGetPath : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        Message response = new() {
            Command = "game-get-path-response",
            Data = SettingsManager.GetGamePath()
        };

        await Task.Yield();

        MessageHandler.SendResponse(sender, response);
    }
}