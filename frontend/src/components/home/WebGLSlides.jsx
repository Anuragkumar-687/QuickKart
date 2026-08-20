'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uTex0;
uniform sampler2D uTex1;
uniform vec2 uImg0;
uniform vec2 uImg1;
uniform vec2 uRes;
uniform float uProgress;
uniform float uTime;
uniform vec2 uPointer;
varying vec2 vUv;

// Cheap value noise — enough texture for a liquid edge, no derivatives needed.
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// Rounded-rectangle distance, used to draw the light product plate.
float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// Catalogue art is transparent-background PNG cut-outs, so the product is
// fitted (contain) into a box on the right and composited over the backdrop
// using its own alpha. Stretching it to cover would crop the product, and
// forcing alpha to 1 would paint every transparent pixel black.
vec4 productSample(sampler2D tex, vec2 img, vec2 uv) {
    if (img.x < 1.0 || img.y < 1.0) return vec4(0.0);

    float aspect = uRes.x / max(uRes.y, 1.0);
    float narrow = smoothstep(2.0, 1.15, aspect);
    vec2 boxCenter = vec2(mix(0.72, 0.5, narrow), mix(0.5, 0.29, narrow));
    float boxH = mix(0.80, 0.44, narrow);
    float scale = (boxH * uRes.y) / img.y;
    vec2 sizeUv = vec2((img.x * scale) / uRes.x, boxH);

    vec2 p = (uv - boxCenter) / sizeUv + 0.5;
    if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return vec4(0.0);
    return texture2D(tex, p);
}

