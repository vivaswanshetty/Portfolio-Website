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
} from './nightValleyMath';

function createCrystalSpireGeometry() {
    // 6-sided asymmetric pointed crystal prism converted to non-indexed for crisp flat facets
    const shaft = new THREE.CylinderGeometry(0.16, 0.34, 1.35, 6, 1, false);
    shaft.translate(0, 0.675, 0);
    const tip = new THREE.ConeGeometry(0.16, 0.65, 6, 1);
    tip.translate(0, 1.675, 0);

    const sNon = shaft.toNonIndexed();
    const tNon = tip.toNonIndexed();
    const sPos = sNon.attributes.position.array;
    const tPos = tNon.attributes.position.array;

    const merged = new Float32Array(sPos.length + tPos.length);
    merged.set(sPos, 0);
    merged.set(tPos, sPos.length);

    shaft.dispose();
    tip.dispose();
    sNon.dispose();
    tNon.dispose();

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(merged, 3));
    geo.computeVertexNormals();
    return geo;
}

function createShardClusterGeometry() {
    // Sharp faceted octahedron elongated vertically into a dual-tip quartz shard
    const oct = new THREE.OctahedronGeometry(0.45, 0);
    oct.scale(0.58, 1.85, 0.48);
    const nonIdx = oct.toNonIndexed();
    oct.dispose();
    nonIdx.computeVertexNormals();
    return nonIdx;
}

function createLightRayTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(248, 250, 252, 0.0)');
    grad.addColorStop(0.25, 'rgba(248, 250, 252, 0.09)');
    grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(108, 0);
    ctx.lineTo(148, 0);
    ctx.lineTo(232, 512);
    ctx.lineTo(24, 512);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

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

    pos.x += sin(uTime * 0.45 + aPhase) * 1.1;
    pos.y += mod(uTime * 0.35 + aPhase, 6.0) - 2.0;

    // During black-hole dive, pull star motes radially toward camera corridor
    if (uWarp > 0.001) {
        float ang = aPhase + uWarp * 8.0;
        pos.xy = mix(pos.xy, vec2(cos(ang), sin(ang)) * (1.2 + mod(aPhase * 3.0, 5.0)), uWarp * 0.65);
    }

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float dist = max(1.0, -mv.z);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((aScale * uPixelRatio * 34.0) / dist, 1.0, 9.0);

    float fade = (1.0 - smoothstep(32.0, 72.0, dist)) * smoothstep(1.6, 5.0, dist);
    vAlpha = fade * (0.28 + 0.35 * sin(uTime * 1.9 + aPhase)) * (1.0 + uDisperse * 0.65 + uWarp * 1.2);
}
`;

const DUST_FRAGMENT_SHADER = `
uniform float uScrollDim;
varying float vAlpha;

