import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { TabBar, ThemeSwitch } from '@/components/Chrome';
import './globals.css';

export const metadata: Metadata = {
  title: "Marc's Library",
  description: 'Scan a barcode, see the book, change its status.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><text y='14' font-size='14'>📚</text></svg>",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#111111',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeSwitch />
          {children}
          <TabBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
