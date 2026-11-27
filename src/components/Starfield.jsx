import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// High-clarity Quintic FBM sapphire cosmic nebula + non-repeating rotated pinpoint starfield
const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScrollZoom;

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    // Quintic curve eliminates C1 cubic square grid lines completely in soft mist
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.52;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
        v += a * noise2(p);
        p = rot * p * 2.02 + vec2(17.1, 31.7);
        a *= 0.5;
    }
    return v;
}

vec3 crispStarLayer(vec2 uv, float scale, float speed, float time, float angleRad, float threshold) {
    float ca = cos(angleRad);
    float sa = sin(angleRad);
    vec2 rotUv = mat2(ca, -sa, sa, ca) * uv;
    rotUv.y += time * speed;

    vec2 gUv = rotUv * scale;
    vec2 id = floor(gUv);
    vec2 gv = fract(gUv) - 0.5;

    vec3 acc = vec3(0.0);
    for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
            vec2 offs = vec2(float(dx), float(dy));
            vec2 cell = id + offs;
            vec2 rnd = hash22(cell);
            float chance = fract(rnd.x * 13.7 + rnd.y * 7.3);
            if (chance > threshold) {
                // Keep jitter strictly inside each neighbor cell WITHOUT scaling offs (fixes repeating clusters!)
                vec2 starPos = offs + (rnd - 0.5) * 0.78;
                float d = length(gv - starPos);

                float bright = pow(fract(rnd.x * 31.1 + rnd.y * 19.7), 1.6);
                float radius = mix(0.012, 0.036, bright);
                float twinkle = 0.72 + 0.28 * sin(time * (1.1 + rnd.y * 2.6) + rnd.x * 6.2831);

                float pinpoint = smoothstep(radius, 0.0, d);
                float halo = exp(-d * 48.0) * 0.28 * bright;
                vec3 sCol = mix(vec3(0.72, 0.88, 1.0), vec3(1.0, 0.96, 0.90), rnd.y);
                acc += sCol * (pinpoint + halo) * twinkle * mix(0.32, 1.0, bright);
            }
        }
    }
    return acc;
}

void main() {
    float aspect = uRes.x / max(1.0, uRes.y);
    vec2 centered = (vUv - 0.5) * vec2(aspect, 1.0);
    vec2 zoomUv = centered * (1.0 - uScrollZoom * 0.24);
    vec2 parallax = uMouse * 0.028;

    // Deep cosmic midnight nebula Clouds framing obsidian center sky
    vec2 cloudUv = zoomUv * 1.38 + parallax + vec2(0.0, uTime * 0.015);
    float warp = fbm(cloudUv * 0.85 - vec2(uTime * 0.006, 0.0));
    float n1 = fbm(cloudUv + vec2(warp * 0.65, warp * 0.42));
    float n2 = fbm(cloudUv * 1.9 - vec2(uTime * 0.008, -uTime * 0.012));
    float mist = smoothstep(0.32, 0.88, n1 * 0.66 + n2 * 0.34);

    // Organic center hollow keeps UI & floating typography ultra-clean
    float centerDist = length(zoomUv * vec2(1.05, 1.15) + vec2(0.0, 0.05));
    float edgeBreakup = fbm(zoomUv * 2.4 + vec2(0.0, uTime * 0.01)) * 0.28;
    float hollowMask = smoothstep(0.22, 0.74, centerDist + edgeBreakup - 0.14);

    // Top-center subtle arctic skylight glow
    vec2 zenithVec = vUv - vec2(0.5 + uMouse.x * 0.03, 0.99);
    float zenithDist = length(zenithVec * vec2(aspect * 0.72, 1.15));
    float zenithGlow = exp(-zenithDist * 3.1);

    vec3 col = vec3(0.010, 0.016, 0.030);
    vec3 deepSapphire = vec3(0.045, 0.14, 0.26);
    vec3 ceruleanMist = vec3(0.13, 0.33, 0.49);
    vec3 arcticSky = vec3(0.40, 0.74, 0.94);

    col += mix(deepSapphire, ceruleanMist, n2) * mist * hollowMask * (0.85 + uScrollZoom * 0.32);
    col += arcticSky * zenithGlow * (0.44 + n1 * 0.24);

    // Four rotated independent star layers: zero grid symmetry, razor crisp pinpoints
    vec3 stars = vec3(0.0);
    stars += crispStarLayer(zoomUv + parallax * 0.25, 42.0, 0.025, uTime, 0.28, 0.76) * 0.55;
    stars += crispStarLayer(zoomUv + parallax * 0.50, 26.0, 0.048, uTime, 1.04, 0.80) * 0.78;
    stars += crispStarLayer(zoomUv + parallax * 0.85, 15.0, 0.075, uTime, -0.52, 0.84) * 0.95;
    stars += crispStarLayer(zoomUv + parallax * 1.15, 9.0, 0.105, uTime, 2.08, 0.90) * 1.10;
    col += stars;

    // Gentle edge vignette
    float vig = 1.0 - smoothstep(0.56, 1.18, length(vUv - 0.5) * 1.35);
    col *= mix(0.65, 1.0, vig);

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
