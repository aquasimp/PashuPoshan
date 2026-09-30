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
  openGraph: {
    title: "PashuPoshan — AI-Powered Feed & Silage Intelligence",
    description: "Smart AI-Enabled Rapid Feed and Silage Quality Testing System for Dairy Farmers (SIH26111)",
    type: "website",
    siteName: "PashuPoshan",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EC" },
    { media: "(prefers-color-scheme: dark)", color: "#030303" },
  ],
  width: "device-width",
  initialScale: 1,
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('feedshield-theme') || localStorage.getItem('pashuposhan-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'dark' || (stored === 'system' && prefersDark) || (!stored && prefersDark)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }

                var storedEffects = localStorage.getItem('feedshield-effects');
                var prefersReducedTrans = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
                if (storedEffects === 'reduced' || (storedEffects === 'auto' && prefersReducedTrans) || (!storedEffects && prefersReducedTrans)) {
                  document.documentElement.classList.add('effects-reduced');
                } else {
                  document.documentElement.classList.add('effects-full');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-bg-0 text-ink-1 min-h-screen pb-20 lg:pb-0 selection:bg-moss/20 selection:text-forest transition-colors duration-200">
        <div className="ambient-glow-layer" aria-hidden="true" />
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
                      console.log('FeedShield SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('FeedShield SW registration failed:', err);
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
