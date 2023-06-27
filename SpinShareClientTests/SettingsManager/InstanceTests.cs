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
}