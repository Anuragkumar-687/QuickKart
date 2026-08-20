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

// background-size: cover, in shader form.
vec2 coverUv(vec2 uv, vec2 res, vec2 img) {
    if (img.x < 1.0 || img.y < 1.0) return uv;
    float rs = res.x / res.y;
    float ri = img.x / img.y;
    vec2 scale = rs < ri ? vec2(ri / rs, 1.0) : vec2(1.0, rs / ri);
    return (uv - 0.5) / scale + 0.5;
}

void main() {
    float n = noise(vUv * 3.5 + uTime * 0.06);

    // Wipe edge travels left→right, roughened by noise so it reads as liquid.
    float edge = uProgress * 1.7 - 0.35;
    float mask = smoothstep(edge - 0.32, edge + 0.32, vUv.x + (n - 0.5) * 0.45);

    // Displacement peaks mid-transition, so idle frames stay perfectly sharp.
    float bulge = sin(uProgress * 3.14159);
    vec2 disp = vec2(n - 0.5) * 0.09 * bulge;

    // Slow parallax toward the pointer; tiny, just enough to feel alive.
    vec2 par = uPointer * 0.012;

    vec4 c0 = texture2D(uTex0, coverUv(vUv + disp + par, uRes, uImg0));
    vec4 c1 = texture2D(uTex1, coverUv(vUv - disp + par, uRes, uImg1));
    vec4 color = mix(c1, c0, mask);

    // Darken toward the left so the overlaid headline always has contrast.
    float shade = smoothstep(0.85, 0.05, vUv.x);
    color.rgb *= mix(1.0, 0.28, shade * 0.92);
    color.rgb *= 1.0 - 0.25 * smoothstep(0.55, 1.0, distance(vUv, vec2(0.5)));

    gl_FragColor = vec4(color.rgb, 1.0);
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
            raf: 0,
            clock: new THREE.Clock(),
            visible: true,
            disposed: false,
        };
        stateRef.current = state;

        const render = () => {
            if (state.disposed) return;
            state.raf = requestAnimationFrame(render);
            if (!state.visible) return;
            uniforms.uTime.value = state.clock.getElapsedTime();
            renderer.render(scene, camera);
        };
        state.raf = requestAnimationFrame(render);

        // Stop drawing when the hero scrolls away or the tab is hidden.
        const io = new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; }, { threshold: 0.01 });
        io.observe(host);
        const onVisibility = () => { state.visible = !document.hidden; };
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

        const apply = (tex) => {
            if (cancelled || state.disposed) return;
            const { uniforms } = state;
            uniforms.uTex1.value = tex;
            uniforms.uImg1.value.set(tex.image.width, tex.image.height);
            uniforms.uProgress.value = 0;

            gsap.to(uniforms.uProgress, {
                value: 1,
                duration: 1.15,
                ease: 'power2.inOut',
                onComplete: () => {
                    if (cancelled || state.disposed) return;
                    // Incoming slide becomes the resting slide.
                    uniforms.uTex0.value = tex;
                    uniforms.uImg0.value.copy(uniforms.uImg1.value);
                    uniforms.uProgress.value = 0;
                    state.current = index;
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
                    // A single bad image shouldn't kill the stage; just skip it.
                    if (!cancelled) state.current = index;
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
