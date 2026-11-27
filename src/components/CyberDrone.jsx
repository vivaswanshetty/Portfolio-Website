import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { X } from 'lucide-react';
import { useIntro } from '../context/useIntro';
import {
    clamp,
    lerp,
    lerpAngle,
    computeRouteTargetPose,
    computeDocumentScrollProgress,
} from '../utils/companionFlight';

const QUICK_ROUTES = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Projects (3D)', path: '/projects' },
    { label: 'Skills', path: '/skills' },
    { label: 'Resume', path: '/resume' },
    { label: 'Contact', path: '/contact' },
];

/**
 * Generates an iridescent veined translucent cyber-wing CanvasTexture oriented
 * with the wing root at left edge (u=0) pointing right (u=1).
 */
function createCyberWingTexture() {
    const w = 1024;
    const h = 576;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, w, h);

    // Subtle teardrop translucent membrane shape from left root to rounded right tip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(14, h * 0.44);
    ctx.bezierCurveTo(w * 0.32, h * 0.08, w * 0.86, h * 0.06, w * 0.97, h * 0.36);
    ctx.bezierCurveTo(w * 0.99, h * 0.58, w * 0.72, h * 0.88, w * 0.28, h * 0.78);
    ctx.bezierCurveTo(w * 0.12, h * 0.72, 26, h * 0.58, 14, h * 0.44);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, h * 0.2, w, h * 0.75);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.34)');
    grad.addColorStop(0.28, 'rgba(196, 181, 253, 0.24)');
    grad.addColorStop(0.7, 'rgba(226, 232, 255, 0.16)');
    grad.addColorStop(1, 'rgba(248, 250, 252, 0.09)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Iridescent specular rim outline
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(244, 240, 255, 0.65)';
    ctx.stroke();

    // Leading primary carbon spar + crimson root trace
    const sparGrad = ctx.createLinearGradient(0, h * 0.44, w * 0.94, h * 0.3);
    sparGrad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
    sparGrad.addColorStop(0.35, 'rgba(244, 242, 255, 0.85)');
    sparGrad.addColorStop(1, 'rgba(216, 210, 255, 0.45)');
    ctx.lineWidth = 7;
    ctx.strokeStyle = sparGrad;
    ctx.beginPath();
    ctx.moveTo(14, h * 0.44);
    ctx.bezierCurveTo(w * 0.35, h * 0.13, w * 0.74, h * 0.12, w * 0.95, h * 0.34);
    ctx.stroke();

    // Fine biomechanical venation ribs branching outward
    ctx.lineWidth = 2.2;
    const veins = [
        [w * 0.18, h * 0.34, w * 0.56, h * 0.42, w * 0.86, h * 0.49],
        [w * 0.26, h * 0.42, w * 0.54, h * 0.58, w * 0.78, h * 0.64],
        [w * 0.38, h * 0.25, w * 0.64, h * 0.29, w * 0.90, h * 0.39],
        [w * 0.14, h * 0.48, w * 0.36, h * 0.68, w * 0.58, h * 0.75],
    ];
    veins.forEach(([cx, cy, mx, my, ex, ey], idx) => {
        ctx.strokeStyle =
            idx === 0
                ? 'rgba(239, 68, 68, 0.55)'
                : 'rgba(220, 214, 255, 0.42)';
        ctx.beginPath();
        ctx.moveTo(18, h * 0.45);
        ctx.bezierCurveTo(cx, cy, mx, my, ex, ey);
        ctx.stroke();
    });
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

/**
 * Builds the procedural Cybernetic Night-Drone aligned with:
 * +X = head forward, +Y = up, +Z = right side.
 */
function buildCyberDroneRig(wingTexture) {
    const flight = new THREE.Group();
    const droneRoot = new THREE.Group();
    flight.add(droneRoot);

    const geometries = [];
    const materials = [];
    const trackGeo = (g) => {
        geometries.push(g);
        return g;
    };
    const trackMat = (m) => {
        materials.push(m);
        return m;
    };

    const obsidianMat = trackMat(
        new THREE.MeshPhysicalMaterial({
            color: 0x0b0d14,
            metalness: 0.78,
            roughness: 0.24,
            clearcoat: 0.7,
            clearcoatRoughness: 0.18,
            envMapIntensity: 0.95,
        })
    );

    const titaniumMat = trackMat(
        new THREE.MeshStandardMaterial({
            color: 0x262b3d,
            metalness: 0.9,
            roughness: 0.22,
            envMapIntensity: 1.0,
        })
    );

    const crimsonCoreMat = trackMat(
        new THREE.MeshStandardMaterial({
            color: 0xff2a3c,
            emissive: 0xef4444,
            emissiveIntensity: 2.1,
            roughness: 0.2,
            metalness: 0.2,
        })
    );

    // 1. Armored thorax + forward head pod (+X)
    const chassisGroup = new THREE.Group();
    droneRoot.add(chassisGroup);

    const thoraxGeo = trackGeo(new THREE.SphereGeometry(0.16, 28, 22));
    thoraxGeo.scale(1.25, 0.88, 0.94);
    const thorax = new THREE.Mesh(thoraxGeo, obsidianMat);
    thorax.position.set(0.08, 0.02, 0);
    chassisGroup.add(thorax);

    const headGeo = trackGeo(new THREE.SphereGeometry(0.105, 24, 18));
    headGeo.scale(1.18, 0.86, 0.96);
    const head = new THREE.Mesh(headGeo, obsidianMat);
    head.position.set(0.28, 0.0, 0);
    chassisGroup.add(head);

    // Glowing Crimson Neural Visor across front head nose (+X)
    const visorGeo = trackGeo(
        new THREE.TorusGeometry(0.088, 0.015, 12, 28, Math.PI * 0.95)
    );
    const visor = new THREE.Mesh(visorGeo, crimsonCoreMat);
    visor.position.set(0.305, 0.005, 0);
    visor.rotation.y = Math.PI / 2;
    visor.rotation.z = -Math.PI * 0.475;
    chassisGroup.add(visor);

    // Dual titanium collar cowlings + waist reactor ring
    const reactorRingGeo = trackGeo(new THREE.TorusGeometry(0.11, 0.012, 12, 32));
    const reactorRing = new THREE.Mesh(reactorRingGeo, crimsonCoreMat);
    reactorRing.rotation.y = Math.PI / 2;
    reactorRing.position.set(-0.06, -0.005, 0);
    chassisGroup.add(reactorRing);

    const dorsalPlateGeo = trackGeo(new THREE.BoxGeometry(0.22, 0.055, 0.14));
    const dorsalPlate = new THREE.Mesh(dorsalPlateGeo, titaniumMat);
    dorsalPlate.position.set(0.08, 0.12, 0);
    dorsalPlate.rotation.z = -0.14;
    chassisGroup.add(dorsalPlate);

    // Tapering segmented abdomen tail trailing along -X with glowing red ribs
    const tailSegments = [
        { x: -0.14, y: -0.025, rx: 0.13, ry: 0.115, rz: 0.12 },
        { x: -0.24, y: -0.065, rx: 0.115, ry: 0.095, rz: 0.1 },
        { x: -0.34, y: -0.11, rx: 0.09, ry: 0.075, rz: 0.08 },
        { x: -0.43, y: -0.155, rx: 0.065, ry: 0.048, rz: 0.05 },
    ];
    tailSegments.forEach((seg, idx) => {
        const g = trackGeo(new THREE.SphereGeometry(1, 22, 16));
        g.scale(seg.rx, seg.ry, seg.rz);
        const mesh = new THREE.Mesh(g, obsidianMat);
        mesh.position.set(seg.x, seg.y, 0);
        mesh.rotation.z = 0.25 + idx * 0.08;
        chassisGroup.add(mesh);

        if (idx < 3) {
            const bandG = trackGeo(
                new THREE.TorusGeometry(seg.ry * 0.92, 0.009, 10, 24)
            );
            const band = new THREE.Mesh(bandG, idx === 1 ? crimsonCoreMat : titaniumMat);
            band.rotation.y = Math.PI / 2;
            band.rotation.x = 0.22;
            band.position.set(seg.x - 0.045, seg.y - 0.015, 0);
            chassisGroup.add(band);
        }
    });

    // Forward stabilizer antennae
    [-1, 1].forEach((side) => {
        const antGeo = trackGeo(new THREE.CylinderGeometry(0.005, 0.009, 0.14, 8));
        const ant = new THREE.Mesh(antGeo, titaniumMat);
        ant.position.set(0.37, 0.07, side * 0.045);
        ant.rotation.z = -0.95;
        ant.rotation.x = side * 0.28;
        chassisGroup.add(ant);

        const tipGeo = trackGeo(new THREE.SphereGeometry(0.013, 10, 10));
        const tip = new THREE.Mesh(tipGeo, crimsonCoreMat);
        tip.position.set(0.425, 0.11, side * 0.062);
        chassisGroup.add(tip);
    });

    // 2. Twin Beating Translucent Cyber-Wings (Right +Z side & mirrored -Z left side)
    const makeWingGeo = (span) => {
        const g = trackGeo(new THREE.PlaneGeometry(span, (span * 9) / 16));
        g.translate(span / 2 - span * 0.03, 0, 0);
        g.rotateX(-Math.PI / 2);
        g.rotateY(-Math.PI / 2);
        return g;
    };

    const wingDefs = [
        { span: 0.72, sweep: -0.4, phase: 0, lift: 0.024 },
        { span: 0.5, sweep: -0.92, phase: -0.5, lift: -0.01 },
    ];
    const blurCopies = [
        { offset: 0, opacity: 0.94 },
        { offset: 0.55, opacity: 0.26 },
        { offset: -0.55, opacity: 0.26 },
    ];

    const flapGroups = [];

    const buildWingSide = (mirrored) => {
        const anchor = new THREE.Group();
        anchor.position.set(0.11, 0.12, 0.065);
        if (mirrored) {
            anchor.scale.z = -1;
            anchor.position.z = -0.065;
        }
        droneRoot.add(anchor);

        wingDefs.forEach((def) => {
            const sweepGroup = new THREE.Group();
            sweepGroup.rotation.y = def.sweep;
            sweepGroup.position.y = def.lift;
            anchor.add(sweepGroup);

            const wingGeo = makeWingGeo(def.span);

            blurCopies.forEach((copy) => {
                const flapGroup = new THREE.Group();
                const mat = trackMat(
                    new THREE.MeshBasicMaterial({
                        map: wingTexture || null,
                        color: 0xffffff,
                        transparent: true,
                        opacity: copy.opacity,
                        side: THREE.DoubleSide,
                        depthWrite: false,
                        blending: THREE.NormalBlending,
                    })
                );
                const mesh = new THREE.Mesh(wingGeo, mat);
                mesh.frustumCulled = false;
                flapGroup.add(mesh);
                sweepGroup.add(flapGroup);
                flapGroups.push({
                    group: flapGroup,
                    phase: def.phase + copy.offset,
                });
            });
        });
    };

    buildWingSide(false);
    buildWingSide(true);

    // Subtle local crimson bioluminescence illuminating wing roots
    const coreLight = new THREE.PointLight(0xef4444, 1.1, 2.5);
    coreLight.position.set(0.16, 0.08, 0);
    droneRoot.add(coreLight);

    const dispose = () => {
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
    };

    return { flight, droneRoot, flapGroups, crimsonCoreMat, dispose };
}

const CyberDrone = () => {
    const location = useLocation();
    const { isIntroActive } = useIntro();

    const canvasRef = useRef(null);
    const hitBtnRef = useRef(null);
    const pathnameRef = useRef(location.pathname);
    const hoveredRef = useRef(false);
    const suppressedRef = useRef(false);
    const screenPosRef = useRef({ x: 0, y: 0 });

    const [ready, setReady] = useState(false);
    const [domSuppressed, setDomSuppressed] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ left: 0, top: 0, flipX: true, flipY: false });

    const isSuppressed = isIntroActive || domSuppressed;

    useEffect(() => {
        pathnameRef.current = location.pathname;
        const t = setTimeout(() => setMenuOpen(false), 0);
        return () => clearTimeout(t);
    }, [location.pathname]);

    useEffect(() => {
        suppressedRef.current = isSuppressed;
        if (isSuppressed) {
            const t = setTimeout(() => setMenuOpen(false), 0);
            return () => clearTimeout(t);
        }
    }, [isSuppressed]);

    // Watch body classes / overlay elements to automatically hide behind lightboxes, splashes, or menus
    useEffect(() => {
        const checkSuppression = () => {
            const b = document.body.classList;
            const hasOverlay =
                b.contains('lit') ||
                b.contains('projects-splash') ||
                b.contains('valley-loading') ||
                Boolean(document.querySelector('.lightbox-overlay')) ||
                Boolean(document.querySelector('#mobile-navigation-menu'));
            setDomSuppressed(hasOverlay);
        };

        const initTimer = setTimeout(checkSuppression, 0);
        const observer = new MutationObserver(checkSuppression);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true,
            subtree: false,
        });

        return () => {
            clearTimeout(initTimer);
            observer.disconnect();
        };
    }, []);

    // Close popover on Escape or outside click
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        const onDown = (e) => {
            if (
                !e.target.closest('.cyber-drone-menu') &&
                !e.target.closest('.cyber-drone-hit')
            ) {
                setMenuOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        window.addEventListener('pointerdown', onDown);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('pointerdown', onDown);
        };
    }, [menuOpen]);

    // Three.js Persistent Scene + Scroll- & Route-Driven Flight Physics
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let renderer = null;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
            });
        } catch {
            return;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const roomEnv = new RoomEnvironment();
        const envRT = pmrem.fromScene(roomEnv, 0.04);
        scene.environment = envRT.texture;
        roomEnv.dispose();
        pmrem.dispose();

        const camera = new THREE.PerspectiveCamera(
            30,
            window.innerWidth / Math.max(window.innerHeight, 1),
            0.1,
            100
        );
        camera.position.set(0, 0, 10);

        const hemi = new THREE.HemisphereLight(0xeef2ff, 0x1a0b2e, 1.15);
        const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.8);
        keyLight.position.set(3, 5, 6);
        const crimsonRim = new THREE.DirectionalLight(0xff2e3b, 2.3);
        crimsonRim.position.set(-4, -1, 3);
        const violetRim = new THREE.DirectionalLight(0xa78bfa, 1.9);
        violetRim.position.set(-3, 4, -5);
        scene.add(hemi, keyLight, crimsonRim, violetRim);

        const wingTex = createCyberWingTexture();
        const drone = buildCyberDroneRig(wingTex);
        scene.add(drone.flight);

        const initMobile = window.innerWidth < 760;
        const initPose = computeRouteTargetPose(pathnameRef.current, 0, initMobile);
        const cur = {
            x: initPose.x,
            y: initPose.y,
            s: initPose.s,
            yaw: initPose.yaw,
            pitch: initPose.pitch,
            roll: initPose.roll,
        };

        const mouse = { tx: 0, ty: 0, sx: 0, sy: 0 };
        const clock = new THREE.Clock();
        const projVec = new THREE.Vector3();

        const onPointerMove = (e) => {
            const vw = window.innerWidth || 1;
            const vh = window.innerHeight || 1;
            mouse.tx = clamp((e.clientX / vw) * 2 - 1, -1, 1);
            mouse.ty = clamp(-((e.clientY / vh) * 2 - 1), -1, 1);
        };

        const onResize = () => {
            const w = window.innerWidth;
            const h = Math.max(window.innerHeight, 1);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        const mqReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        let rafId = null;
        let markedReady = false;

        const tick = () => {
            const dt = Math.max(0.001, Math.min(clock.getDelta(), 0.05));
            const t = clock.elapsedTime;
            const reduced = Boolean(mqReduced?.matches);

            const vw = window.innerWidth || 1440;
            const vh = window.innerHeight || 900;
            const isMobile = vw < 760;

            const scrollP = computeDocumentScrollProgress(
                window.scrollY,
                document.documentElement.scrollHeight,
                vh
            );
            const target = computeRouteTargetPose(pathnameRef.current, scrollP, isMobile);

            const prevX = cur.x;
            const prevY = cur.y;

            if (reduced) {
                cur.x = target.x;
                cur.y = target.y;
                cur.s = target.s;
                cur.yaw = target.yaw;
                cur.pitch = target.pitch;
                cur.roll = target.roll;
            } else {
                const k = 1 - Math.exp(-dt * 3.2);
                const kYaw = 1 - Math.exp(-dt * 2.6);
                cur.x = lerp(cur.x, target.x, k);
                cur.y = lerp(cur.y, target.y, k);
                cur.s = lerp(cur.s, target.s, k);
                cur.yaw = lerpAngle(cur.yaw, hoveredRef.current ? 102 : target.yaw, kYaw);
                cur.pitch = lerp(cur.pitch, target.pitch, k);
                cur.roll = lerp(cur.roll, target.roll, k);
            }

            const vx = (cur.x - prevX) / dt;
            const vy = (cur.y - prevY) / dt;
            const flightSpeed = clamp(Math.hypot(vx, vy) * 0.45, 0, 1);
            const moving = Math.max(target.moving, flightSpeed);

            const km = 1 - Math.exp(-dt * 2);
            mouse.sx = lerp(mouse.sx, reduced ? 0 : mouse.tx, km);
            mouse.sy = lerp(mouse.sy, reduced ? 0 : mouse.ty, km);

            const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            const halfW = halfH * camera.aspect;
            const hover = reduced ? 0 : Math.sin(t * 2.1) * 0.045 + Math.sin(t * 3.7) * 0.015;

            drone.flight.position.set(
                cur.x * halfW + (reduced ? 0 : Math.sin(t * 1.3) * 0.035 + mouse.sx * 0.1),
                cur.y * halfH + hover * halfH * 0.5 + mouse.sy * 0.06,
                reduced ? 0 : Math.sin(t * 0.9) * 0.14
            );

            // ~19% viewport height base scale keeps companion sleek and unobstructed across routes
            const droneScale = halfH * 2 * 0.19 * cur.s;
            drone.flight.scale.setScalar(droneScale);

            const yawRad = THREE.MathUtils.degToRad(-(cur.yaw + mouse.sx * 12));
            drone.flight.rotation.set(0, yawRad, 0);

            const pitchDeg =
                cur.pitch -
                clamp(vy * 18, -26, 26) +
                (reduced ? 0 : Math.sin(t * 2.1 + 1) * 2.8) +
                mouse.sy * 6;
            const rollDeg =
                cur.roll +
                clamp(vx * 14, -28, 28) +
                (reduced ? 0 : Math.sin(t * 1.7) * 3.5);

            drone.droneRoot.rotation.set(
                THREE.MathUtils.degToRad(rollDeg),
                0,
                THREE.MathUtils.degToRad(pitchDeg),
                'YZX'
            );

            // Pulse crimson neural visor softly on hover/flight
            drone.crimsonCoreMat.emissiveIntensity = hoveredRef.current
                ? 3.2
                : 1.9 + moving * 1.1 + Math.sin(t * 3.5) * 0.25;

            // Wing beat physics matching Melli Section 5g (paused cleanly under reduced motion)
            if (reduced) {
                for (let i = 0; i < drone.flapGroups.length; i++) {
                    drone.flapGroups[i].group.rotation.set(-0.18, 0.08, 0);
                }
            } else {
                const freq = Math.PI * 2 * (16 + moving * 6);
                for (let i = 0; i < drone.flapGroups.length; i++) {
                    const f = drone.flapGroups[i];
                    const a = Math.sin(t * freq + f.phase);
                    f.group.rotation.x = -0.22 + a * 0.92;
                    f.group.rotation.y = a * 0.16;
                }
            }

            // Sync projected 2D hit-target directly on GPU without React re-renders
            projVec.copy(drone.flight.position).project(camera);
            const screenX = (projVec.x * 0.5 + 0.5) * vw;
            const screenY = (-projVec.y * 0.5 + 0.5) * vh;
            screenPosRef.current.x = screenX;
            screenPosRef.current.y = screenY;

            if (hitBtnRef.current) {
                hitBtnRef.current.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0)`;
            }

            if (!suppressedRef.current) {
                renderer.render(scene, camera);
            }

            if (!markedReady) {
                markedReady = true;
                setReady(true);
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('resize', onResize);
            drone.dispose();
            wingTex?.dispose();
            envRT.dispose();
            renderer.dispose();
        };
    }, []);

    const handleToggleMenu = () => {
        if (menuOpen) {
            setMenuOpen(false);
            return;
        }
        const vw = window.innerWidth || 1440;
        const vh = window.innerHeight || 900;
        const { x, y } = screenPosRef.current;
        const flipX = x > vw * 0.55;
        const flipY = y > vh * 0.55;

        setMenuPos({
            left: clamp(flipX ? x - 235 : x + 38, 14, Math.max(14, vw - 229)),
            top: clamp(flipY ? y - 270 : y - 24, 16, Math.max(16, vh - 295)),
            flipX,
            flipY,
        });
        setMenuOpen(true);
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                className={`cyber-drone-canvas${ready ? ' ready' : ''}${isSuppressed ? ' suppressed' : ''}`}
                aria-hidden="true"
            />

            <button
                ref={hitBtnRef}
                type="button"
                onClick={handleToggleMenu}
                onMouseEnter={() => {
                    hoveredRef.current = true;
                }}
                onMouseLeave={() => {
                    hoveredRef.current = false;
                }}
                className={`cyber-drone-hit${isSuppressed ? ' suppressed' : ''}${menuOpen ? ' open' : ''}`}
                aria-label="Open quick navigation menu from 3D companion"
                aria-expanded={menuOpen}
            >
                <span className="cyber-drone-hint">{menuOpen ? 'Close' : 'Jump'}</span>
            </button>

            {menuOpen && !isSuppressed && (
                <div
                    className="cyber-drone-menu"
                    role="dialog"
                    aria-label="Quick Route Navigation"
                    style={{
                        left: `${menuPos.left}px`,
                        top: `${menuPos.top}px`,
                    }}
                >
                    <div className="cyber-drone-menu-hdr">
                        <span>V-CORE NAVIGATOR</span>
                        <button
                            type="button"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close quick navigator"
                            style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                        >
                            <X size={13} />
                        </button>
                    </div>
                    {QUICK_ROUTES.map((item) => {
                        const isActive =
                            item.path === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={`cyber-drone-menu-item${isActive ? ' active' : ''}`}
                            >
                                <span>{item.label}</span>
                                {isActive && <span className="cyber-drone-menu-dot" />}
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default CyberDrone;
