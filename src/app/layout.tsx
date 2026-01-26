import type { Metadata } from "next";
import "./globals.css";
import { getBranding } from "@/config/branding";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Converts a hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Lightens a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return rgbToHex(
    rgb.r + (255 - rgb.r) * percent,
    rgb.g + (255 - rgb.g) * percent,
    rgb.b + (255 - rgb.b) * percent
  );
}

/**
 * Darkens a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return rgbToHex(
    rgb.r * (1 - percent),
    rgb.g * (1 - percent),
    rgb.b * (1 - percent)
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = getBranding();

  return {
    title: `${branding.companyName} - AI Support Dashboard`,
    description: `AI-powered support dashboard for ${branding.companyName}`,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get company branding for CSS variables
  const branding = getBranding();

  // Calculate color variants
  const primaryColor = branding.primaryColor;
  const primaryColorLight = lightenColor(primaryColor, 0.3); // 30% lighter
  const primaryColorLighter = lightenColor(primaryColor, 0.5); // 50% lighter
  const primaryColorDark = darkenColor(primaryColor, 0.2); // 20% darker
  const primaryColorDarker = darkenColor(primaryColor, 0.4); // 40% darker

  // Get RGB values for alpha variants
  const rgb = hexToRgb(primaryColor);
  const primaryColorRgb = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "0, 102, 204";

  // CSS variables to inject
  const cssVariables = {
    "--primary-color": primaryColor,
    "--primary-color-light": primaryColorLight,
    "--primary-color-lighter": primaryColorLighter,
    "--primary-color-dark": primaryColorDark,
    "--primary-color-darker": primaryColorDarker,
    "--primary-color-rgb": primaryColorRgb,
    "--company-name": `"${branding.companyName}"`,
  } as React.CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning>
      <body style={cssVariables}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
