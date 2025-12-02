'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                {children}
            </div>
        </>
    );
}
