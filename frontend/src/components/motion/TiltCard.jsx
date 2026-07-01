'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/**
 * Subtle 3D tilt that follows the cursor, with a soft glare highlight.
 * Wrap a card's contents; the tilt is GPU-friendly (only runs on hover).
 */
export default function TiltCard({ children, className, max = 7, glare = true }) {
    const ref = useRef(null);
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const reduced = useReducedMotion();

    // All hooks are unconditional (Rules of Hooks).
    const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 150, damping: 16 });
    const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 150, damping: 16 });
    const glareBg = useTransform(
        [px, py],
        ([gx, gy]) => `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgba(255,255,255,0.18), transparent 45%)`
    );

    const onMove = (e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
    };
    const reset = () => {
        px.set(0.5);
        py.set(0.5);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={reset}
            style={{
                rotateX: reduced ? 0 : rotateX,
                rotateY: reduced ? 0 : rotateY,
                transformPerspective: 1000,
                transformStyle: 'preserve-3d',
            }}
            className={`relative ${className || ''}`}
        >
            {children}
            {glare && !reduced && (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: glareBg }}
                />
            )}
        </motion.div>
    );
}
