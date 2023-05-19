namespace SpinShareClient.LibraryCache;

public class UnityScriptableObject
{
    public int clipInfoCount;
    public UnityLargeStringValuesContainer largeStringValuesContainer;
    public UnityObjectValuesContainer unityObjectValuesContainer;
}

public class UnityLargeStringValuesContainer
{
    public List<UnityLargeStringValue> values;
}

public class UnityLargeStringValue
{
    public string key;
    public int loadedGenerationId;
    public string val;
}

public class UnityObjectValuesContainer
{
    public List<UnityObjectValue> values;
}

public class UnityObjectValue
{
    public string fullType;
    public string jsonKey;
    public string key;
}