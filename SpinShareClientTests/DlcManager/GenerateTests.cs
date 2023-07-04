namespace SpinShareClientTests.DlcManager;

[TestClass]
public class GenerateTests
{
    private SpinShareClient.DlcManager? _dlcManager;
    private string? _testFilePath;
    private string _expectedMd5 = "0cbc6611f5540bd0809a388dc95a615b";
    
    [TestInitialize]
    public void Setup()
    {
        _dlcManager = new SpinShareClient.DlcManager();

        _testFilePath = Path.GetTempFileName();
        File.WriteAllText(_testFilePath, "Test");
    }

    [TestMethod]
    public async Task GenerateMD5_GivenFilePath_ShouldReturnCorrectMD5()
    {
        Assert.IsNotNull(_dlcManager);
        Assert.IsNotNull(_testFilePath);
        
        string actualMd5 = await _dlcManager.GenerateMd5(_testFilePath);
        
        Assert.AreEqual(_expectedMd5, actualMd5);
    }

    [TestCleanup]
    public void Cleanup()
    {
        Assert.IsNotNull(_testFilePath);
        File.Delete(_testFilePath);
    }
}