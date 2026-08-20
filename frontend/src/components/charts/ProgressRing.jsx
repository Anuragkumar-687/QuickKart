'use client';

import { motion } from 'framer-motion';

/** Animated progress ring (0–1 of `value/max`). */
export default function ProgressRing({ value = 0, max = 100, size = 150, stroke = 14, label, sublabel }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = max > 0 ? Math.min(1, value / max) : 0;
    return (
        <div className="relative grid place-items-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    initial={{ strokeDashoffset: c }}
                    whileInView={{ strokeDashoffset: c * (1 - pct) }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                />
            </svg>
            <div className="absolute text-center">
                <div className="text-3xl font-bold text-foreground">{Math.round(pct * 100)}%</div>
                {label && <div className="text-xs text-muted-foreground">{label}</div>}
            </div>
        </div>
    );
}
