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

function drawCrispWildflower(ctx, cx, cy, outerR, petals, variant = 0) {
    ctx.save();
    ctx.translate(cx, cy);

    // Subtle soft ambient glow halo strictly within petal circle (keeps dark background punchy)
    const halo = ctx.createRadialGradient(0, 0, outerR * 0.08, 0, 0, outerR * 0.96);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
    halo.addColorStop(0.55, 'rgba(255, 255, 255, 0.08)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, outerR * 0.96, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + variant * 0.28;
        ctx.save();
        ctx.rotate(angle);

        const grad = ctx.createRadialGradient(0, -outerR * 0.44, outerR * 0.04, 0, -outerR * 0.44, outerR * 0.52);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.7, 'rgba(248, 244, 238, 0.92)');
        grad.addColorStop(1, 'rgba(226, 220, 212, 0.14)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -outerR * 0.06);
        ctx.bezierCurveTo(
            outerR * (variant === 1 ? 0.18 : 0.3),
            -outerR * 0.28,
            outerR * (variant === 1 ? 0.15 : 0.34),
            -outerR * 0.82,
            0,
            -outerR * 0.9
        );
        ctx.bezierCurveTo(
            -outerR * (variant === 1 ? 0.15 : 0.34),
            -outerR * 0.82,
            -outerR * (variant === 1 ? 0.18 : 0.3),
            -outerR * 0.28,
            0,
            -outerR * 0.06
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Bright incandescent pollen center
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, outerR * 0.22);
    core.addColorStop(0, 'rgba(255, 253, 236, 1)');
    core.addColorStop(0.55, 'rgba(255, 235, 160, 0.92)');
    core.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, outerR * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawCrispLeaf(ctx, cx, cy, radius) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.4);

    const grad = ctx.createLinearGradient(0, -radius * 0.84, 0, radius * 0.84);
    grad.addColorStop(0, 'rgba(235, 248, 235, 0.94)');
    grad.addColorStop(0.6, 'rgba(195, 220, 198, 0.82)');
    grad.addColorStop(1, 'rgba(130, 160, 138, 0.25)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.84);
    ctx.bezierCurveTo(radius * 0.38, -radius * 0.26, radius * 0.34, radius * 0.42, 0, radius * 0.82);
    ctx.bezierCurveTo(-radius * 0.34, radius * 0.42, -radius * 0.38, -radius * 0.26, 0, -radius * 0.84);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, radius * 0.72);
    ctx.lineTo(0, -radius * 0.72);
    ctx.stroke();

    ctx.restore();
}

function createBotanicalAtlasTexture() {
    const size = 1024;
    const cell = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);

    // Quadrant top-left (UV x:0..0.5, y:0.5..1.0): 5-petal Alpine Poppy
    drawCrispWildflower(ctx, cell * 0.5, cell * 0.5, 192, 5, 0);
    // Quadrant top-right (UV x:0.5..1.0, y:0.5..1.0): 6-petal Star Flower
    drawCrispWildflower(ctx, cell * 1.5, cell * 0.5, 196, 6, 1);
    // Quadrant bottom-left (UV x:0..0.5, y:0..0.5): 8-petal Daisy / Cosmos
    drawCrispWildflower(ctx, cell * 0.5, cell * 1.5, 190, 8, 2);
    // Quadrant bottom-right (UV x:0.5..1.0, y:0..0.5): Night Leaf
    drawCrispLeaf(ctx, cell * 1.5, cell * 1.5, 188);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
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
    grad.addColorStop(0, 'rgba(245, 239, 226, 0.0)');
    grad.addColorStop(0.24, 'rgba(245, 239, 226, 0.12)');
    grad.addColorStop(0.58, 'rgba(216, 180, 254, 0.06)');
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
uniform float uWarp;

attribute float aScale;
attribute float aPhase;
attribute vec2 aTile;
attribute float aAngle;
attribute float aIsLeaf;
attribute vec3 aColor;
attribute vec3 aDisperseDir;

varying vec2 vTile;
varying float vAngle;
varying float vAlpha;
varying float vMouseGlow;
varying float vDisperse;
varying float vWarp;
varying vec3 vColor;