void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d) * 4.0;
    if (r > 1.0) discard;
    float glow = smoothstep(1.0, 0.0, r);
    vec3 col = mix(vec3(0.94, 0.27, 0.27), vec3(0.98, 0.98, 1.0), glow * 0.75);
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
            float angle = atan(centered.y, centered.x);

            // Black-hole gravitational lensing swirl & tunnel pinch during uWarp dive
            float pinch = mix(1.0, 0.42, uWarp * smoothstep(0.65, 0.0, radial));
            float swirl = uWarp * 1.65 * (1.0 - smoothstep(0.0, 0.62, radial));
            float rotAng = angle + swirl;
            vec2 warpedUV = 0.5 + vec2(cos(rotAng), sin(rotAng)) * (radial * pinch);
            vec2 sampleCenter = warpedUV - 0.5;

            // Split-RGB chromatic displacement strongest at screen edges + warp dive speed
            float warpSpeedBoost = uWarp * 0.018;
            float chromaOffset = (0.0012 + clamp(uSpeed * 0.0034 + warpSpeedBoost, 0.0, 0.02)) * radial * radial;
            vec2 dir = radial > 0.0001 ? sampleCenter / radial : vec2(0.0);

            float r = texture2D(tDiffuse, warpedUV + dir * chromaOffset).r;
            float g = texture2D(tDiffuse, warpedUV).g;
            float b = texture2D(tDiffuse, warpedUV - dir * chromaOffset).b;
            vec3 col = vec3(r, g, b);

            // Dynamic vignette tightening with movement velocity
            float vigRadius = mix(0.86, 0.56, clamp(uSpeed * 1.0 + uWarp * 0.9, 0.0, 1.0));
            float vig = 1.0 - smoothstep(vigRadius - 0.35, vigRadius + 0.16, radial * 1.25);
            col *= mix(0.28, 1.0, vig);

            // Molten accretion horizon ring + dark singularity core during warp loop dive
            if (uWarp > 0.001) {
                float ringTarget = mix(0.32, 0.06, clamp(uWarp * 1.05, 0.0, 1.0));
                float ringBand = exp(-pow((radial - ringTarget) * 16.0, 2.0)) * sin(clamp(uWarp, 0.0, 1.0) * 3.14159);
                col += vec3(0.96, 0.32, 0.34) * (ringBand * 1.6);
                col += vec3(0.45, 0.85, 1.0) * (ringBand * 0.45);

                // Event-horizon black core swells smoothly to transition into About
                float horizonRadius = smoothstep(0.28, 0.95, uWarp) * 0.85;
                float insideVoid = 1.0 - smoothstep(horizonRadius - 0.08, horizonRadius + 0.04, radial);
                col *= (1.0 - insideVoid * smoothstep(0.35, 0.98, uWarp));
            }

            // Crisp micro grain
            float n = (hash12(gl_FragCoord.xy + fract(uTime * 17.3) * 100.0) - 0.5) * 0.018;
            col += n * (1.0 - uScrollDim * 0.5);

            // Soften contrast cleanly behind Liquid Glass About prose
            col = mix(col, vec3(0.024, 0.027, 0.035), uScrollDim * 0.45);

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
                antialias: true,
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
        renderer.toneMappingExposure = 1.15;
        renderer.setClearColor(0x060709, 1);
        this.container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060709);
        scene.fog = new THREE.FogExp2(0x060709, 0.0175);
        this.scene = scene;

        const camera = new THREE.PerspectiveCamera(54, width / height, 0.35, 160);
        this.camera = camera;

        // Sharp directional specular key + crimson ridge rim + roving camera torch & cursor glint
        const hemi = new THREE.HemisphereLight(0xf8fafc, 0x060709, 0.55);
        const moonKey = new THREE.DirectionalLight(0xe2e8f0, 1.85);
        moonKey.position.set(16, 28, -24);
        const crimsonRim = new THREE.DirectionalLight(0xef4444, 2.2);
        crimsonRim.position.set(-18, 12, 16);

        this.cameraTorch = new THREE.PointLight(0xffffff, 3.2, 42, 1.3);
        this.crimsonTorch = new THREE.PointLight(0xef4444, 4.0, 48, 1.2);
        this.cursorLight = new THREE.PointLight(0x38bdf8, 4.5, 24, 1.4);

        scene.add(hemi, moonKey, crimsonRim, this.cameraTorch, this.crimsonTorch, this.cursorLight);

        this._buildCrystalValley();
        this._buildDustParticles(pixelRatio);
        this._buildLightRays();

        // Crisp MSAA-backed EffectComposer with tight-threshold bloom so crystals stay razor sharp
        const renderTarget = new THREE.WebGLRenderTarget(width, height, {
            samples: 4,
            type: THREE.HalfFloatType,
        });
        const composer = new EffectComposer(renderer, renderTarget);
        const renderPass = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            0.34,
            0.22,
            0.78
        );
        const postPass = new ShaderPass(VALLEY_POST_SHADER);
        const outputPass = new OutputPass();

        composer.addPass(renderPass);
        composer.addPass(bloomPass);
        composer.addPass(postPass);
        composer.addPass(outputPass);

        this.composer = composer;
        this.renderTarget = renderTarget;
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

    _buildCrystalMesh(geometry, count, isCoreShard, rand) {
        this.crystalShaderUniforms = this.crystalShaderUniforms || {
            uTime: { value: 0 },
            uCameraZ: { value: 0 },
            uLoopLen: { value: VALLEY_LOOP_LENGTH },
            uDisperse: { value: 0 },
            uWarp: { value: 0 },
            uMouseNDC: { value: new THREE.Vector2(99, 99) },
            uMouseActive: { value: 0 },
            uAspect: { value: 16 / 9 },
        };
        const sharedUniforms = this.crystalShaderUniforms;

        const mat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            flatShading: true,
            metalness: isCoreShard ? 0.35 : 0.65,
            roughness: isCoreShard ? 0.1 : 0.16,
            clearcoat: 1.0,
            clearcoatRoughness: 0.06,
            emissive: isCoreShard ? new THREE.Color('#be123c') : new THREE.Color('#0b070e'),
            emissiveIntensity: isCoreShard ? 0.9 : 0.35,
            reflectivity: 0.95,
        });

        mat.customProgramCacheKey = () => (isCoreShard ? 'crystal-core-v1' : 'crystal-dark-v1');
        mat.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, sharedUniforms);

            shader.vertexShader = shader.vertexShader
                .replace(
                    '#include <common>',
                    `#include <common>
                    uniform float uTime;
                    uniform float uCameraZ;
                    uniform float uLoopLen;
                    uniform float uDisperse;
                    uniform float uWarp;
                    uniform vec2 uMouseNDC;
                    uniform float uMouseActive;
                    uniform float uAspect;
                    attribute vec3 aAnchor;
                    attribute float aSeed;
                    varying float vProximityGlow;
                    `
                )
                .replace(
                    '#include <project_vertex>',
                    `
                    // Seamless infinite Z wrap around active camera depth
                    float halfLoop = uLoopLen * 0.5;
                    float relZ = mod(aAnchor.z - uCameraZ + halfLoop, uLoopLen) - halfLoop;
                    vec3 anchorWorld = vec3(aAnchor.x, aAnchor.y, uCameraZ + relZ);

                    vec4 transformedPos = vec4(transformed, 1.0);
                    #ifdef USE_INSTANCING
                        transformedPos = instanceMatrix * transformedPos;
                    #endif

                    // Replace instance translation with infinitely-wrapped anchor + dynamic hover/warp motion
                    vec3 worldVertex = anchorWorld + transformedPos.xyz;

                    // Distance crystal emergence: spires sprout upward cleanly as they enter mid-ground
                    float camDist = length(worldVertex - vec3(aAnchor.x, aAnchor.y, uCameraZ));
                    float grow = smoothstep(82.0, 20.0, abs(relZ));
                    worldVertex = anchorWorld + (worldVertex - anchorWorld) * (0.25 + 0.75 * grow);

                    // Hover dispersal lifts & floats crystal spires radially outward
                    if (uDisperse > 0.001) {
                        vec3 floatVec = vec3(cos(aSeed * 6.28), 0.75 + sin(aSeed * 12.0) * 0.4, sin(aSeed * 6.28));
                        worldVertex += floatVec * (uDisperse * 3.4);
                    }

                    // Black-hole spiral vortex pull during warp entry
                    if (uWarp > 0.001) {
                        float spiralAng = uWarp * (4.5 + aSeed * 2.5);
                        float cS = cos(spiralAng);
                        float sS = sin(spiralAng);
                        vec2 centerPull = vec2(worldVertex.x * cS - worldVertex.y * sS, worldVertex.x * sS + worldVertex.y * cS);
                        worldVertex.xy = mix(worldVertex.xy, centerPull * 0.55, uWarp * 0.7);
                        worldVertex.z += uWarp * 18.0 * (0.5 + aSeed);
                    }

                    vec4 mvPosition = viewMatrix * vec4(worldVertex, 1.0);
                    vec4 clipPos = projectionMatrix * mvPosition;
                    float absW = max(0.001, clipPos.w);
                    vec2 ndc = clipPos.xy / absW;

                    vec2 diff = ndc - uMouseNDC;
                    diff.x *= uAspect;
                    float mDist = length(diff);
                    float glow = pow(max(0.0, 1.0 - smoothstep(0.0, 0.38, mDist)), 2.0) * uMouseActive;
                    vProximityGlow = glow;

                    // Subtle magnetic deflection near cursor
                    vec2 push = mDist > 0.0005 ? normalize(diff) : vec2(0.0, 1.0);
                    push.x /= max(0.35, uAspect);
                    clipPos.xy += push * (glow * 0.14 * absW);

                    mvPosition = vec4(worldVertex, 1.0);
                    mvPosition = viewMatrix * mvPosition;
                    gl_Position = clipPos;
                    `
                );

            shader.fragmentShader = shader.fragmentShader
                .replace(
                    '#include <common>',
                    `#include <common>
                    varying float vProximityGlow;
                    `
                )
                .replace(
                    '#include <emissivemap_fragment>',
                    `#include <emissivemap_fragment>
                    totalEmissiveRadiance += vec3(0.18, 0.75, 1.0) * (vProximityGlow * 1.15);
                    totalEmissiveRadiance += vec3(0.95, 0.25, 0.3) * (vProximityGlow * 0.45);
                    `
                );
        };

        const mesh = new THREE.InstancedMesh(geometry, mat, count);
        mesh.frustumCulled = false;

        const anchors = new Float32Array(count * 3);
        const seeds = new Float32Array(count);
        const dummy = new THREE.Object3D();
        const palette = isCoreShard
            ? [
                  new THREE.Color('#ef4444'),
                  new THREE.Color('#f43f5e'),
                  new THREE.Color('#fb7185'),
                  new THREE.Color('#f8fafc'),
              ]
            : [
                  new THREE.Color('#0f121a'),
                  new THREE.Color('#1e2433'),
                  new THREE.Color('#2b111b'),
                  new THREE.Color('#9f1239'),
                  new THREE.Color('#475569'),
              ];

        for (let i = 0; i < count; i++) {
            const z = -rand() * VALLEY_LOOP_LENGTH;
            const cx = getValleyCenterX(z);
            const side = rand() > 0.5 ? 1 : -1;
            const lateralPower = Math.pow(rand(), 0.76);
            const lateral = (isCoreShard ? 2.1 : 1.75) + lateralPower * 25.0;
            const x = cx + side * lateral;
            const y = getValleyTerrainY(x, z) - 0.15;

            anchors[i * 3] = x;
            anchors[i * 3 + 1] = y;
            anchors[i * 3 + 2] = z;
            seeds[i] = rand();

            // Notice world anchor is supplied in shader via aAnchor, so dummy holds ONLY local scale & facet rotation
            const sx = isCoreShard ? 0.55 + rand() * 0.9 : 0.7 + rand() * 1.35;
            const sy = isCoreShard ? 0.9 + rand() * 1.65 : 0.75 + rand() * 2.1;
            const sz = sx * (0.85 + rand() * 0.3);

            dummy.position.set(0, 0, 0);
            dummy.scale.set(sx, sy, sz);
            dummy.rotation.set(
                (rand() - 0.5) * 0.48,
                rand() * Math.PI * 2,
                -side * (0.14 + rand() * 0.42) // Lean crystals naturally inward toward the canyon path
            );
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);

            const col = palette[Math.floor(rand() * palette.length)];
            mesh.setColorAt(i, col);
        }

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

        geometry.setAttribute('aAnchor', new THREE.InstancedBufferAttribute(anchors, 3));
        geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));

        this.scene.add(mesh);
        return { mesh, geometry, mat };
    }

    _buildCrystalValley() {
        const rand = mulberry32(2026);
        this.spireGeo = createCrystalSpireGeometry();
        this.shardGeo = createShardClusterGeometry();

        this.darkSpires = this._buildCrystalMesh(this.spireGeo, 1100, false, rand);
        this.glowShards = this._buildCrystalMesh(this.shardGeo, 620, true, rand);
    }

    _buildDustParticles(pixelRatio) {
        const rand = mulberry32(8881);
        const count = 320;
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const z = -rand() * VALLEY_LOOP_LENGTH;
            const centerX = getValleyCenterX(z);
            positions[i * 3] = centerX + (rand() - 0.5) * 32;
            positions[i * 3 + 1] = getValleyTerrainY(centerX, z) + 0.6 + rand() * 9.0;
            positions[i * 3 + 2] = z;
            scales[i] = 0.5 + rand() * 1.0;
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
        const rayGeo = new THREE.PlaneGeometry(8, 26);
        this.rayMat = new THREE.MeshBasicMaterial({
            map: this.rayTex,
            transparent: true,
            opacity: 0.14,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
        });

        this.rays = [];
        for (let i = 0; i < 6; i++) {
            const mesh = new THREE.Mesh(rayGeo, this.rayMat);
            const z = -(i / 6) * VALLEY_LOOP_LENGTH;
            const sideOffset = (i % 2 === 0 ? -1 : 1) * (6.0 + (i % 3) * 2.5);
            mesh.userData = { baseZ: z, sideOffset, tilt: (i % 2 === 0 ? 1 : -1) * 0.2 };
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

    /**
     * Triggers the 1.35s gravitational black-hole loop & tunnel fall into the About story.
     */
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
            this.camera.fov = 54;
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

        // Advance Black-Hole Warp Dive (0 -> 1 over ~1.35s, then completes cleanly)
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
        const warpSpeedBoost = Math.pow(wCurve, 1.4) * 34.0;
        const idleDrift = 2.6 * flightActive;
        this.scrollVelocity *= Math.pow(0.06, dt);
        const speed = idleDrift + this.scrollVelocity * flightActive + warpSpeedBoost;
        this.travelDistance += speed * dt;

        const camZ = -this.travelDistance;
        const targetX = getValleyCenterX(camZ);
        const floorY = getValleyTerrainY(targetX, camZ);
        const introDrop = (1 - Math.pow(introT, 2)) * 4.5;
        const fallDiveDrop = Math.pow(wCurve, 1.8) * 1.8;
        const camY = floorY + 2.85 + Math.sin(elapsed * 0.45) * 0.14 + introDrop - fallDiveDrop;

        // Expand FOV dynamically during tunnel fall (54 -> 92 deg hyper-warp) + loop barrel roll
        const targetFov = 54 + Math.pow(wCurve, 1.25) * 38;
        if (Math.abs(this.camera.fov - targetFov) > 0.05) {
            this.camera.fov = targetFov;
            this.camera.updateProjectionMatrix();
        }

        const lookZ = camZ - 14;
        const lookX = getValleyCenterX(lookZ) + this.mouseTilt.x * 1.85;
        const lookY = getValleyTerrainY(lookX, lookZ) + 2.15 + this.mouseTilt.y * 1.15 - fallDiveDrop * 0.5;

        this.camera.position.set(targetX + this.mouseTilt.x * 0.45, camY, camZ);
        this.camera.lookAt(lookX, lookY, lookZ);
        // Full 360° barrel-loop sensation during warp fall!
        this.camera.rotation.z = -this.mouseTilt.x * 0.045 + wCurve * Math.PI * 2;

        // Keep dynamic crystal lights gliding alongside camera & pointer
        this.cameraTorch.position.set(this.camera.position.x, camY + 2.2, camZ - 4.0);
        this.crimsonTorch.position.set(lookX, camY + 0.5, camZ - 14.0);
        this.cursorLight.position.set(
            this.camera.position.x + this.mouseTilt.x * 9.0,
            camY + this.mouseTilt.y * 5.0,
            camZ - 9.0
        );

        const aspect = this.camera.aspect || 16 / 9;
        if (this.crystalShaderUniforms) {
            this.crystalShaderUniforms.uTime.value = elapsed;
            this.crystalShaderUniforms.uCameraZ.value = camZ;
            this.crystalShaderUniforms.uDisperse.value = this.disperseValue;
            this.crystalShaderUniforms.uWarp.value = wCurve;
            this.crystalShaderUniforms.uMouseNDC.value.copy(this.mouseNDC);
            this.crystalShaderUniforms.uMouseActive.value = this.mouseActiveValue;
            this.crystalShaderUniforms.uAspect.value = aspect;
        }

        this.dustUniforms.uTime.value = elapsed;
        this.dustUniforms.uCameraZ.value = camZ;
        this.dustUniforms.uDisperse.value = this.disperseValue;
        this.dustUniforms.uScrollDim.value = this.scrollDimValue;
        this.dustUniforms.uWarp.value = wCurve;

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
        this.rayMat.opacity = 0.14 * (1 - this.scrollDimValue * 0.65) * (1 - wCurve * 0.5);

        const normSpeed = Math.min(1, Math.abs(this.scrollVelocity) * 0.085 + wCurve * 0.9);
        this.postPass.uniforms.uTime.value = elapsed;
        this.postPass.uniforms.uSpeed.value = normSpeed;
        this.postPass.uniforms.uScrollDim.value = this.scrollDimValue;
        this.postPass.uniforms.uWarp.value = wCurve;
        this.bloomPass.strength = 0.34 * (1 - this.scrollDimValue * 0.4) + wCurve * 0.45;
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

        if (this.darkSpires) {
            this.darkSpires.geometry.dispose();
            this.darkSpires.mat.dispose();
        }
        if (this.glowShards) {
            this.glowShards.geometry.dispose();
            this.glowShards.mat.dispose();
        }
        if (this.dustPoints) {
            this.dustPoints.geometry.dispose();
            this.dustPoints.material.dispose();
        }
        if (this.rays?.length) {
            this.rays[0].geometry.dispose();
            this.rayMat?.dispose();
        }
        this.rayTex?.dispose();
        this.renderTarget?.dispose();
        this.composer?.dispose?.();
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement?.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
    }
}
