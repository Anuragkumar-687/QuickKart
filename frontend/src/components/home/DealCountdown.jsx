'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

/** Real time remaining until local midnight — not a fabricated urgency timer. */
function timeToMidnight() {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const ms = Math.max(0, end - now);
    return {
        h: Math.floor(ms / 3600000),
        m: Math.floor((ms % 3600000) / 60000),
        s: Math.floor((ms % 60000) / 1000),
    };
}

const pad = (n) => String(n).padStart(2, '0');

export default function DealCountdown() {
    const [t, setT] = useState(null);

    // Starts null so server and client markup agree, then ticks on the client.
    useEffect(() => {
        setT(timeToMidnight());
        const id = setInterval(() => setT(timeToMidnight()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!t) return null;

    return (
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
            <Clock className="h-3.5 w-3.5" />
            Ends in
            <span className="num font-bold text-[var(--danger)]">
                {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
            </span>
        </span>
    );
}
