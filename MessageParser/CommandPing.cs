namespace SpinShareClient.MessageParser;

public class CommandPing : ICommand
{
    public async Task<object> Execute(object data)
    {
        // simulate some async work
        await Task.Delay(1000);

        Message response = new() {
            Command = "Pong",
            Data = $"Hello, {data.ToString()}!"
        };

        return response;
    }
}