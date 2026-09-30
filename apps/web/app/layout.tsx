import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "PashuPoshan — AI-Powered Feed & Silage Intelligence",
  description: "Smart AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers (SIH26111)",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F4D3A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F4D3A" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('pashuposhan-theme') || localStorage.getItem('feedshield-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (stored === 'system' && prefersDark) || (!stored && prefersDark)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-ivory dark:bg-dark-bg text-ink dark:text-dark-ink min-h-screen selection:bg-moss/20 selection:text-forest transition-colors duration-200">
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('PashuPoshan SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('PashuPoshan SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
