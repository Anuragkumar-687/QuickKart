'use client';

import { motion } from 'framer-motion';

/** Animated horizontal bar list. data: [{ label, value }]. */
export default function BarList({ data = [], format = (v) => v, barClass = 'bg-accent' }) {
    const max = Math.max(1, ...data.map((d) => d.value || 0));
    if (data.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
    return (
        <div className="space-y-3.5">
            {data.map((d, i) => (
                <div key={`${d.label}-${i}`}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-foreground">{d.label}</span>
                        <span className="shrink-0 font-medium text-muted-foreground">{format(d.value)}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                            className={`h-full rounded-full ${barClass}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${((d.value || 0) / max) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
