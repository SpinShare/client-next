using PhotinoNET;

namespace SpinShareClient.MessageParser;
using System.Threading.Tasks;

public interface ICommand
{
    Task Execute(PhotinoWindow? sender, object? data);
}