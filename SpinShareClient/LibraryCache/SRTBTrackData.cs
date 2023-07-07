namespace SpinShareClient.LibraryCache;

/// <summary>
/// Represents the track data of a Spin Rhythm XD chart
/// </summary>
public class SRTBTrackData
{
    /// <summary>
    /// Represents the difficulty rating of this <see cref="SRTBTrackData"/>
    /// </summary>
    public int? difficultyRating;
    /// <summary>
    /// Represents the difficulty type of this <see cref="SRTBTrackData"/>
    /// </summary>
    public DifficultyType? difficultyType;

    /// <summary>
    /// Represents the difficulty type of a Spin Rhythm XD chart
    /// </summary>
    public enum DifficultyType {
        Unknown = 0,
        Easy = 2,
        Normal = 3,
        Hard = 4,
        Expert = 5,
        XD = 6,
    }
}