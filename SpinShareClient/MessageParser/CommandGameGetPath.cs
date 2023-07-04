using PhotinoNET;

namespace SpinShareClient.MessageParser;

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