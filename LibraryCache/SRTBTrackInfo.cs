using System.Collections.Generic;

namespace SpinShareClient.LibraryCache;

public class SRTBTrackInfo
{
    public SRTBTrackInfoAlbumArtReference? albumArtReference;
    public string? artistName;
    public string? title;
    public string? charter;
    public List<SRTBTrackInfoDifficulty> difficulties = new();
}

public class SRTBTrackInfoAlbumArtReference
{
    public string assetName;
}

public class SRTBTrackInfoDifficulty
{
    public bool _active;
    public string assetName;
    public SRTBTrackData.DifficultyType _difficulty;
}