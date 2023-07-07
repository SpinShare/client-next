using System.Threading.Tasks;

namespace SpinShareClient.LibraryCache;

using System;
using System.IO;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

public static class ThumbnailGenerator
{
    /// <summary>
    /// Generates a base64 thumbnail given a <c>imagePath</c>
    /// </summary>
    /// <remarks>
    /// The thumbnail will be a 96x96 jpeg
    /// </remarks>
    /// <param name="imagePath">Path as <see cref="String"/></param>
    /// <returns>base64 thumbnail as <see cref="String"/></returns>
    /// <exception cref="ArgumentException"><c>imagePath</c> is not given</exception>
    /// <exception cref="FileNotFoundException"><c>imagePath</c> is not a valid file</exception>
    public static async Task<string> ToBase64(string imagePath)
    {
        if (string.IsNullOrEmpty(imagePath))
        {
            throw new ArgumentException("Image path must be provided.", nameof(imagePath));
        }

        if (!File.Exists(imagePath))
        {
            throw new FileNotFoundException($"No image found at {imagePath}");
        }

        using var image = await Image.LoadAsync(imagePath);
        image.Mutate(x => x.Resize(96, 96));

        using var memoryStream = new MemoryStream();
        await image.SaveAsJpegAsync(memoryStream);

        var base64String = Convert.ToBase64String(memoryStream.ToArray());

        // Return Data URL
        return $"data:image/jpeg;base64,{base64String}";
    }
}