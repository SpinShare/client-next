using PhotinoNET;

namespace SpinShareClient.MessageParser;
using System.Threading.Tasks;

/// <summary>
/// A command from the UI that executes code
/// </summary>
public interface ICommand
{
    Task Execute(PhotinoWindow? sender, object? data);
}