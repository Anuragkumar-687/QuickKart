'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '../../lib/format';

// three.js stays out of the main bundle — it only loads for users who can use it.
const WebGLSlides = dynamic(() => import('./WebGLSlides'), { ssr: false });

const AUTOPLAY_MS = 6000;

/**
 * Non-WebGL path: reduced-motion users always land here, and everyone does if
 * the shader can't start. It mirrors the WebGL composition — product contained
 * on a light plate over a warm backdrop — rather than stretching a square
 * cut-out to cover a 3:1 frame, which cropped it into an unrecognisable blur.
 */
function Fallback({ slide }) {
    return (
        <div
            className="absolute inset-0 overflow-hidden"
            style={{ background: 'linear-gradient(100deg, #0e0e10 0%, #1c1710 55%, #241a0b 100%)' }}
        >
            {/* Deliberately not animated in from opacity 0. This is the safety
                net: if the animation never runs, the product must still be on
                screen. The dots and the copy already signal the slide change. */}
            <div className="plate absolute left-1/2 top-5 h-[40%] w-[74%] -translate-x-1/2 overflow-hidden rounded-2xl sm:left-auto sm:right-[4%] sm:top-1/2 sm:h-[82%] sm:w-[45%] sm:translate-x-0 sm:-translate-y-1/2">
                <Image
                    key={slide.id}
                    src={slide.image}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 640px) 74vw, 45vw"
                    className="object-contain p-5"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent sm:bg-gradient-to-r sm:from-black/70 sm:via-black/25 sm:to-transparent" />
        </div>
    );
}

export default function DealHero({ products = [], loading }) {
    const reduced = useReducedMotion();
    const [index, setIndex] = useState(0);
    const [useWebGL, setUseWebGL] = useState(true);
    const [paused, setPaused] = useState(false);
    const rootRef = useRef(null);

    const slides = useMemo(
        () => products.filter((p) => p?.image).slice(0, 5),
        [products],
    );
    const images = useMemo(() => slides.map((s) => s.image), [slides]);

    // Reduced motion gets the plain crossfade, never the shader.
    const webglEnabled = useWebGL && !reduced && slides.length > 0;

    useEffect(() => {
        if (paused || reduced || slides.length < 2) return;
        const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
        return () => clearTimeout(t);
    }, [index, paused, reduced, slides.length]);

    if (loading) {
        return <div className="skeleton mx-auto h-[420px] w-full max-w-[1400px] rounded-none sm:rounded-2xl" />;
    }
    if (slides.length === 0) return null;

    const slide = slides[index];
    const go = (dir) => setIndex((i) => (i + dir + slides.length) % slides.length);

    return (
        <section
            ref={rootRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className="relative mx-auto w-full max-w-[1400px] overflow-hidden bg-black sm:rounded-2xl"
            aria-roledescription="carousel"
            aria-label="Featured products"
        >
            <div className="relative h-[420px] sm:h-[420px] lg:h-[460px]">
                {webglEnabled ? (
                    <WebGLSlides images={images} index={index} onFail={() => setUseWebGL(false)} />
                ) : (
                    <Fallback slide={slide} />
                )}

                {/* Copy overlay */}
                <div className="relative z-10 flex h-full items-end pb-20 sm:items-center sm:pb-0">
                    {/* Sequential, not overlapping: two headlines crossfading on
                        top of each other is unreadable. The exit is kept short
                        so the hero is never text-less for long. A reserved
                        min-height stops the swap from shifting layout. */}
                    <div className="relative min-h-[210px] w-full max-w-xl px-6 sm:min-h-[248px] sm:px-10">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={slide.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{
                                    duration: 0.4,
                                    ease: [0.25, 0.8, 0.3, 1],
                                    exit: { duration: 0.18 },
                                }}
                                className="absolute inset-x-6 top-0 sm:inset-x-10"
                            >
                                {slide.category && (
                                    <span
                                        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                                        className="inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        {slide.category}
                                    </span>
                                )}
                                <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                                    {slide.name}
                                </h2>
                                <p className="mt-3 flex items-baseline gap-2 text-white/90">
                                    <span className="price text-2xl text-white">{formatPrice(slide.price)}</span>
                                </p>
                                <Link
                                    href={`/products/${slide.id || slide._id}`}
                                    className="btn btn-primary btn-lg mt-6"
                                >
                                    Shop now <ArrowRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {slides.length > 1 && (
                    <>
                        <div className="absolute bottom-4 right-4 z-20 hidden items-center gap-2 sm:flex">
                            <button
                                onClick={() => go(-1)}
                                aria-label="Previous product"
                                className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/75"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => go(1)}
                                aria-label="Next product"
                                className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/75"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="absolute bottom-5 left-6 z-20 flex items-center gap-2 sm:bottom-4 sm:left-10">
                            {slides.map((s, i) => (
                                <button
                                    key={s.id || i}
                                    onClick={() => setIndex(i)}
                                    aria-label={`Go to product ${i + 1}`}
                                    aria-current={i === index}
                                    className="group h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                        width: i === index ? '2rem' : '0.75rem',
                                        backgroundColor: i === index ? 'var(--primary)' : 'rgba(255,255,255,0.45)',
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