void main() {
    vTile = aTile;
    vAngle = aAngle + sin(uTime * 0.45 + aPhase) * 0.12 + uWarp * (2.6 + aPhase);
    vColor = aColor;
    vDisperse = uDisperse;
    vWarp = uWarp;

    // Seamless infinite canyon modulo around active camera Z
    float halfLoop = uLoopLen * 0.5;
    float relZ = mod(position.z - uCameraZ + halfLoop, uLoopLen) - halfLoop;
    vec3 worldPos = vec3(position.x, position.y, uCameraZ + relZ);

    // Gentle living meadow breeze across stems & petals
    float breeze = sin(uTime * 1.15 + aPhase + worldPos.x * 0.25) * 0.14;
    worldPos.x += breeze * (1.0 - aIsLeaf * 0.45);
    worldPos.y += cos(uTime * 0.9 + aPhase) * 0.06;

    // Hover transition (on #go hover): flowers scatter upward & outward into floating glowing bokeh orbs
    worldPos += aDisperseDir * (uDisperse * (7.5 + 3.2 * sin(aPhase + uTime * 0.65)));
    worldPos.y += uDisperse * (1.8 + sin(aPhase * 1.7 + uTime * 0.9) * 1.25);

    // Black-hole dive spiral on #go click
    float swirlAngle = uWarp * (2.4 + aPhase * 0.25);
    float sc = cos(swirlAngle);
    float ss = sin(swirlAngle);
    vec2 spunXY = mat2(sc, -ss, ss, sc) * (worldPos.xy - vec2(0.0, 2.0));
    worldPos.xy = mix(worldPos.xy, spunXY * max(0.08, 1.0 - uWarp * 0.72) + vec2(0.0, 2.0), uWarp);
    worldPos.z += uWarp * 24.0;

    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
    float dist = max(0.5, -mvPosition.z);

    // Flowers bloom from buds into full blossoms as they approach camera; leaves populate slopes further back
    float flowerGrow = smoothstep(56.0, 10.0, dist) * (1.0 - smoothstep(2.4, 0.7, dist));
    float leafGrow = smoothstep(76.0, 20.0, dist) * (1.0 - smoothstep(3.6, 1.0, dist));
    float stageScale = mix(flowerGrow, leafGrow, aIsLeaf);

    vec4 clipPos = projectionMatrix * mvPosition;
    float absW = max(0.001, clipPos.w);
    vec2 ndc = clipPos.xy / absW;

    // Screen-space radial cursor push + warm golden luminescence
    vec2 diff = ndc - uMouseNDC;
    diff.x *= uAspect;
    float mouseDist = length(diff);
    float radius = 0.32;
    float pushStrength = pow(max(0.0, 1.0 - smoothstep(0.0, radius, mouseDist)), 2.0) * uMouseActive * (1.0 - uWarp);
    vec2 pushDir = mouseDist > 0.0005 ? normalize(diff) : vec2(0.0, 1.0);
    pushDir.x /= max(0.35, uAspect);
    clipPos.xy += pushDir * (pushStrength * 0.22 * absW);
    clipPos.y += pushStrength * 0.04 * absW;

    vMouseGlow = pushStrength;

    float baseSize = aScale * (aIsLeaf > 0.5 ? 12.0 : 14.5) * (0.28 + 0.88 * stageScale);
    baseSize *= (1.0 + pushStrength * 0.45 - uDisperse * 0.15) * (1.0 + uWarp * 0.35);

    gl_Position = clipPos;
    gl_PointSize = clamp((baseSize * uPixelRatio * 48.0) / dist, 2.0, 62.0);

    float farFade = 1.0 - smoothstep(46.0, 92.0, dist);
    float nearFade = smoothstep(0.7, 2.4, dist);
    float baseAlpha = mix(0.96, 0.74, aIsLeaf);
    float orbBoost = mix(1.0, 0.92, uDisperse * aIsLeaf);
    vAlpha = farFade * nearFade * mix(stageScale, 0.86, uDisperse * 0.7) * baseAlpha * orbBoost * (1.0 - smoothstep(0.68, 1.0, uWarp));
}
`;

const FLORA_FRAGMENT_SHADER = `
uniform sampler2D uAtlas;
uniform float uScrollDim;

varying vec2 vTile;
varying float vAngle;
varying float vAlpha;
varying float vMouseGlow;
varying float vDisperse;
varying float vWarp;
varying vec3 vColor;

