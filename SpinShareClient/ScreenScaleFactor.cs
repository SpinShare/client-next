using System;
using System.Runtime.InteropServices;

namespace SpinShareClient
{
    public static class ScreenScaleFactor
    {
        /// <summary>
        /// Retrieves the scaling factor of the application's current display.
        /// </summary>
        /// <returns>The scaling factor as a floating-point value.</returns>
        public static float Get()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                IntPtr hWnd = GetForegroundWindow();
                uint dpi = GetDpiForWindow(hWnd);
                return dpi / 96f;
            }
            else
            {
                // For other OS, just return a factor of 1
                return 1.0f;
            }
        }

        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        private static extern uint GetDpiForWindow(IntPtr hWnd);
    }
}