'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/** Register ScrollTrigger once, on the client only. */
export function ensureScrollTrigger() {
    if (!registered && typeof window !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        registered = true;
    }
    return ScrollTrigger;
}

/**
 * Runs a GSAP setup function inside a scoped context, cleaning up every
 * tween and ScrollTrigger it created on unmount.
 *
 * The callback receives the scope element. It is skipped entirely when the
 * user prefers reduced motion, so callers must ensure their markup is already
 * in its final visible state before animating (never animate *from* opacity 0
 * in CSS — do it in the tween, so reduced-motion users still see content).
 */
export function useGsapScope(setup, deps = []) {
    const scopeRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced || !scopeRef.current) return;

        ensureScrollTrigger();
        const ctx = gsap.context((self) => setup(self, scopeRef.current), scopeRef);
        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return scopeRef;
}