void main() {
    if (vAlpha <= 0.01) discard;

    // Strict circular radial boundary around sprite center (never clips flat square/triangular corners!)
    vec2 centered = gl_PointCoord - 0.5;
    float r = length(centered) * 2.0;
    if (r > 0.98) discard;

    float c = cos(vAngle);
    float s = sin(vAngle);
    vec2 rotated = mat2(c, -s, s, c) * centered + 0.5;

    // Exact quadrant coordinates precomputed in JS vertex attribute vTile (zero mod/floor wrapping seam bugs!)
    vec2 localUv = clamp(rotated, 0.04, 0.96) * 0.5;
    vec2 atlasUV = vTile + localUv;

    vec4 tex = texture2D(uAtlas, atlasUV);
    float orb = exp(-r * r * 3.8);

    // Morph sharp crisp blossoms into glowing bokeh firefly orbs during #go hover or vortex dive
    float morph = max(vDisperse * 0.94, vWarp * 0.95);
    float shapeAlpha = mix(tex.a, orb, morph);
    vec3 petalTint = tex.rgb * vColor;
    vec3 orbTint = vColor * 1.65;
    vec3 tint = mix(petalTint, orbTint, morph * 0.85);

    vec3 hoverGlowCol = vec3(1.0, 0.94, 0.82);
    tint = mix(tint, hoverGlowCol, vMouseGlow * 0.76);
    tint *= (1.0 + vMouseGlow * 1.15);

    float dimFactor = mix(1.0, 0.36, uScrollDim);
    float finalAlpha = shapeAlpha * vAlpha * mix(1.0, 0.62, uScrollDim);
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
uniform float uWarp;

attribute float aScale;
attribute float aPhase;

varying float vAlpha;

void main() {
    float halfLoop = uLoopLen * 0.5;
    float relZ = mod(position.z - uCameraZ + halfLoop, uLoopLen) - halfLoop;
    vec3 pos = vec3(position.x, position.y, uCameraZ + relZ);

    pos.x += sin(uTime * 0.45 + aPhase) * 1.3;
    pos.y += mod(uTime * 0.35 + aPhase, 6.0) - 2.0;

    float swirl = uWarp * (3.2 + aPhase);
    float sc = cos(swirl);
    float ss = sin(swirl);
    vec2 spun = mat2(sc, -ss, ss, sc) * (pos.xy - vec2(0.0, 2.0));
    pos.xy = mix(pos.xy, spun * (1.0 - uWarp * 0.7) + vec2(0.0, 2.0), uWarp);
    pos.z += uWarp * 36.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = max(1.0, -mv.z);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((aScale * uPixelRatio * 42.0 * (1.0 + uWarp * 1.4)) / dist, 1.4, 16.0);

    float fade = (1.0 - smoothstep(32.0, 75.0, dist)) * smoothstep(1.8, 6.0, dist);
    vAlpha = fade * (0.35 + 0.35 * sin(uTime * 1.7 + aPhase)) * (1.0 + uDisperse * 0.9 + uWarp);
}
`;

const DUST_FRAGMENT_SHADER = `
uniform float uScrollDim;
varying float vAlpha;

void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d) * 4.0;
    if (r > 1.0) discard;
    float glow = exp(-r * 3.4);
    vec3 col = mix(vec3(0.98, 0.74, 0.45), vec3(0.98, 0.96, 0.92), glow);
    gl_FragColor = vec4(col * mix(1.0, 0.45, uScrollDim), glow * vAlpha);
}
`;

const VALLEY_POST_SHADER = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uScrollDim: { value: 0 },
        uWarp: { value: 0 },
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
        uniform float uWarp;
        varying vec2 vUv;

        float hash12(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
        }

        void main() {
            vec2 centered = vUv - 0.5;
            float radial = length(centered);

            vec2 sampleVec = centered;
            if (uWarp > 0.001) {
                float theta = atan(sampleVec.y, sampleVec.x);
                float swirlAngle = uWarp * (4.2 * (1.0 - smoothstep(0.0, 0.75, radial)) + 1.8);
                float pinch = radial * (1.0 - uWarp * 0.36 * exp(-radial * 2.2));
                sampleVec = vec2(cos(theta + swirlAngle), sin(theta + swirlAngle)) * pinch;
            }
            vec2 sampleUv = clamp(0.5 + sampleVec, 0.002, 0.998);

            float chromaOffset = (0.0012 + clamp(uSpeed * 0.0038, 0.0, 0.005) + uWarp * 0.018) * (radial * radial + uWarp * 0.25);
            vec2 dir = radial > 0.0001 ? centered / radial : vec2(0.0);

            float r = texture2D(tDiffuse, clamp(sampleUv + dir * chromaOffset, 0.001, 0.999)).r;
            float g = texture2D(tDiffuse, sampleUv).g;
            float b = texture2D(tDiffuse, clamp(sampleUv - dir * chromaOffset, 0.001, 0.999)).b;
            vec3 col = vec3(r, g, b);

            if (uWarp > 0.001) {
                float horizonR = mix(0.01, 0.56, pow(uWarp, 1.35));
                float ringMask = exp(-pow((radial - horizonR * 1.15) * 14.0, 2.0)) * sin(clamp(uWarp, 0.0, 1.0) * 3.14159);
                col += vec3(0.98, 0.52, 0.32) * (ringMask * 0.85);
                col += vec3(0.75, 0.58, 0.98) * (ringMask * 0.38);

                float swallow = smoothstep(horizonR + 0.08, max(0.0, horizonR - 0.14), radial);
                col *= (1.0 - swallow * min(1.0, uWarp * 1.18));
                col *= (1.0 - smoothstep(0.76, 1.0, uWarp));
            }

            float vigRadius = mix(0.86, 0.62, clamp(uSpeed * 1.1, 0.0, 1.0));
            float vig = 1.0 - smoothstep(vigRadius - 0.36, vigRadius + 0.16, radial * 1.28);
            col *= mix(0.24, 1.0, vig);

            float n = (hash12(gl_FragCoord.xy + fract(uTime * 17.3) * 100.0) - 0.5) * 0.02;
            col += n * (1.0 - uScrollDim * 0.5);

            col = mix(col, vec3(0.024, 0.027, 0.035), uScrollDim * 0.52);

            gl_FragColor = vec4(max(col, 0.0), 1.0);
        }
    `,
};

