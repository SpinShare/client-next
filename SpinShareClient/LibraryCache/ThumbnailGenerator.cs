using System.Threading.Tasks;

namespace SpinShareClient.LibraryCache;

using System;
using System.IO;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

public static class ThumbnailGenerator
{
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