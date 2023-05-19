namespace SpinShareClient.MessageParser;

public interface ICommand
{
    Task<object> Execute(object data);
}