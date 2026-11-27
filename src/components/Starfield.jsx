import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Volumetric cerulean/sapphire drifting cosmic clouds around obsidian core + multi-layer tumbling starfield
const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScrollZoom;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
        v += a * noise2(p);
        p = rot * p * 2.04 + vec2(13.1, 7.7);
        a *= 0.5;
    }
    return v;
}

float starLayer(vec2 uv, float scale, float speed, float time, float seedShift) {
    vec2 gUv = uv * scale;
    gUv.y += time * speed;
    vec2 id = floor(gUv);
    vec2 gv = fract(gUv) - 0.5;

    float col = 0.0;
    for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
            vec2 offs = vec2(float(dx), float(dy));
            vec2 cell = id + offs;
            float n = hash21(cell + seedShift);
            if (n > 0.72) {
                vec2 starPos = offs + vec2(hash21(cell * 1.7 + 3.1), hash21(cell * 2.3 + 9.4)) - 0.5;
                starPos *= 0.76;
                float d = length(gv - starPos);
                float size = mix(0.014, 0.046, fract(n * 37.3));
                float twinkle = 0.65 + 0.35 * sin(time * (1.2 + fract(n * 19.1) * 2.4) + n * 42.0);
                float core = smoothstep(size, 0.0, d);
                float halo = exp(-d * 18.0) * 0.45;
                col += (core + halo) * twinkle * mix(0.35, 1.0, fract(n * 71.7));
            }
        }
    }
    return col;
}

void main() {
    float aspect = uRes.x / max(1.0, uRes.y);
    vec2 centered = (vUv - 0.5) * vec2(aspect, 1.0);
    vec2 zoomUv = centered * (1.0 - uScrollZoom * 0.16);

    // Subtle parallax sway with mouse pointer
    vec2 parallax = uMouse * 0.025;

    // Deep obsidian void core surrounded by sapphire-teal nebula mist matching reference video
    vec2 cloudUv = zoomUv * 1.45 + parallax + vec2(0.0, uTime * 0.018);
    float n1 = fbm(cloudUv + vec2(fbm(cloudUv * 0.8 - uTime * 0.008) * 0.55));
    float n2 = fbm(cloudUv * 1.9 - vec2(uTime * 0.01, -uTime * 0.015));
    float cloudDensity = smoothstep(0.28, 0.85, n1 * 0.68 + n2 * 0.36);

    // Organic dark central rift (keeps UI & typography high-contrast over rich cosmos)
    float centerDist = length(zoomUv * vec2(1.05, 1.18) + vec2(0.0, 0.06));
    float riftNoise = fbm(zoomUv * 2.6 + vec2(0.0, uTime * 0.012)) * 0.32;
    float centerHollow = smoothstep(0.18, 0.72, centerDist + riftNoise - 0.12);

    // Soft cyan-ice zenith skylight source at top center
    vec2 zenithVec = vUv - vec2(0.5 + uMouse.x * 0.03, 0.99);
    float zenithDist = length(zenithVec * vec2(aspect * 0.72, 1.15));
    float zenithGlow = exp(-zenithDist * 3.1);

    vec3 col = vec3(0.014, 0.02, 0.035);
    vec3 deepSapphire = vec3(0.055, 0.16, 0.28);
    vec3 ceruleanMist = vec3(0.14, 0.34, 0.49);
    vec3 arcticTop = vec3(0.42, 0.76, 0.94);

    col += mix(deepSapphire, ceruleanMist, n2) * cloudDensity * centerHollow * 0.92;
    col += arcticTop * zenithGlow * (0.48 + n1 * 0.24);

    // 3 parallax drifting & twinkling star layers
    float sFar = starLayer(zoomUv + parallax * 0.35, 34.0, 0.055, uTime, 11.0);
    float sMid = starLayer(zoomUv + parallax * 0.75, 18.0, 0.095, uTime, 47.0);
    float sNear = starLayer(zoomUv + parallax * 1.25, 8.5, 0.145, uTime, 93.0);

    vec3 starTint = mix(vec3(0.76, 0.89, 1.0), vec3(1.0, 0.98, 0.95), 0.45);
    col += starTint * (sFar * 0.55 + sMid * 0.82 + sNear * 1.05);

    // Subtle soft radial edge vignette
    float edgeVig = 1.0 - smoothstep(0.55, 1.15, length(vUv - 0.5) * 1.35);
    col *= mix(0.62, 1.0, edgeVig);

    gl_FragColor = vec4(col, 1.0);
}
`;

const Starfield = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || typeof window === 'undefined') return undefined;

        const gl = canvas.getContext('webgl', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'low-power',
        });
        if (!gl) return undefined;

        const compile = (type, src) => {
            const sh = gl.createShader(type);
            if (!sh) return null;
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                gl.deleteShader(sh);
                return null;
            }
            return sh;
        };

        const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vs || !fs) return undefined;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            return undefined;
        }
        gl.useProgram(program);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(program, 'aPos');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(program, 'uRes');
        const uTime = gl.getUniformLocation(program, 'uTime');
        const uMouse = gl.getUniformLocation(program, 'uMouse');
        const uScrollZoom = gl.getUniformLocation(program, 'uScrollZoom');

        const mouse = { tx: 0, ty: 0, sx: 0, sy: 0 };
        let scrollZoom = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const w = Math.max(1, Math.floor(window.innerWidth * dpr));
            const h = Math.max(1, Math.floor(window.innerHeight * dpr));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
        };

        const onMove = (e) => {
            mouse.tx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
            mouse.ty = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
        };

        resize();
        window.addEventListener('resize', resize, { passive: true });
        window.addEventListener('pointermove', onMove, { passive: true });

        const prefersReduced = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
        const start = performance.now();
        let rafId = null;

        const drawFrame = (elapsedSec) => {
            const targetScroll = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 1.1));
            scrollZoom += (targetScroll - scrollZoom) * 0.08;
            mouse.sx += (mouse.tx - mouse.sx) * 0.05;
            mouse.sy += (mouse.ty - mouse.sy) * 0.05;

            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, elapsedSec);
            gl.uniform2f(uMouse, mouse.sx, mouse.sy);
            gl.uniform1f(uScrollZoom, scrollZoom);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        if (prefersReduced) {
            drawFrame(4.0);
        } else {
            const loop = (now) => {
                if (!document.hidden) {
                    drawFrame((now - start) * 0.001);
                }
                rafId = requestAnimationFrame(loop);
            };
            rafId = requestAnimationFrame(loop);
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
            gl.deleteBuffer(buf);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, []);

    return (
        <>
            <div className="starfield-bg" aria-hidden="true">
                <canvas
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        pointerEvents: 'none',
                    }}
                />
            </div>
            <div className="grid-overlay" aria-hidden="true" />
        </>
    );
};

export default Starfield;
