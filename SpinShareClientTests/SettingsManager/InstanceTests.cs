namespace SpinShareClientTests.SettingsManager;

[TestClass]
public class InstanceTests
{
    [TestMethod]
    public void GetInstance_AlwaysReturnsSameInstance()
    {
        var instance1 = SpinShareClient.SettingsManager.GetInstance();
        var instance2 = SpinShareClient.SettingsManager.GetInstance();

        Assert.AreEqual(instance1, instance2);
    }

    [TestMethod]
    public void GetLibraryPath_ReturnsCorrectPath()
    {
        var result = SpinShareClient.SettingsManager.GetLibraryPath();
        
        StringAssert.Contains(result, "Super Spin Digital");
        StringAssert.Contains(result, "Spin Rhythm XD");
        StringAssert.Contains(result, "Custom");
    }
}