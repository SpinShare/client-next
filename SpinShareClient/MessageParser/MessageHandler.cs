using Newtonsoft.Json;
using PhotinoNET;
using Sentry;

namespace SpinShareClient.MessageParser;

public class MessageHandler
{
    private readonly CommandFactory _commandFactory = new();

    /// <summary>
    /// Message Handler for Photino
    /// </summary>
    /// <param name="sender">Reference to the sending <see cref="PhotinoWindow"/></param>
    /// <param name="message">JSON Message</param>
    /// <exception cref="ArgumentNullException">Sender <see cref="PhotinoWindow"/> was not set</exception>
    /// <exception cref="Exception">Command is not registered</exception>
    public async void RegisterWebMessageReceivedHandler(object? sender, string message)
    {
        var window = (PhotinoWindow?)sender;
        if (window == null)
        {
            throw new ArgumentNullException($"[MessageHandler] {nameof(sender)} must be of type PhotinoWindow");
        }
        
        var msg = JsonConvert.DeserializeObject<Message>(message);
        if (msg?.Command == null) return;
        
        var command = _commandFactory.GetCommand(msg.Command);
        if (command == null) 
        {
            throw new Exception($"[MessageHandler] Command {msg.Command} is not registered.");
        }
        
        await command.Execute(window, msg.Data);
    }

    /// <summary>
    /// Sends a message back to JavaScript
    /// </summary>
    /// <param name="sender"><see cref="PhotinoWindow"/> to send the message to</param>
    /// <param name="result">Payload data for the response</param>
    public static void SendResponse(PhotinoWindow? sender, object result)
    {
        if (sender == null) return;

        try
        {
            var resultJson = JsonConvert.SerializeObject(result);
            sender?.SendWebMessage(resultJson);
        }
        catch (Exception ex)
        {
            SentrySdk.CaptureException(ex);
            return;
        }
    }
}