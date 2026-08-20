'use client';

import { gsap } from 'gsap';

/**
 * Flies a clone of the product image into the navbar cart icon.
 *
 * Purely decorative feedback layered on top of the real request — it never
 * gates or delays the cart mutation, and it silently no-ops when the source
 * image or the cart target isn't on screen (mobile menu closed, reduced
 * motion, etc.).
 */
export function flyToCart(sourceEl) {
    if (typeof window === 'undefined' || !sourceEl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const target = document.querySelector('[data-cart-target]');
    if (!target) return;

    const from = sourceEl.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (!from.width || !to.width) return;

    const clone = sourceEl.cloneNode(true);
    Object.assign(clone.style, {
        position: 'fixed',
        left: `${from.left}px`,
        top: `${from.top}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
        margin: '0',
        borderRadius: '12px',
        objectFit: 'cover',
        pointerEvents: 'none',
        zIndex: '100',
        willChange: 'transform, opacity',
    });
    document.body.appendChild(clone);

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);

    gsap.timeline({ onComplete: () => clone.remove() })
        .to(clone, {
            x: dx * 0.5,
            y: dy * 0.5 - 60,
            scale: 0.55,
            duration: 0.34,
            ease: 'power2.out',
        })
        .to(clone, {
            x: dx,
            y: dy,
            scale: 0.08,
            opacity: 0.4,
            duration: 0.32,
            ease: 'power2.in',
        })
        .call(() => {
            // Nudge the cart icon so the arrival registers.
            gsap.fromTo(
                target,
                { scale: 1 },
                { scale: 1.25, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' },
            );
        });
}
