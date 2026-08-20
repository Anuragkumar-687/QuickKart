'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Short, firm easing. The old expo-out over 700ms made every section feel like
// it was floating in; a storefront should feel like it snaps into place.
export const EASE = [0.25, 0.8, 0.3, 1];

/**
 * Scroll-reveal wrapper (fade + small rise).
 * NOTE: applies a transform, so don't wrap `position: sticky` containers.
 */
export default function Reveal({
    children,
    as = 'div',
    delay = 0,
    y = 12,
    duration = 0.32,
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
            viewport={{ once, margin: '-40px' }}
            transition={{ duration, delay, ease: EASE }}
            {...rest}
        >
            {children}
        </MotionTag>
    );
}
