import "./globals.css";
import { Providers } from "../components/Providers";
import LayoutWrapper from "../components/LayoutWrapper";
import AuroraBackground from "../components/motion/AuroraBackground";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: "QuickKart — Premium AI Commerce",
  description: "A premium, region-aware commerce platform with personalized recommendations and trending products.",
};

// Default to the premium dark theme; honour an explicit light preference.
const themeScript = `(function(){try{if(localStorage.getItem('theme')!=='light'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuroraBackground />
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
