import "./globals.css";
import { Providers } from "../components/Providers";
import LayoutWrapper from "../components/LayoutWrapper";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: "QuickKart - Your E-Commerce Store",
  description: "Shop the best products at QuickKart",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
