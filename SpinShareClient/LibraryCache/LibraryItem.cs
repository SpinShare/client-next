using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace SpinShareClient.LibraryCache;

public class LibraryItem
{
    public string? FileName;
    public string? Title;
    public string? Artist;
    public string? Charter;
    public string? Cover;
    public int? EasyDifficulty;
    public int? NormalDifficulty;
    public int? HardDifficulty;
    public int? ExpertDifficulty;
    public int? XDDifficulty;
    public string? UpdateHash;
    public string? SpinShareReference;

    public async Task Load(UnityScriptableObject data)
    {
        string? libraryPath = SettingsManager.GetLibraryPath();
        if (libraryPath == null) return;
        
        string? trackInfoJson = data.largeStringValuesContainer?.values.Find(x => x.key != null && x.key.Contains("TrackInfo"))?.val ?? null;
        if (trackInfoJson == null) return;

        SRTBTrackInfo? trackInfo = JsonConvert.DeserializeObject<SRTBTrackInfo>(trackInfoJson) ?? null;
        if (trackInfo == null) return;

        Title = trackInfo.title;
        Artist = trackInfo.artistName;
        Charter = trackInfo.charter;

        foreach (SRTBTrackInfoDifficulty difficulty in trackInfo.difficulties)
        {
            // Skip over inactive difficulties
            if (difficulty._active != true) continue;

            string? trackDataJson = data.largeStringValuesContainer?.values.Find(x => x.key != null && x.key.Contains(difficulty.assetName))?.val ?? null;
            if (trackDataJson == null) continue; // Skip over missing trackdata

            SRTBTrackData? trackData = JsonConvert.DeserializeObject<SRTBTrackData>(trackDataJson) ?? null;
            if (trackData == null) continue; // Skip over broken trackdata

            SRTBTrackData.DifficultyType difficultyType = difficulty._difficulty;

            if (trackData.difficultyType != SRTBTrackData.DifficultyType.Unknown) {
                difficultyType = trackData.difficultyType ?? SRTBTrackData.DifficultyType.Unknown;
            }

            switch (difficultyType)
            {
                case SRTBTrackData.DifficultyType.Easy:
                    EasyDifficulty = trackData.difficultyRating;
                    break;
                case SRTBTrackData.DifficultyType.Normal:
                    NormalDifficulty = trackData.difficultyRating;
                    break;
                case SRTBTrackData.DifficultyType.Hard:
                    HardDifficulty = trackData.difficultyRating;
                    break;
                case SRTBTrackData.DifficultyType.Expert:
                    ExpertDifficulty = trackData.difficultyRating;
                    break;
                case SRTBTrackData.DifficultyType.XD:
                    XDDifficulty = trackData.difficultyRating;
                    break;
            }
        }
        
        // Cover Thumbnail Generation
        string albumArtPath = Path.Combine(libraryPath, "AlbumArt", trackInfo.albumArtReference?.assetName + ".png");
        if (File.Exists(albumArtPath))
        {
            Cover = await ThumbnailGenerator.ToBase64(albumArtPath);
        }
    }
}