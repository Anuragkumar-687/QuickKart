'use client';

import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';

/**
 * Lenis smooth scrolling. Disabled when the user prefers reduced motion.
 * Renders nothing — it just drives the native scroll smoothly so Framer
 * `whileInView` (IntersectionObserver) keeps working unchanged.
 */
export default function SmoothScroll() {
    const reduced = useReducedMotion();

    useEffect(() => {
        if (reduced) return;
        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.6,
        });
        let raf;
        const loop = (time) => {
            lenis.raf(time);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            lenis.destroy();
        };
    }, [reduced]);

    return null;
}