void main() {
    float n = noise(vUv * 3.5 + uTime * 0.06);
    vec2 par = uPointer * 0.008;
    float aspect = uRes.x / max(uRes.y, 1.0);

    // Warm, dark backdrop that stays inside the brand palette.
    vec3 bg = mix(vec3(0.055, 0.052, 0.060), vec3(0.135, 0.100, 0.052), smoothstep(0.0, 1.0, vUv.x));

    // Single soft pool of light behind the product, drifting with the pointer.
    vec2 aUv = vec2(vUv.x * aspect, vUv.y);
    vec2 lightPos = vec2(0.72 * aspect, 0.5) + uPointer * 0.03;
    float glow = 1.0 - smoothstep(0.0, 0.62, distance(aUv, lightPos));
    bg += vec3(0.20, 0.125, 0.025) * glow * glow;

    // Light plate behind the product. Same reasoning as the product cards:
    // a dark cut-out on a dark backdrop is unreadable, so give every product
    // a guaranteed light ground to sit on.
    // Portrait viewports stack the composition: plate up top, copy beneath.
    // Side-by-side only works once the hero is meaningfully wider than tall.
    float narrow = smoothstep(2.0, 1.15, aspect);
    vec2 plateCenter = vec2(mix(0.71, 0.5, narrow) * aspect, mix(0.5, 0.29, narrow)) + uPointer * 0.006;
    vec2 plateHalf = vec2(mix(0.255, 0.42, narrow) * aspect, mix(0.42, 0.25, narrow));
    float d = roundedBox(aUv - plateCenter, plateHalf, 0.05);
    float plate = 1.0 - smoothstep(0.0, 0.006, d);
    float plateShadow = 1.0 - smoothstep(-0.02, 0.10, d);
    bg = mix(bg, bg * 0.45, plateShadow * 0.5);
    bg = mix(bg, vec3(0.925, 0.918, 0.906), plate);

    // Noise-roughened wipe carries the outgoing product off to the left.
    float edge = uProgress * 1.7 - 0.35;
    float mask = smoothstep(edge - 0.30, edge + 0.30, vUv.x + (n - 0.5) * 0.40);
    float bulge = sin(uProgress * 3.14159);
    vec2 disp = vec2(n - 0.5) * 0.06 * bulge;

    vec4 a = productSample(uTex0, uImg0, vUv + disp + par);
    vec4 b = productSample(uTex1, uImg1, vUv - disp + par);
    vec4 prod = mix(b, a, mask);

    vec3 color = mix(bg, prod.rgb, clamp(prod.a, 0.0, 1.0));

    // Hold the left side back so the headline always has contrast. The plate
    // is excluded so the product never gets dimmed by the copy gradient.
    float shadeWide = smoothstep(0.70, 0.02, vUv.x);
    float shadeTall = smoothstep(0.42, 1.0, vUv.y);
    float shade = mix(shadeWide, shadeTall, narrow) * (1.0 - plate);
    color *= mix(1.0, 0.62, shade);

    gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * WebGL slide stage. Renders the current and incoming slide into a single
 * full-bleed quad and morphs between them with a noise-driven wipe.
 *
 * Textures are requested through Next's image optimizer so they're served
 * same-origin — remote CDN images would otherwise taint the WebGL context.
 * Calls `onFail` if WebGL or texture decoding doesn't work out, letting the
 * parent fall back to plain DOM images.
 */
export default function WebGLSlides({ images, index, onFail }) {
    const hostRef = useRef(null);
    const stateRef = useRef(null);
    const [ready, setReady] = useState(false);

    // --- setup (once) --------------------------------------------------
    useEffect(() => {
        const host = hostRef.current;
        if (!host || images.length === 0) return;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
        } catch {
            onFail?.();
            return;
        }
        if (!renderer.getContext()) {
            onFail?.();
            return;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(host.clientWidth, host.clientHeight);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);

        const uniforms = {
            uTex0: { value: null },
            uTex1: { value: null },
            uImg0: { value: new THREE.Vector2(1, 1) },
            uImg1: { value: new THREE.Vector2(1, 1) },
            uRes: { value: new THREE.Vector2(host.clientWidth, host.clientHeight) },
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uPointer: { value: new THREE.Vector2(0, 0) },
        };

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms }),
        );
        scene.add(mesh);

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');

        const optimized = (src) => `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=70`;

        const loadTexture = (src) =>
            new Promise((resolve, reject) => {
                loader.load(
                    optimized(src),
                    (tex) => {
                        tex.colorSpace = THREE.SRGBColorSpace;
                        tex.minFilter = THREE.LinearFilter;
                        tex.wrapS = THREE.ClampToEdgeWrapping;
                        tex.wrapT = THREE.ClampToEdgeWrapping;
                        tex.generateMipmaps = false;
                        resolve(tex);
                    },
                    undefined,
                    reject,
                );
            });

        const state = {
            renderer, scene, camera, mesh, uniforms, loadTexture,
            textures: new Map(),
            current: -1,
            pending: null,
            tween: null,
            raf: 0,
            clock: new THREE.Clock(),
            inView: true,
            pageVisible: typeof document === 'undefined' || !document.hidden,
            disposed: false,
        };
        stateRef.current = state;

        const render = () => {
            if (state.disposed) return;
            state.raf = requestAnimationFrame(render);
            if (!state.inView || !state.pageVisible) return;
            uniforms.uTime.value = state.clock.getElapsedTime();
            renderer.render(scene, camera);
        };
        state.raf = requestAnimationFrame(render);

        // Stop drawing when the hero scrolls away or the tab is hidden.
        const io = new IntersectionObserver(([e]) => { state.inView = e.isIntersecting; }, { threshold: 0.01 });
        io.observe(host);
        const onVisibility = () => { state.pageVisible = !document.hidden; };
        document.addEventListener('visibilitychange', onVisibility);

        const ro = new ResizeObserver(() => {
            if (!host.clientWidth) return;
            renderer.setSize(host.clientWidth, host.clientHeight);
            uniforms.uRes.value.set(host.clientWidth, host.clientHeight);
        });
        ro.observe(host);

        const onPointer = (e) => {
            const r = host.getBoundingClientRect();
            gsap.to(uniforms.uPointer.value, {
                x: ((e.clientX - r.left) / r.width - 0.5) * 2,
                y: ((e.clientY - r.top) / r.height - 0.5) * 2,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true,
            });
        };
        host.addEventListener('pointermove', onPointer);

        // Prime the first slide before revealing the canvas.
        loadTexture(images[0])
            .then((tex) => {
                if (state.disposed) return;
                state.textures.set(images[0], tex);
                uniforms.uTex0.value = tex;
                uniforms.uTex1.value = tex;
                uniforms.uImg0.value.set(tex.image.width, tex.image.height);
                uniforms.uImg1.value.set(tex.image.width, tex.image.height);
                state.current = 0;
                setReady(true);
            })
            .catch(() => onFail?.());

        return () => {
            state.disposed = true;
            cancelAnimationFrame(state.raf);
            io.disconnect();
            ro.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            host.removeEventListener('pointermove', onPointer);
            state.textures.forEach((t) => t.dispose());
            mesh.geometry.dispose();
            mesh.material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- transition on index change ------------------------------------
    useEffect(() => {
        const state = stateRef.current;
        if (!state || !ready || state.current === index || state.current < 0) return;
        const src = images[index];
        if (!src) return;

        let cancelled = false;

        // Land any in-flight transition on its end state before starting a new
        // one, so the stage can never be left showing a half-finished wipe.
        const settle = () => {
            const { uniforms } = state;
            if (state.tween) {
                state.tween.kill();
                state.tween = null;
            }
            if (state.pending !== null && uniforms.uTex1.value) {
                uniforms.uTex0.value = uniforms.uTex1.value;
                uniforms.uImg0.value.copy(uniforms.uImg1.value);
                state.current = state.pending;
                state.pending = null;
            }
            uniforms.uProgress.value = 0;
        };

        const apply = (tex) => {
            if (cancelled || state.disposed) return;
            settle();

            const { uniforms } = state;
            uniforms.uTex1.value = tex;
            uniforms.uImg1.value.set(tex.image.width, tex.image.height);
            uniforms.uProgress.value = 0;
            state.pending = index;

            state.tween = gsap.to(uniforms.uProgress, {
                value: 1,
                duration: 1.15,
                ease: 'power2.inOut',
                overwrite: true,
                onComplete: () => {
                    if (state.disposed) return;
                    state.tween = null;
                    settle();
                },
            });
        };

        const cached = state.textures.get(src);
        if (cached) {
            apply(cached);
        } else {
            state.loadTexture(src)
                .then((tex) => {
                    if (cancelled || state.disposed) return;
                    state.textures.set(src, tex);
                    apply(tex);
                })
                .catch(() => {
                    // A single bad image shouldn't kill the stage; just skip it
                    // so the next slide change still transitions from here.
                    if (!cancelled && !state.disposed) state.current = index;
                });
        }

        return () => { cancelled = true; };
    }, [index, images, ready]);

    return (
        <div
            ref={hostRef}
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        />
    );
}
