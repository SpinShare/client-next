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
}