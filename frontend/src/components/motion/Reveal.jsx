'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Apple/Linear-style expo-out easing
export const EASE = [0.22, 1, 0.36, 1];

/**
 * Scroll-reveal wrapper (fade + rise) using IntersectionObserver under the hood.
 * NOTE: applies a transform, so don't wrap `position: sticky` containers in it.
 */
export default function Reveal({
    children,
    as = 'div',
    delay = 0,
    y = 24,
    duration = 0.7,
    once = true,
    className,
    ...rest
}) {
    const reduced = useReducedMotion();
    const MotionTag = motion[as] || motion.div;

    if (reduced) {
        const Tag = as;
        return (
            <Tag className={className} {...rest}>
                {children}
            </Tag>
        );
    }

    return (
        <MotionTag
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, margin: '-80px' }}
            transition={{ duration, delay, ease: EASE }}
            {...rest}
        >
            {children}
        </MotionTag>
    );
}
