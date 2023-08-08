using System.Collections.Generic;

namespace SpinShareClient.LibraryCache;

/// <summary>
/// Represents the Unity ScriptableObject of a Spin Rhythm XD chart
/// </summary>
public class UnityScriptableObject
{
    public int? clipInfoCount;
    public UnityLargeStringValuesContainer? largeStringValuesContainer;
    public UnityObjectValuesContainer? unityObjectValuesContainer;
}

/// <summary>
/// Represents a generic Unity Engine ScriptableObject large string values container
/// </summary>
public class UnityLargeStringValuesContainer
{
    public List<UnityLargeStringValue> values = new();
}

/// <summary>
/// Represents a generic Unity Engine ScriptableObject large string value
/// </summary>
public class UnityLargeStringValue
{
    public string? key;
    public int? loadedGenerationId;
    public string? val;
}


/// <summary>
/// Represents a generic Unity Engine ScriptableObject object values container
/// </summary>
public class UnityObjectValuesContainer
{
    public List<UnityObjectValue> values = new();
}

/// <summary>
/// Represents a generic Unity Engine ScriptableObject object value
/// </summary>
public class UnityObjectValue
{
    public string? fullType;
    public string? jsonKey;
    public string? key;
}