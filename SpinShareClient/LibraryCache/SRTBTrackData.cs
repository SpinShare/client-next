namespace SpinShareClient.LibraryCache;

public class SRTBTrackData
{
    public int? difficultyRating;
    public DifficultyType? difficultyType;

    public enum DifficultyType {
        Unknown = 0,
        Easy = 2,
        Normal = 3,
        Hard = 4,
        Expert = 5,
        XD = 6,
    }
}