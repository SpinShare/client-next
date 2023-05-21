namespace SpinShareClient.MessageParser;
using System.Threading.Tasks;

public interface ICommand
{
    Task<object> Execute(object? data);
}