using System.Collections.Generic;

namespace SpinShareClient.LibraryCache;

/// <summary>
/// Represents the track info of a Spin Rhythm XD chart
/// </summary>
public class SRTBTrackInfo
{
    /// <summary>
    /// A reference to the album art of this <see cref="SRTBTrackInfo"/>
    /// </summary>
    public SRTBTrackInfoAlbumArtReference? albumArtReference;
    public string? artistName;
    public string? title;
    public string? charter;
    public List<SRTBTrackInfoDifficulty> difficulties = new();
}

/// <summary>
/// Represents the album art reference of a <see cref="SRTBTrackInfo"/>
/// </summary>
public class SRTBTrackInfoAlbumArtReference
{
    /// <summary>
    /// A relative path to the album art
    /// </summary>
    public string assetName = "";
}

/// <summary>
/// Represents the track info difficulty of a <see cref="SRTBTrackInfo"/>
/// </summary>
public class SRTBTrackInfoDifficulty
{
    /// <summary>
    /// Whether this <see cref="SRTBTrackInfoDifficulty"/> is active
    /// </summary>
    public bool _active = false;
    /// <summary>
    /// The key of the track info of this <see cref="SRTBTrackInfoDifficulty"/>
    /// </summary>
    public string assetName = "";
    /// <summary>
    /// The difficulty type of this <see cref="SRTBTrackInfoDifficulty"/>
    /// </summary>
    public SRTBTrackData.DifficultyType _difficulty = SRTBTrackData.DifficultyType.Unknown;
}