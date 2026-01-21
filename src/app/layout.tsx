import type { Metadata } from "next";
import "./globals.css";
import { getBranding } from "@/config/branding";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
