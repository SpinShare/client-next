namespace SpinShareClientTests.SettingsManager;

[TestClass]
public class SettingsFileTests
{
    private string _settingsFilePath = "";

    [TestInitialize]
    public void TestInitialize()
    {
        string appFolderPath = SpinShareClient.SettingsManager.GetAppFolder();
        _settingsFilePath = Path.Combine(appFolderPath, "settings.json");
    }

    [TestMethod]
    public void SettingsFileExists_ReturnsTrue_WhenFileExists()
    {
        File.WriteAllText(_settingsFilePath, "{}");

        var result = SpinShareClient.SettingsManager.SettingsFileExists();

        Assert.IsTrue(result);
    }

    [TestMethod]
    public void SettingsFileExists_ReturnsFalse_WhenFileDoesNotExists()
    {
        if (File.Exists(_settingsFilePath))
        {
            File.Delete(_settingsFilePath);
        }

        var result = SpinShareClient.SettingsManager.SettingsFileExists();

        Assert.IsFalse(result);
    }

    [TestCleanup]
    public void TestCleanup()
    {
        if (File.Exists(_settingsFilePath))
        {
            File.Delete(_settingsFilePath);
        }
    }
}