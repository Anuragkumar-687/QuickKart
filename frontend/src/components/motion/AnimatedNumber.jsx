'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion, animate } from 'framer-motion';

/** Counts up to `value` when scrolled into view. */
export default function AnimatedNumber({ value, duration = 1.5, decimals = 0, suffix = '', className }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const reduced = useReducedMotion();
    const [val, setVal] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduced) {
            setVal(value);
            return;
        }
        const controls = animate(0, value, {
            duration,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => setVal(v),
        });
        return () => controls.stop();
    }, [inView, value, reduced, duration]);

    const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();

    return (
        <span ref={ref} className={className}>
            {display}
            {suffix}
        </span>
    );
}
