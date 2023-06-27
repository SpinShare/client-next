namespace SpinShareClientTests.LibraryCache;

[TestClass]
public class InstanceTests
{
    [TestMethod]
    public void GetInstance_AlwaysReturnsSameInstance()
    {
        var instance1 = SpinShareClient.LibraryCache.LibraryCache.GetInstance();
        var instance2 = SpinShareClient.LibraryCache.LibraryCache.GetInstance();

        Assert.AreEqual(instance1, instance2);
    }

    [TestMethod]
    public void GetLibraryPath_OnWindows_ReturnsCorrectPath()
    {
        SpinShareClient.LibraryCache.LibraryCache.GetPlatform = () => PlatformID.Win32NT;
        
        var result = SpinShareClient.LibraryCache.LibraryCache.GetLibraryPath();
        
        StringAssert.Contains(result, "\\AppData\\LocalLow\\Super Spin Digital\\Spin Rhythm XD\\Custom");
    }

    [TestMethod]
    public void GetLibraryPath_OnUnix_ReturnsCorrectPath()
    {
        SpinShareClient.LibraryCache.LibraryCache.GetPlatform = () => PlatformID.Unix;
        
        var result = SpinShareClient.LibraryCache.LibraryCache.GetLibraryPath();

        Assert.AreEqual(result, ".steam\\steam\\steamapps\\compatdata\\1058830\\pfx\\drive_c\\users\\steamuser\\AppData\\LocalLow\\Super Spin Digital\\Spin Rhythm XD\\Custom");
    }

    [TestMethod]
    public void GetLibraryPath_OnMac_ReturnsCorrectPath()
    {
        SpinShareClient.LibraryCache.LibraryCache.GetPlatform = () => PlatformID.MacOSX;
        
        var result = SpinShareClient.LibraryCache.LibraryCache.GetLibraryPath();

        Assert.AreEqual(result, "Library\\Application Support\\Steam\\steamapps\\common\\Spin Rhythm\\Custom");
    }
    
    [TestCleanup]
    public void Cleanup()
    {
        SpinShareClient.LibraryCache.LibraryCache.GetPlatform = () => Environment.OSVersion.Platform;
    }
}