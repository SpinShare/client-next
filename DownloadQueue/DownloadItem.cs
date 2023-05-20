namespace SpinShareClient.DownloadQueue;

public class DownloadItem
{
    public int? ID;
    public string? Title;
    public string? Artist;
    public string? Charter;
    public string? Cover;
    public string? SpinShareReference;
    public DownloadState State = DownloadState.Queued;
}

public enum DownloadState
{
    Queued,
    Downloading,
    Extracting,
    Copying,
    Caching,
    Done,
}