// Discrete atlas offsets matching WebGL flipY=true UVs: [top-left, top-right, bottom-left, bottom-right]
const ATLAS_TILE_OFFSETS = [
    [0.0, 0.5],
    [0.5, 0.5],
    [0.0, 0.0],
    [0.5, 0.0],
];

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
        this.warpActive = false;
        this.warpStart = 0;
        this.warpProgress = 0;
        this.warpResolve = null;
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
        renderer.toneMappingExposure = 1.08;
        renderer.setClearColor(0x000000, 1);
        this.container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0x000000, 0.022);
        this.scene = scene;

        const camera = new THREE.PerspectiveCamera(56, width / height, 0.35, 140);
        this.camera = camera;

        const pathPoints = createValleyPathPoints(VALLEY_LOOP_LENGTH, 18).map(
            (p) => new THREE.Vector3(p.x, p.y, p.z)
        );
        this.valleySpline = new THREE.CatmullRomCurve3(pathPoints, true, 'catmullrom', 0.5);

        this._buildFloraAndLeaves(pixelRatio);
        this._buildDustParticles(pixelRatio);
        this._buildLightRays();

        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            0.52,
            0.44,
            0.44
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

        const flowerCount = 10500;
        const leafCount = 4500;
        const total = flowerCount + leafCount;

        const positions = new Float32Array(total * 3);
        const scales = new Float32Array(total);
        const phases = new Float32Array(total);
        const tiles = new Float32Array(total * 2);
        const angles = new Float32Array(total);
        const isLeafAttr = new Float32Array(total);
        const colors = new Float32Array(total * 3);
        const disperseDirs = new Float32Array(total * 3);

        const orangeAmber = [
            new THREE.Color('#ff6b2b'),
            new THREE.Color('#f59e0b'),
            new THREE.Color('#ea580c'),
            new THREE.Color('#fbbf24'),
        ];
        const violetIris = [
            new THREE.Color('#a855f7'),
            new THREE.Color('#c084fc'),
            new THREE.Color('#e9d5ff'),
            new THREE.Color('#9333ea'),
        ];
        const roseMagenta = [
            new THREE.Color('#ec4899'),
            new THREE.Color('#fb7185'),
            new THREE.Color('#f472b6'),
            new THREE.Color('#fda4af'),
        ];
        const creamMoon = [
            new THREE.Color('#f5efe2'),
            new THREE.Color('#fde68a'),
            new THREE.Color('#e9d5ff'),
        ];
        const forestLeafPalette = [
            new THREE.Color('#1f4027'),
            new THREE.Color('#2d5a36'),
            new THREE.Color('#142919'),
            new THREE.Color('#3b6e44'),
        ];

        for (let i = 0; i < total; i++) {
            const isLeaf = i >= flowerCount;
            const z = -rand() * VALLEY_LOOP_LENGTH;
            const centerX = getValleyCenterX(z);

            const side = rand() > 0.5 ? 1 : -1;
            const lateralPower = Math.pow(rand(), 0.78);
            const lateral = lateralPower * (isLeaf ? 28.0 : 25.0);
            const x = centerX + side * lateral;
            const y = getValleyTerrainY(x, z) + (isLeaf ? 0.15 + rand() * 0.65 : 0.3 + rand() * 0.85);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            scales[i] = isLeaf ? 0.7 + rand() * 1.1 : 0.62 + rand() * 1.18;
            phases[i] = rand() * Math.PI * 2;
            const tileIdx = isLeaf ? 3 : Math.floor(rand() * 3);
            const [tu, tv] = ATLAS_TILE_OFFSETS[tileIdx];
            tiles[i * 2] = tu;
            tiles[i * 2 + 1] = tv;
            angles[i] = rand() * Math.PI * 2;
            isLeafAttr[i] = isLeaf ? 1 : 0;

            let col;
            if (isLeaf) {
                col = forestLeafPalette[Math.floor(rand() * forestLeafPalette.length)];
            } else {
                const speciesNoise =
                    Math.sin(x * 0.24 + z * 0.16) +
                    0.65 * Math.cos(x * 0.39 - z * 0.29) +
                    (rand() - 0.5) * 0.45;
                if (speciesNoise < -0.35) {
                    col = orangeAmber[Math.floor(rand() * orangeAmber.length)];
                } else if (speciesNoise < 0.25) {
                    col = violetIris[Math.floor(rand() * violetIris.length)];
                } else if (speciesNoise < 0.85) {
                    col = roseMagenta[Math.floor(rand() * roseMagenta.length)];
                } else {
                    col = creamMoon[Math.floor(rand() * creamMoon.length)];
                }
            }

            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;

            const dAng = rand() * Math.PI * 2;
            disperseDirs[i * 3] = Math.cos(dAng) * (0.7 + rand() * 1.2);
            disperseDirs[i * 3 + 1] = 0.2 + rand() * 1.3;
            disperseDirs[i * 3 + 2] = Math.sin(dAng) * (0.6 + rand() * 1.1);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
        geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        geo.setAttribute('aTile', new THREE.BufferAttribute(tiles, 2));
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
            uWarp: { value: 0 },
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
            uWarp: { value: 0 },
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
            opacity: 0.16,
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
            this.scrollVelocity += e.deltaY * 0.015;
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
                this.scrollVelocity += dy * 0.048;
            }
        };

        this._onResize = () => {
            if (this.disposed || !this.renderer || !this.composer) return;
            const w = this.container?.clientWidth || window.innerWidth || 1;
            const h = Math.max(1, this.container?.clientHeight || window.innerHeight || 900);
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

    triggerWarpHole() {
        if (!this.renderer || !this.composer || this.warpActive) return Promise.resolve();
        this.warpActive = true;
        this.warpStart = this.clock ? this.clock.elapsedTime : 0;
        this.warpProgress = 0;
        this.hoverTarget = 0;
        return new Promise((resolve) => {
            this.warpResolve = resolve;
        });
    }

    resetWarp() {
        this.warpActive = false;
        this.warpProgress = 0;
        if (this.camera) {
            this.camera.fov = 56;
            this.camera.updateProjectionMatrix();
        }
    }

    _updateScene(dt) {
        const elapsed = this.clock.elapsedTime;

        this.introElapsed += dt;
        const introT = Math.min(1, this.introElapsed / 0.9);
        if (introT >= 1 && !this.introReported) {
            this.introReported = true;
            this.onIntroDone?.();
        }

        if (this.warpActive) {
            const rawWarp = Math.min(1, (elapsed - this.warpStart) / 1.35);
            this.warpProgress = rawWarp;
            if (rawWarp >= 1) {
                this.warpActive = false;
                const res = this.warpResolve;
                this.warpResolve = null;
                res?.();
            }
        } else if (this.warpProgress > 0.001) {
            this.warpProgress += (0 - this.warpProgress) * Math.min(1, dt * 6.0);
            if (this.warpProgress < 0.005) this.warpProgress = 0;
        }

        const wCurve = Math.sin(Math.min(1, this.warpProgress) * Math.PI * 0.5);
        this.disperseValue += (this.hoverTarget - this.disperseValue) * Math.min(1, dt * 4.5);
        this.scrollDimValue += (this.scrollDimTarget - this.scrollDimValue) * Math.min(1, dt * 5.0);
        this.mouseActiveValue += (this.mouseActiveTarget - this.mouseActiveValue) * Math.min(1, dt * 5.0);

        const flightActive = 1 - this.disperseValue;
        const idleDrift = 2.6 * flightActive + wCurve * 34.0;
        this.scrollVelocity *= Math.pow(0.06, dt);
        const speed = idleDrift + this.scrollVelocity * flightActive;
        this.travelDistance += speed * dt;

        const camZ = -this.travelDistance;
        const targetX = getValleyCenterX(camZ);
        const floorY = getValleyTerrainY(targetX, camZ);
        const introDrop = (1 - Math.pow(introT, 2)) * 4.5;
        const camY = floorY + 3.25 + Math.sin(elapsed * 0.45) * 0.14 + introDrop;

        // Gaze downward into the lush meadow floor while opening dark night sky across upper half
        const lookZ = camZ - 16;
        const lookX = getValleyCenterX(lookZ) + this.mouseTilt.x * 1.85;
        const lookY = getValleyTerrainY(lookX, lookZ) + 0.18 + this.mouseTilt.y * 1.15;

        const targetFov = 56 + wCurve * 36;
        if (Math.abs(this.camera.fov - targetFov) > 0.08) {
            this.camera.fov = targetFov;
            this.camera.updateProjectionMatrix();
        }

        this.camera.position.set(targetX + this.mouseTilt.x * 0.45, camY, camZ);
        this.camera.lookAt(lookX, lookY, lookZ);
        this.camera.rotation.z = -this.mouseTilt.x * 0.045 + wCurve * Math.PI * 2.0;

        const aspect = this.camera.aspect || 16 / 9;
        this.floraUniforms.uTime.value = elapsed;
        this.floraUniforms.uCameraZ.value = camZ;
        this.floraUniforms.uMouseNDC.value.copy(this.mouseNDC);
        this.floraUniforms.uMouseActive.value = this.mouseActiveValue;
        this.floraUniforms.uAspect.value = aspect;
        this.floraUniforms.uDisperse.value = this.disperseValue;
        this.floraUniforms.uScrollDim.value = this.scrollDimValue;
        this.floraUniforms.uWarp.value = this.warpProgress;

        this.dustUniforms.uTime.value = elapsed;
        this.dustUniforms.uCameraZ.value = camZ;
        this.dustUniforms.uDisperse.value = this.disperseValue;
        this.dustUniforms.uScrollDim.value = this.scrollDimValue;
        this.dustUniforms.uWarp.value = this.warpProgress;

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
        this.rayMat.opacity = 0.16 * (1 - this.scrollDimValue * 0.65) * (1 - wCurve * 0.8);

        const normSpeed = Math.min(1, Math.abs(this.scrollVelocity) * 0.085);
        this.postPass.uniforms.uTime.value = elapsed;
        this.postPass.uniforms.uSpeed.value = normSpeed;
        this.postPass.uniforms.uScrollDim.value = this.scrollDimValue;
        this.postPass.uniforms.uWarp.value = this.warpProgress;
        this.bloomPass.strength = 0.52 * (1 - this.scrollDimValue * 0.45) + this.disperseValue * 0.28 + wCurve * 0.25;
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

        if (this._onPointerMove) {
            window.removeEventListener('pointermove', this._onPointerMove);
            document.removeEventListener('pointerleave', this._onPointerLeave);
            window.removeEventListener('wheel', this._onWheel);
            window.removeEventListener('touchstart', this._onTouchStart);
            window.removeEventListener('touchmove', this._onTouchMove);
            window.removeEventListener('resize', this._onResize);
        }

        if (this.floraPoints) {
            this.floraPoints.geometry.dispose();
            this.floraPoints.material.dispose();
        }
        if (this.dustPoints) {
            this.dustPoints.geometry.dispose();
            this.dustPoints.material.dispose();
        }
        this.rays?.forEach((r) => r.geometry.dispose());
        this.rayMat?.dispose();
        this.atlasTex?.dispose();
        this.rayTex?.dispose();
        this.composer?.dispose();
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement?.remove();
        }
    }
}
