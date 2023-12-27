using PhotinoNET;

namespace SpinShareClient.MessageParser;

/// <summary>
/// A command that checks whether the current device is a Valve SteamDeck
/// </summary>
public class CommandIsSteamdeck : ICommand
{
    public async Task Execute(PhotinoWindow? sender, object? data)
    {
        Message response = new() {
            Command = "is-steamdeck-response",
            Data = SettingsManager.GetIsSteamDeck()
        };

        MessageHandler.SendResponse(sender, response);

        await Task.Yield();
    }
}