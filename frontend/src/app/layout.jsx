import "./globals.css";
import { Providers } from "../components/Providers";
import LayoutWrapper from "../components/LayoutWrapper";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: "QuickKart — Shop the best deals online",
  description:
    "Electronics, fashion, home and more at prices tuned to your region. Free delivery, easy returns.",
};

// Dark is the default; an explicit light preference wins.
const themeScript = `(function(){try{if(localStorage.getItem('theme')!=='light'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
