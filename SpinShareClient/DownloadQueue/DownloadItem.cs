namespace SpinShareClient.DownloadQueue;

/// <summary>
/// An item of the <see cref="DownloadQueue"/>
/// </summary>
public class DownloadItem
{
    public int? ID;
    public string? Title;
    public string? Artist;
    public string? Charter;
    public string? Cover;
    public string? FileReference;
    public DownloadState State = DownloadState.Queued;
}

/// <summary>
/// The state of a <see cref="DownloadItem"/>
/// </summary>
public enum DownloadState
{
    /// <summary>
    /// This <see cref="DownloadItem"/> is waiting in the queue
    /// </summary>
    Queued,
    
    /// <summary>
    /// This <see cref="DownloadItem"/> Backup.zip is getting downloaded
    /// </summary>
    Downloading,
    
    /// <summary>
    /// This <see cref="DownloadItem"/> Backup.zip is getting extracted to a temporary folder
    /// </summary>
    Extracting,
    
    /// <summary>
    /// This <see cref="DownloadItem"/> is getting copied to the library
    /// </summary>
    Copying,
    
    /// <summary>
    /// This <see cref="DownloadItem"/> is getting cached
    /// </summary>
    Caching,
    
    /// <summary>
    /// This <see cref="DownloadItem"/> is fully processed
    /// </summary>
    Done,
}