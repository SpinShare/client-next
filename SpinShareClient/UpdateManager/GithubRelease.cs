using Newtonsoft.Json;

namespace SpinShareClient.UpdateManager;

public class GithubRelease
{
    [JsonProperty("url")] public string Url = "";
    [JsonProperty("tag_name")] public string TagName = "";
    [JsonProperty("name")] public string Name = "";
    [JsonProperty("published_at")] public DateTime PublishedAt;
    [JsonProperty("prerelease")] public bool Prerelease;
    [JsonProperty("assets")] public List<ReleaseAssets> Assets = new();
    
    public class ReleaseAssets
    {
        [JsonProperty("url")] public string Url = "";
        [JsonProperty("name")] public string Name = "";
        [JsonProperty("browser_download_url")] public string BrowserDownloadUrl = "";
    }
}