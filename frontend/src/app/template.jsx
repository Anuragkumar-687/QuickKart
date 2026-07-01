'use client';

import { motion } from 'framer-motion';

// Page transition. Opacity-only on purpose: a transform here would create a
// containing block and break `position: sticky` / the floating navbar.
export default function Template({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}
