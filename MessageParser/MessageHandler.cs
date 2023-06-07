using Newtonsoft.Json;
using PhotinoNET;

namespace SpinShareClient.MessageParser;

public class MessageHandler
{
    private CommandFactory _commandFactory;

    public MessageHandler()
    {
        _commandFactory = new CommandFactory();
    }

    public async void RegisterWebMessageReceivedHandler(object? sender, string message)
    {
        var window = (PhotinoWindow?)sender;
        
        var msg = JsonConvert.DeserializeObject<Message>(message);
        if (msg?.Command == null) return;
        
        var command = _commandFactory.GetCommand(msg.Command);
        
        await command.Execute(window, msg.Data);
    }

    public static void SendResponse(PhotinoWindow? sender, object result)
    {
        if (sender == null) return;
        
        var resultJson = JsonConvert.SerializeObject(result);
        sender?.SendWebMessage(resultJson);
    }
}