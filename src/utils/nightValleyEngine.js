import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
    VALLEY_LOOP_LENGTH,
    mulberry32,
    getValleyCenterX,
    getValleyTerrainY,
    createValleyPathPoints,
} from './nightValleyMath';

function drawPetalBlossom(ctx, cx, cy, outerR, petals, palette, variant = 0) {
    ctx.save();
    ctx.translate(cx, cy);

    // Subtle soft luminous back-halo
    const halo = ctx.createRadialGradient(0, 0, outerR * 0.06, 0, 0, outerR * 0.95);
    halo.addColorStop(0, palette.haloInner);
    halo.addColorStop(0.55, palette.haloMid);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, outerR * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Draw layered botanical petals
    for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + (variant * 0.2);
        ctx.save();
        ctx.rotate(angle);

        const grad = ctx.createRadialGradient(0, -outerR * 0.42, 2, 0, -outerR * 0.42, outerR * 0.56);
        grad.addColorStop(0, palette.tip);
        grad.addColorStop(0.55, palette.mid);
        grad.addColorStop(1, palette.base);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -outerR * 0.08);
        ctx.bezierCurveTo(
            outerR * (variant === 1 ? 0.22 : 0.34),
            -outerR * 0.32,
            outerR * (variant === 1 ? 0.18 : 0.38),
            -outerR * 0.84,
            0,
            -outerR * 0.92
        );
        ctx.bezierCurveTo(
            -outerR * (variant === 1 ? 0.18 : 0.38),
            -outerR * 0.84,
            -outerR * (variant === 1 ? 0.22 : 0.34),
            -outerR * 0.32,
            0,
            -outerR * 0.08
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Incandescent stamen core
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, outerR * 0.24);
    core.addColorStop(0, '#ffffff');
    core.addColorStop(0.45, palette.core);
    core.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, outerR * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawNightLeaf(ctx, cx, cy, radius) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.35);

    const grad = ctx.createLinearGradient(0, -radius * 0.9, 0, radius * 0.9);
    grad.addColorStop(0, 'rgba(148, 163, 184, 0.92)');
    grad.addColorStop(0.55, 'rgba(71, 85, 105, 0.78)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.88);
    ctx.bezierCurveTo(radius * 0.45, -radius * 0.3, radius * 0.42, radius * 0.45, 0, radius * 0.85);
    ctx.bezierCurveTo(-radius * 0.42, radius * 0.45, -radius * 0.45, -radius * 0.3, 0, -radius * 0.88);
    ctx.closePath();
    ctx.fill();

    // Central luminous vein
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.78);
    ctx.lineTo(0, -radius * 0.78);
    ctx.stroke();

    ctx.restore();
}

function createBotanicalAtlasTexture() {
    const size = 512;
    const cell = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);

    // Quadrant 0: 5-petal Crimson-Porcelain Night Cosmos
    drawPetalBlossom(ctx, cell * 0.5, cell * 0.5, 104, 5, {
        haloInner: 'rgba(239, 68, 68, 0.26)',
        haloMid: 'rgba(159, 18, 57, 0.1)',
        tip: 'rgba(248, 250, 252, 0.95)',
        mid: 'rgba(244, 63, 94, 0.86)',
        base: 'rgba(136, 19, 55, 0.45)',
        core: 'rgba(254, 226, 226, 0.95)',
    }, 0);

    // Quadrant 1: 6-petal Slender Nocturne Star Lily
    drawPetalBlossom(ctx, cell * 1.5, cell * 0.5, 106, 6, {
        haloInner: 'rgba(244, 63, 94, 0.25)',
        haloMid: 'rgba(190, 18, 60, 0.08)',
        tip: 'rgba(255, 241, 242, 0.94)',
        mid: 'rgba(239, 68, 68, 0.82)',
        base: 'rgba(76, 5, 25, 0.35)',
        core: 'rgba(253, 230, 138, 0.92)',
    }, 1);

    // Quadrant 2: 8-petal Ember Aster
    drawPetalBlossom(ctx, cell * 0.5, cell * 1.5, 102, 8, {
        haloInner: 'rgba(225, 29, 72, 0.28)',
        haloMid: 'rgba(136, 19, 55, 0.1)',
        tip: 'rgba(254, 215, 170, 0.94)',
        mid: 'rgba(239, 68, 68, 0.85)',
        base: 'rgba(69, 10, 10, 0.4)',
        core: 'rgba(255, 255, 255, 0.98)',
    }, 2);

    // Quadrant 3: Dark Slate Foliage Leaf
    drawNightLeaf(ctx, cell * 1.5, cell * 1.5, 104);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}

function createLightRayTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(248, 250, 252, 0.0)');
    grad.addColorStop(0.2, 'rgba(248, 250, 252, 0.14)');
    grad.addColorStop(0.55, 'rgba(239, 68, 68, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(96, 0);
    ctx.lineTo(160, 0);
    ctx.lineTo(246, 512);
    ctx.lineTo(10, 512);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

const FLORA_VERTEX_SHADER = `
uniform float uTime;
uniform float uCameraZ;
uniform float uLoopLen;
uniform float uPixelRatio;
uniform vec2 uMouseNDC;
uniform float uMouseActive;
uniform float uAspect;
uniform float uDisperse;

attribute float aScale;
attribute float aPhase;
attribute float aVariant;
attribute float aAngle;
attribute float aIsLeaf;
attribute vec3 aColor;
attribute vec3 aDisperseDir;

varying float vVariant;
varying float vAngle;
varying float vAlpha;
varying float vMouseGlow;
varying float vDisperse;
varying float vIsLeaf;
varying vec3 vColor;

void main() {
    vVariant = aVariant;
    vAngle = aAngle + sin(uTime * 0.45 + aPhase) * 0.12;
    vColor = aColor;
    vIsLeaf = aIsLeaf;
    vDisperse = uDisperse;

    // Seamless infinite canyon modulo around active camera Z
    float halfLoop = uLoopLen * 0.5;
    float relZ = mod(position.z - uCameraZ + halfLoop, uLoopLen) - halfLoop;
    vec3 worldPos = vec3(position.x, position.y, uCameraZ + relZ);

    // Gentle living breeze across stems + petals
    float breeze = sin(uTime * 1.15 + aPhase + worldPos.x * 0.25) * 0.16;
    worldPos.x += breeze * (1.0 - aIsLeaf * 0.45);
    worldPos.y += cos(uTime * 0.9 + aPhase) * 0.07;

    // Hover dispersal lifts flora outward into glowing floating bokeh particles
    worldPos += aDisperseDir * (uDisperse * (4.2 + 2.8 * sin(aPhase + uTime * 0.6)));
    worldPos.y += uDisperse * (1.1 + sin(aPhase * 2.0 + uTime) * 0.65);

    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
    float dist = max(0.5, -mvPosition.z);

    // Distance growth staging: flowers bloom close-up; leaves populate deeper slopes
    float flowerGrow = smoothstep(78.0, 14.0, dist) * (1.0 - smoothstep(4.2, 1.2, dist));
    float leafGrow = smoothstep(95.0, 28.0, dist) * (1.0 - smoothstep(7.5, 2.2, dist));
    float stageScale = mix(flowerGrow, leafGrow, aIsLeaf);

    vec4 clipPos = projectionMatrix * mvPosition;
    float absW = max(0.001, clipPos.w);
    vec2 ndc = clipPos.xy / absW;

    // Screen-space radial cursor repulsion + proximity luminescence
    vec2 diff = ndc - uMouseNDC;
    diff.x *= uAspect;
    float mouseDist = length(diff);
    float radius = 0.36;
    float pushStrength = pow(max(0.0, 1.0 - smoothstep(0.0, radius, mouseDist)), 2.0) * uMouseActive;
    vec2 pushDir = mouseDist > 0.0005 ? normalize(diff) : vec2(0.0, 1.0);
    pushDir.x /= max(0.35, uAspect);
    clipPos.xy += pushDir * (pushStrength * 0.28 * absW);
    clipPos.y += pushStrength * 0.05 * absW;

    vMouseGlow = pushStrength;

    float baseSize = aScale * (aIsLeaf > 0.5 ? 24.0 : 28.0) * (0.28 + 0.95 * stageScale);
    baseSize *= (1.0 + pushStrength * 0.42 - uDisperse * 0.25);

    gl_Position = clipPos;
    gl_PointSize = clamp((baseSize * uPixelRatio * 14.0) / dist, 1.5, 92.0);

    float farFade = 1.0 - smoothstep(46.0, 88.0, dist);
    float nearFade = smoothstep(1.2, 4.4, dist);
    vAlpha = farFade * nearFade * (aIsLeaf > 0.5 ? 0.62 : 0.92);
}
`;

const FLORA_FRAGMENT_SHADER = `
uniform sampler2D uAtlas;
uniform float uScrollDim;

varying float vVariant;
varying float vAngle;
varying float vAlpha;
varying float vMouseGlow;
varying float vDisperse;
varying float vIsLeaf;
varying vec3 vColor;

void main() {
    if (vAlpha <= 0.01) discard;

    vec2 centered = gl_PointCoord - 0.5;
    float r = length(centered) * 2.0;

    // Rotate sprite UVs smoothly per particle
    float c = cos(vAngle);
    float s = sin(vAngle);
    vec2 rotated = mat2(c, -s, s, c) * centered + 0.5;
    rotated = clamp(rotated, 0.02, 0.98);

    // Map variant 0..3 into 2x2 texture atlas
    float col = mod(vVariant, 2.0);
    float row = floor(vVariant * 0.5);
    vec2 atlasUV = (rotated + vec2(col, 1.0 - row)) * 0.5;

    vec4 tex = texture2D(uAtlas, atlasUV);
    float orb = exp(-r * r * 3.4);

    // Morph sharp blossom sprites toward soft luminous orbs during hover dispersal
    float shapeAlpha = mix(tex.a, orb, vDisperse * 0.85);
    vec3 tint = mix(tex.rgb * vColor, vColor * 1.45, vDisperse * 0.72);

    // Cursor hover luminescence surge (#ef4444 -> warm porcelain incandescent peak)
    vec3 hoverCol = vec3(1.0, 0.94, 0.95);
    tint = mix(tint, hoverCol, vMouseGlow * 0.72);
    tint *= (1.0 + vMouseGlow * 0.95);

    // Soften brightness gracefully once scrolled below the hero entry into About prose
    float dimFactor = mix(1.0, 0.55, uScrollDim);
    float finalAlpha = shapeAlpha * vAlpha * mix(1.0, 0.72, uScrollDim);
    if (finalAlpha < 0.015) discard;

    gl_FragColor = vec4(tint * dimFactor, finalAlpha);
}
`;

const DUST_VERTEX_SHADER = `
uniform float uTime;
uniform float uCameraZ;
uniform float uLoopLen;
uniform float uPixelRatio;
uniform float uDisperse;

attribute float aScale;
attribute float aPhase;

varying float vAlpha;

void main() {
    float halfLoop = uLoopLen * 0.5;
    float relZ = mod(position.z - uCameraZ + halfLoop, uLoopLen) - halfLoop;
    vec3 pos = vec3(position.x, position.y, uCameraZ + relZ);

    pos.x += sin(uTime * 0.45 + aPhase) * 1.3;
    pos.y += mod(uTime * 0.35 + aPhase, 6.0) - 2.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = max(1.0, -mv.z);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((aScale * uPixelRatio * 48.0) / dist, 1.5, 16.0);

    float fade = (1.0 - smoothstep(32.0, 75.0, dist)) * smoothstep(1.8, 6.0, dist);
    vAlpha = fade * (0.35 + 0.35 * sin(uTime * 1.7 + aPhase)) * (1.0 + uDisperse * 0.75);
}
`;

const DUST_FRAGMENT_SHADER = `
uniform float uScrollDim;
varying float vAlpha;

void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d) * 4.0;
    if (r > 1.0) discard;
    float glow = exp(-r * 3.2);
    vec3 col = mix(vec3(0.94, 0.27, 0.27), vec3(0.98, 0.97, 0.98), glow);
    gl_FragColor = vec4(col * mix(1.0, 0.5, uScrollDim), glow * vAlpha);
}
`;

const VALLEY_POST_SHADER = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uScrollDim: { value: 0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uScrollDim;
        varying vec2 vUv;

        float hash12(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
        }

        void main() {
            vec2 centered = vUv - 0.5;
            float radial = length(centered);

            // Split-RGB chromatic displacement strongest toward corners & high flight speed
            float chromaOffset = (0.0014 + clamp(uSpeed * 0.0038, 0.0, 0.005)) * radial * radial;
            vec2 dir = radial > 0.0001 ? centered / radial : vec2(0.0);

            float r = texture2D(tDiffuse, vUv + dir * chromaOffset).r;
            float g = texture2D(tDiffuse, vUv).g;
            float b = texture2D(tDiffuse, vUv - dir * chromaOffset).b;
            vec3 col = vec3(r, g, b);

            // Dynamic vignette tightening with movement velocity
            float vigRadius = mix(0.84, 0.62, clamp(uSpeed * 1.1, 0.0, 1.0));
            float vig = 1.0 - smoothstep(vigRadius - 0.36, vigRadius + 0.16, radial * 1.28);
            col *= mix(0.28, 1.0, vig);

            // Subtle organic nocturnal film noise
            float n = (hash12(gl_FragCoord.xy + fract(uTime * 17.3) * 100.0) - 0.5) * 0.024;
            col += n * (1.0 - uScrollDim * 0.5);

            // Deepen slightly into portfolio obsidian tint when viewing editorial chapters
            col = mix(col, vec3(0.024, 0.027, 0.035), uScrollDim * 0.42);

            gl_FragColor = vec4(max(col, 0.0), 1.0);
        }
    `,
};

export class NightValleyEngine {
    constructor(container, { onLoaded, onIntroDone } = {}) {
        this.container = container;
        this.onLoaded = onLoaded;
        this.onIntroDone = onIntroDone;
        this.disposed = false;
        this.hoverTarget = 0;
        this.disperseValue = 0;
        this.scrollDimTarget = 0;
        this.scrollDimValue = 0;
        this.scrollVelocity = 0;
        this.travelDistance = 0;
        this.introElapsed = 0;
        this.introReported = false;
        this.mouseNDC = new THREE.Vector2(99, 99);
        this.mouseTilt = new THREE.Vector2(0, 0);
        this.mouseActiveTarget = 0;
        this.mouseActiveValue = 0;
        this.rafId = null;

        this._init();
    }

    _init() {
        const width = this.container?.clientWidth || window.innerWidth || 1440;
        const height = Math.max(1, this.container?.clientHeight || window.innerHeight || 900);
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: false,
                powerPreference: 'high-performance',
                alpha: false,
            });
        } catch {
            // Cleanly unblock UI if WebGL context cannot be created
            requestAnimationFrame(() => {
                if (this.disposed) return;
                this.onLoaded?.();
                this.onIntroDone?.();
            });
            return;
        }

        this.renderer = renderer;
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.setClearColor(0x060709, 1);
        this.container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060709);
        scene.fog = new THREE.FogExp2(0x060709, 0.02);
        this.scene = scene;

        const camera = new THREE.PerspectiveCamera(54, width / height, 0.4, 150);
        this.camera = camera;

        // Ambient & crimson moonlit haze light for subtle obsidian canyon silhouettes
        const hemi = new THREE.HemisphereLight(0xf8fafc, 0x060709, 0.16);
        const rim = new THREE.DirectionalLight(0xef4444, 0.28);
        rim.position.set(12, 18, -30);
        scene.add(hemi, rim);

        // Precompute valley splines for smooth banking lookAt tangent
        const pathPoints = createValleyPathPoints(VALLEY_LOOP_LENGTH, 18).map(
            (p) => new THREE.Vector3(p.x, p.y, p.z)
        );
        this.valleySpline = new THREE.CatmullRomCurve3(pathPoints, true, 'catmullrom', 0.5);

        this._buildFloraAndLeaves(pixelRatio);
        this._buildDustParticles(pixelRatio);
        this._buildLightRays();

        // Postprocessing Composer (Bloom + Split-RGB / Velocity Vignette + Output)
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            0.66,
            0.55,
            0.32
        );
        const postPass = new ShaderPass(VALLEY_POST_SHADER);
        const outputPass = new OutputPass();

        composer.addPass(renderPass);
        composer.addPass(bloomPass);
        composer.addPass(postPass);
        composer.addPass(outputPass);

        this.composer = composer;
        this.bloomPass = bloomPass;
        this.postPass = postPass;

        this._bindEvents();
        this.clock = new THREE.Clock();

        // Warm one frame so shader compilation finishes before fading loader curtain out
        this._updateScene(0.016);
        composer.render();

        requestAnimationFrame(() => {
            if (this.disposed) return;
            this.onLoaded?.();
            this._loop();
        });
    }

    _buildFloraAndLeaves(pixelRatio) {
        this.atlasTex = createBotanicalAtlasTexture();
        const rand = mulberry32(2026);

        const flowerCount = 3400;
        const leafCount = 1500;
        const total = flowerCount + leafCount;

        const positions = new Float32Array(total * 3);
        const scales = new Float32Array(total);
        const phases = new Float32Array(total);
        const variants = new Float32Array(total);
        const angles = new Float32Array(total);
        const isLeafAttr = new Float32Array(total);
        const colors = new Float32Array(total * 3);
        const disperseDirs = new Float32Array(total * 3);

        // Portfolio crimson-rose-porcelain blossom palette + midnight slate foliage
        const flowerPalette = [
            new THREE.Color('#ef4444'), // Obsidian Ember Crimson
            new THREE.Color('#f43f5e'), // Luminous Rose
            new THREE.Color('#be123c'), // Deep Burgundy
            new THREE.Color('#fda4af'), // Pale Rose-Gold Highlight
            new THREE.Color('#f8fafc'), // Moonlit Porcelain
        ];
        const leafPalette = [
            new THREE.Color('#64748b'),
            new THREE.Color('#475569'),
            new THREE.Color('#334155'),
        ];

        for (let i = 0; i < total; i++) {
            const isLeaf = i >= flowerCount;
            const z = -rand() * VALLEY_LOOP_LENGTH;
            const centerX = getValleyCenterX(z);

            // Dense hillside flanking outside the central flight corridor (1.8m .. 26m lateral offset)
            const side = rand() > 0.5 ? 1 : -1;
            const lateralPower = Math.pow(rand(), 0.72);
            const lateral = (isLeaf ? 3.2 : 1.75) + lateralPower * (isLeaf ? 28.0 : 24.0);
            const x = centerX + side * lateral;
            const y = getValleyTerrainY(x, z) + (isLeaf ? 0.35 + rand() * 0.9 : 0.45 + rand() * 1.15);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            scales[i] = isLeaf ? 0.75 + rand() * 1.25 : 0.65 + rand() * 1.35;
            phases[i] = rand() * Math.PI * 2;
            variants[i] = isLeaf ? 3 : Math.floor(rand() * 3);
            angles[i] = rand() * Math.PI * 2;
            isLeafAttr[i] = isLeaf ? 1 : 0;

            const pal = isLeaf
                ? leafPalette[Math.floor(rand() * leafPalette.length)]
                : flowerPalette[Math.floor(Math.pow(rand(), 1.35) * flowerPalette.length)];
            colors[i * 3] = pal.r;
            colors[i * 3 + 1] = pal.g;
            colors[i * 3 + 2] = pal.b;

            // Outward & upward orbital drift vector for hover dispersal
            const dAng = rand() * Math.PI * 2;
            disperseDirs[i * 3] = Math.cos(dAng) * (0.6 + rand() * 0.9);
            disperseDirs[i * 3 + 1] = 0.4 + rand() * 1.1;
            disperseDirs[i * 3 + 2] = Math.sin(dAng) * (0.5 + rand() * 0.9);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geo.setAttribute('aVariant', new THREE.BufferAttribute(variants, 1));
        geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
        geo.setAttribute('aIsLeaf', new THREE.BufferAttribute(isLeafAttr, 1));
        geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('aDisperseDir', new THREE.BufferAttribute(disperseDirs, 3));

        this.floraUniforms = {
            uTime: { value: 0 },
            uCameraZ: { value: 0 },
            uLoopLen: { value: VALLEY_LOOP_LENGTH },
            uPixelRatio: { value: pixelRatio },
            uMouseNDC: { value: new THREE.Vector2(99, 99) },
            uMouseActive: { value: 0 },
            uAspect: { value: 16 / 9 },
            uDisperse: { value: 0 },
            uScrollDim: { value: 0 },
        };

        const mat = new THREE.ShaderMaterial({
            uniforms: this.floraUniforms,
            vertexShader: FLORA_VERTEX_SHADER,
            fragmentShader: FLORA_FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
        });

        this.floraPoints = new THREE.Points(geo, mat);
        this.floraPoints.frustumCulled = false;
        this.scene.add(this.floraPoints);
    }

    _buildDustParticles(pixelRatio) {
        const rand = mulberry32(8881);
        const count = 420;
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const z = -rand() * VALLEY_LOOP_LENGTH;
            const centerX = getValleyCenterX(z);
            positions[i * 3] = centerX + (rand() - 0.5) * 34;
            positions[i * 3 + 1] = getValleyTerrainY(centerX, z) + 0.5 + rand() * 9.5;
            positions[i * 3 + 2] = z;
            scales[i] = 0.55 + rand() * 1.15;
            phases[i] = rand() * Math.PI * 2;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

        this.dustUniforms = {
            uTime: { value: 0 },
            uCameraZ: { value: 0 },
            uLoopLen: { value: VALLEY_LOOP_LENGTH },
            uPixelRatio: { value: pixelRatio },
            uDisperse: { value: 0 },
            uScrollDim: { value: 0 },
        };

        const mat = new THREE.ShaderMaterial({
            uniforms: this.dustUniforms,
            vertexShader: DUST_VERTEX_SHADER,
            fragmentShader: DUST_FRAGMENT_SHADER,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.dustPoints = new THREE.Points(geo, mat);
        this.dustPoints.frustumCulled = false;
        this.scene.add(this.dustPoints);
    }

    _buildLightRays() {
        this.rayTex = createLightRayTexture();
        const rayGeo = new THREE.PlaneGeometry(9, 26);
        this.rayMat = new THREE.MeshBasicMaterial({
            map: this.rayTex,
            transparent: true,
            opacity: 0.24,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
        });

        this.rays = [];
        for (let i = 0; i < 8; i++) {
            const mesh = new THREE.Mesh(rayGeo, this.rayMat);
            const z = -(i / 8) * VALLEY_LOOP_LENGTH;
            const sideOffset = (i % 2 === 0 ? -1 : 1) * (4.5 + (i % 3) * 2.2);
            mesh.userData = { baseZ: z, sideOffset, tilt: (i % 2 === 0 ? 1 : -1) * 0.22 };
            mesh.rotation.z = mesh.userData.tilt;
            this.scene.add(mesh);
            this.rays.push(mesh);
        }
    }

    _bindEvents() {
        let lastTouchY = null;

        this._onPointerMove = (e) => {
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const nx = (e.clientX / w) * 2 - 1;
            const ny = -((e.clientY / h) * 2 - 1);
            this.mouseNDC.set(nx, ny);
            this.mouseTilt.set(nx, ny);
            this.mouseActiveTarget = 1;
        };

        this._onPointerLeave = () => {
            this.mouseActiveTarget = 0;
        };

        this._onWheel = (e) => {
            this.scrollVelocity += e.deltaY * 0.012;
        };

        this._onTouchStart = (e) => {
            if (e.touches && e.touches[0]) {
                lastTouchY = e.touches[0].clientY;
            }
        };

        this._onTouchMove = (e) => {
            if (e.touches && e.touches[0] && lastTouchY !== null) {
                const dy = lastTouchY - e.touches[0].clientY;
                lastTouchY = e.touches[0].clientY;
                // Prompt 20x touch multiplier feel along the valley path
                this.scrollVelocity += dy * 0.048;
            }
        };

        this._onResize = () => {
            if (this.disposed || !this.renderer || !this.composer) return;
            const w = this.container?.clientWidth || window.innerWidth || 1;
            const h = Math.max(1, this.container?.clientHeight || window.innerHeight || 1);
            const pr = Math.min(window.devicePixelRatio || 1, 1.5);
            this.renderer.setPixelRatio(pr);
            this.renderer.setSize(w, h, false);
            this.composer.setPixelRatio(pr);
            this.composer.setSize(w, h);
            this.bloomPass.resolution.set(w, h);
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.floraUniforms.uPixelRatio.value = pr;
            this.dustUniforms.uPixelRatio.value = pr;
        };

        window.addEventListener('pointermove', this._onPointerMove, { passive: true });
        document.addEventListener('pointerleave', this._onPointerLeave, { passive: true });
        window.addEventListener('wheel', this._onWheel, { passive: true });
        window.addEventListener('touchstart', this._onTouchStart, { passive: true });
        window.addEventListener('touchmove', this._onTouchMove, { passive: true });
        window.addEventListener('resize', this._onResize, { passive: true });
    }

    startHoverTransition() {
        this.hoverTarget = 1;
    }

    stopHoverTransition() {
        this.hoverTarget = 0;
    }

    setScrollDim(dim) {
        this.scrollDimTarget = Math.max(0, Math.min(1, dim));
    }

    _updateScene(dt) {
        const elapsed = this.clock.elapsedTime;

        // Intro descent settles in ~0.85s, matching loader reveal -> UI fade-in handoff
        this.introElapsed += dt;
        const introT = Math.min(1, this.introElapsed / 0.9);
        if (introT >= 1 && !this.introReported) {
            this.introReported = true;
            this.onIntroDone?.();
        }

        // Smooth hover dispersal + scroll dim interpolation
        this.disperseValue += (this.hoverTarget - this.disperseValue) * Math.min(1, dt * 4.5);
        this.scrollDimValue += (this.scrollDimTarget - this.scrollDimValue) * Math.min(1, dt * 5.0);
        this.mouseActiveValue += (this.mouseActiveTarget - this.mouseActiveValue) * Math.min(1, dt * 5.0);

        // Brake camera forward speed toward 0 during startHoverTransition()
        const flightActive = 1 - this.disperseValue;
        const idleDrift = 2.6 * flightActive;
        this.scrollVelocity *= Math.pow(0.06, dt);
        const speed = idleDrift + this.scrollVelocity * flightActive;
        this.travelDistance += speed * dt;

        const camZ = -this.travelDistance;
        const targetX = getValleyCenterX(camZ);
        const floorY = getValleyTerrainY(targetX, camZ);
        const introDrop = (1 - Math.pow(introT, 2)) * 4.5;
        const camY = floorY + 2.85 + Math.sin(elapsed * 0.45) * 0.14 + introDrop;

        // Subtle camera banking toward look-ahead canyon path + mouse cursor tilt
        const lookZ = camZ - 14;
        const lookX = getValleyCenterX(lookZ) + this.mouseTilt.x * 1.85;
        const lookY = getValleyTerrainY(lookX, lookZ) + 2.15 + this.mouseTilt.y * 1.15;

        this.camera.position.set(targetX + this.mouseTilt.x * 0.45, camY, camZ);
        this.camera.lookAt(lookX, lookY, lookZ);
        this.camera.rotation.z = -this.mouseTilt.x * 0.045;

        const aspect = this.camera.aspect || 16 / 9;
        this.floraUniforms.uTime.value = elapsed;
        this.floraUniforms.uCameraZ.value = camZ;
        this.floraUniforms.uMouseNDC.value.copy(this.mouseNDC);
        this.floraUniforms.uMouseActive.value = this.mouseActiveValue;
        this.floraUniforms.uAspect.value = aspect;
        this.floraUniforms.uDisperse.value = this.disperseValue;
        this.floraUniforms.uScrollDim.value = this.scrollDimValue;

        this.dustUniforms.uTime.value = elapsed;
        this.dustUniforms.uCameraZ.value = camZ;
        this.dustUniforms.uDisperse.value = this.disperseValue;
        this.dustUniforms.uScrollDim.value = this.scrollDimValue;

        // Reposition volumetric light rays continuously ahead/around camera along valley curves
        const halfLoop = VALLEY_LOOP_LENGTH * 0.5;
        this.rays.forEach((ray) => {
            const relZ =
                ((((ray.userData.baseZ - camZ + halfLoop) % VALLEY_LOOP_LENGTH) + VALLEY_LOOP_LENGTH) %
                    VALLEY_LOOP_LENGTH) -
                halfLoop;
            const wz = camZ + relZ;
            const wx = getValleyCenterX(wz) + ray.userData.sideOffset;
            const wy = getValleyTerrainY(wx, wz) + 8.5;
            ray.position.set(wx, wy, wz);
            ray.lookAt(this.camera.position.x, wy, this.camera.position.z);
        });
        this.rayMat.opacity = 0.22 * (1 - this.scrollDimValue * 0.65);

        const normSpeed = Math.min(1, Math.abs(this.scrollVelocity) * 0.085);
        this.postPass.uniforms.uTime.value = elapsed;
        this.postPass.uniforms.uSpeed.value = normSpeed;
        this.postPass.uniforms.uScrollDim.value = this.scrollDimValue;
        this.bloomPass.strength = 0.66 * (1 - this.scrollDimValue * 0.45) + this.disperseValue * 0.18;
    }

    _loop() {
        if (this.disposed) return;
        if (!document.hidden) {
            const dt = Math.min(0.05, this.clock.getDelta() || 0.016);
            this._updateScene(dt);
            this.composer.render();
        } else {
            this.clock.getDelta();
        }
        this.rafId = requestAnimationFrame(() => this._loop());
    }

    dispose() {
        this.disposed = true;
        if (this.rafId) cancelAnimationFrame(this.rafId);

        window.removeEventListener('pointermove', this._onPointerMove);
        document.removeEventListener('pointerleave', this._onPointerLeave);
        window.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('resize', this._onResize);

        if (this.floraPoints) {
            this.floraPoints.geometry.dispose();
            this.floraPoints.material.dispose();
        }
        if (this.dustPoints) {
            this.dustPoints.geometry.dispose();
            this.dustPoints.material.dispose();
        }
        if (this.rays?.length) {
            this.rays[0].geometry.dispose();
            this.rayMat?.dispose();
        }
        this.atlasTex?.dispose();
        this.rayTex?.dispose();
        this.composer?.dispose?.();
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement?.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
    }
}
