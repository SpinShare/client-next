namespace SpinShareClientTests.SettingsManager;

[TestClass]
public class AppFolderTests
{
    private static string _expectedAppFolderPath = "";

    [ClassInitialize]
    public static void ClassInit(TestContext context)
    {
        string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        _expectedAppFolderPath = Path.Combine(localAppData, "SpinShare");
    }

    [TestMethod]
    public void GetAppFolder_ReturnsCorrectPath()
    {
        var result = SpinShareClient.SettingsManager.GetAppFolder();

        Assert.AreEqual(_expectedAppFolderPath, result);
    }

    [TestMethod]
    public void GetAppFolder_CreatesDirectory_IfNotExists()
    {
        try
        {
            if (Directory.Exists(_expectedAppFolderPath))
                Directory.Delete(_expectedAppFolderPath);
        } catch(IOException) {}

        var result = SpinShareClient.SettingsManager.GetAppFolder();

        Assert.IsTrue(Directory.Exists(_expectedAppFolderPath));
    }

    [TestCleanup]
    public void TestCleanup()
    {
        try
        {
            if(Directory.Exists(_expectedAppFolderPath))
                Directory.Delete(_expectedAppFolderPath);
        } catch(IOException) {}
    }
}