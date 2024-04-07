namespace SpinShareClient;

using System;
using System.Runtime.InteropServices;

/// <summary>
/// The ScreenScaleFactor class provides a method to retrieve the scaling factor of the application's current display.
/// </summary>
public static class ScreenScaleFactor
{
    /// <summary>
    /// Retrieves the scaling factor of the application's current display.
    /// </summary>
    /// <returns>
    /// The scaling factor as a floating-point value.
    /// On Windows, the scaling factor is retrieved by querying the device context's LOGPIXELSX value and dividing it by 96.
    /// On other operating systems, the scaling factor is fixed at 1.0 (corresponding to 100% scaling).
    /// </returns>
    public static float Get()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            IntPtr desktop = GetDC(IntPtr.Zero);
            float dpi = GetDeviceCaps(desktop, 88); // 88 = LOGPIXELSX
            ReleaseDC(IntPtr.Zero, desktop);
            return dpi / 96f;
        }
        else 
        {
            // For other OS, just return a factor of 1
            return 1.0f;
        } 
    }

    [DllImport("user32.dll")]
    private static extern IntPtr GetDC(IntPtr ptr);

    [DllImport("user32.dll")]
    private static extern bool ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("gdi32.dll")]
    private static extern int GetDeviceCaps(IntPtr hdc, int nIndex);
}