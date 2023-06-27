namespace SpinShareClientTests;

[TestClass]
public class LibraryCacheTests
{
    [TestMethod]
    public void GetInstance_AlwaysReturnsSameInstance()
    {
        var instance1 = LibraryCache.GetInstance();
        var instance2 = LibraryCache.GetInstance();

        Assert.AreEqual(instance1, instance2);
    }

    [TestMethod]
    public void GetLibraryPath_OnWindows_ReturnsCorrectPath()
    {
        LibraryCache.GetPlatform = () => PlatformID.Win32NT;
        
        var result = LibraryCache.GetLibraryPath();
        
        StringAssert.Contains(result, "\\AppData\\LocalLow\\Super Spin Digital\\Spin Rhythm XD\\Custom");
    }

    [TestMethod]
    public void GetLibraryPath_OnUnix_ReturnsCorrectPath()
    {
        LibraryCache.GetPlatform = () => PlatformID.Unix;
        
        var result = LibraryCache.GetLibraryPath();

        Assert.AreEqual(result, ".steam\\steam\\steamapps\\compatdata\\1058830\\pfx\\drive_c\\users\\steamuser\\AppData\\LocalLow\\Super Spin Digital\\Spin Rhythm XD\\Custom");
    }

    [TestMethod]
    public void GetLibraryPath_OnMac_ReturnsCorrectPath()
    {
        LibraryCache.GetPlatform = () => PlatformID.MacOSX;
        
        var result = LibraryCache.GetLibraryPath();

        Assert.AreEqual(result, "Library\\Application Support\\Steam\\steamapps\\common\\Spin Rhythm\\Custom");
    }
    
    [TestCleanup]
    public void Cleanup()
    {
        LibraryCache.GetPlatform = () => Environment.OSVersion.Platform;
    }
}