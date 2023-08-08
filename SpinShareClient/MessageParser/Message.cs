namespace SpinShareClient.MessageParser;

/// <summary>
/// A message between <see cref="PhotinoNET.PhotinoWindow"/> and the UI 
/// </summary>
public class Message
{
    public string Command { get; set; } = "";
    public object? Data { get; set; }
}