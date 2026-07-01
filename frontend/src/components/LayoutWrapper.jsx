'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import SmoothScroll from './motion/SmoothScroll';

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    // Auth pages own the full viewport (no chrome, no smooth-scroll).
    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <SmoothScroll />
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
        </div>
    );
}
