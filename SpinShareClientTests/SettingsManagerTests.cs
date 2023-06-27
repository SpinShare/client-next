namespace SpinShareClientTests;

public class SettingsManagerTests
{
    [TestMethod]
    public void GetInstance_AlwaysReturnsSameInstance()
    {
        var instance1 = SettingsManager.GetInstance();
        var instance2 = SettingsManager.GetInstance();

        Assert.AreEqual(instance1, instance2);
    }
}