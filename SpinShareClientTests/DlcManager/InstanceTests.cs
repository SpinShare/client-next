namespace SpinShareClientTests.DlcManager;

[TestClass]
public class InstanceTests
{
    [TestMethod]
    public void GetInstance_AlwaysReturnsSameInstance()
    {
        var instance1 = SpinShareClient.DlcManager.GetInstance();
        var instance2 = SpinShareClient.DlcManager.GetInstance();

        Assert.AreEqual(instance1, instance2);
    }
}