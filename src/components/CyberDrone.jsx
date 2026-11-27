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
    enforcePerimeterExclusion,
} from '../utils/companionFlight';

// Outer orbital patrol anchors around screen margins (never crossing center headlines)
const PERIMETER_SECTORS = [
    { x: 0.80, y: 0.56, yaw: 142 },
    { x: 0.82, y: 0.14, yaw: 162 },
    { x: 0.80, y: -0.50, yaw: 132 },
    { x: 0.62, y: -0.62, yaw: 118 },
    { x: -0.64, y: -0.62, yaw: 52 },
    { x: -0.80, y: -0.44, yaw: 34 },
    { x: -0.82, y: 0.18, yaw: 24 },
    { x: -0.78, y: 0.56, yaw: 44 },
];

const QUICK_ROUTES = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Projects (3D)', path: '/projects' },
    { label: 'Skills', path: '/skills' },
    { label: 'Resume', path: '/resume' },
    { label: 'Contact', path: '/contact' },
];

/**
 * Generates a radial motion-blur rotor disc CanvasTexture for high-RPM ducted VTOL fans.
 */
function createRotorBlurTexture() {
    const size = 512;
    const half = size / 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(half, half);

    // Outer swept rim shimmer (cyan-silver stealth ring)
    const ring = ctx.createRadialGradient(0, 0, half * 0.22, 0, 0, half * 0.96);
    ring.addColorStop(0, 'rgba(56, 189, 248, 0.02)');
    ring.addColorStop(0.65, 'rgba(148, 163, 184, 0.14)');
    ring.addColorStop(0.88, 'rgba(56, 189, 248, 0.36)');
    ring.addColorStop(0.96, 'rgba(239, 68, 68, 0.25)');
    ring.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(0, 0, half * 0.96, 0, Math.PI * 2);
    ctx.fill();

    // Swept motion-blur rotor blade arcs
    for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 2);
        const bladeGrad = ctx.createLinearGradient(0, -18, half * 0.88, 18);
        bladeGrad.addColorStop(0, 'rgba(226, 232, 240, 0.45)');
        bladeGrad.addColorStop(0.6, 'rgba(148, 163, 184, 0.24)');
        bladeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(half * 0.16, -6);
        ctx.arc(0, 0, half * 0.9, -0.18, 0.22);
        ctx.lineTo(half * 0.16, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

/**
 * Builds a procedural Stealth VTOL Cyber-Drone inspired by crimson/carbon ducted-rotor
 * interceptors and glossy obsidian canopies (+X = forward, +Y = up, +Z = right wing).
 */
function buildCyberDroneRig(rotorBlurTexture) {
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

    const carbonArmorMat = trackMat(
        new THREE.MeshPhysicalMaterial({
            color: 0x13161f,
            metalness: 0.78,
            roughness: 0.34,
            clearcoat: 0.38,
            clearcoatRoughness: 0.28,
            envMapIntensity: 1.05,
        })
    );

    const crimsonArmorMat = trackMat(
        new THREE.MeshPhysicalMaterial({
            color: 0xd92638,
            metalness: 0.72,
            roughness: 0.24,
            clearcoat: 0.85,
            clearcoatRoughness: 0.16,
            envMapIntensity: 1.15,
        })
    );

    const titaniumMat = trackMat(
        new THREE.MeshStandardMaterial({
            color: 0x333b4d,
            metalness: 0.92,
            roughness: 0.22,
            envMapIntensity: 1.1,
        })
    );

    const canopyGlassMat = trackMat(
        new THREE.MeshPhysicalMaterial({
            color: 0x05070d,
            metalness: 0.94,
            roughness: 0.08,
            clearcoat: 1.0,
            clearcoatRoughness: 0.04,
            envMapIntensity: 1.4,
        })
    );

    const cyanOpticMat = trackMat(
        new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x22d3ee,
            emissiveIntensity: 2.5,
            roughness: 0.15,
            metalness: 0.15,
        })
    );

    const crimsonCoreMat = trackMat(
        new THREE.MeshStandardMaterial({
            color: 0xff3b30,
            emissive: 0xef4444,
            emissiveIntensity: 2.4,
            roughness: 0.18,
            metalness: 0.2,
        })
    );

    const plasmaPlumeMat = trackMat(
        new THREE.MeshBasicMaterial({
            color: 0xa855f7,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
        })
    );

    const plasmaCoreMat = trackMat(
        new THREE.MeshBasicMaterial({
            color: 0x67e8f9,
            transparent: true,
            opacity: 0.78,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
        })
    );

    const rotorBlurMat = trackMat(
        new THREE.MeshBasicMaterial({
            map: rotorBlurTexture || null,
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
            depthWrite: false,
        })
    );

    const chassisGroup = new THREE.Group();
    droneRoot.add(chassisGroup);

    // 1. Stealth Faceted Fuselage Core + Tapered Delta Nose (+X)
    const hullGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.19, 0.46, 6));
    hullGeo.rotateZ(-Math.PI / 2);
    hullGeo.scale(1.0, 0.56, 1.08);
    const hull = new THREE.Mesh(hullGeo, carbonArmorMat);
    hull.position.set(0.02, 0.01, 0);
    chassisGroup.add(hull);

    // Sharp armored wedge prow extending toward +X
    const prowGeo = trackGeo(new THREE.ConeGeometry(0.125, 0.34, 4));
    prowGeo.rotateX(Math.PI / 4);
    prowGeo.rotateZ(-Math.PI / 2);
    prowGeo.scale(1.0, 0.48, 1.05);
    const prow = new THREE.Mesh(prowGeo, carbonArmorMat);
    prow.position.set(0.32, -0.012, 0);
    chassisGroup.add(prow);

    // Metallic Crimson Front Cheek Fairings (Image 1 signature armor panels)
    [-1, 1].forEach((side) => {
        const cheekGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.068, 0.095));
        const cheek = new THREE.Mesh(cheekGeo, crimsonArmorMat);
        cheek.position.set(0.19, 0.02, side * 0.085);
        cheek.rotation.y = side * -0.26;
        cheek.rotation.z = -0.18;
        chassisGroup.add(cheek);

        // Twin angled Electric-Cyan Optic Visor Slits below crimson brows
        const slitGeo = trackGeo(new THREE.BoxGeometry(0.075, 0.014, 0.022));
        const slit = new THREE.Mesh(slitGeo, cyanOpticMat);
        slit.position.set(0.285, 0.016, side * 0.062);
        slit.rotation.y = side * -0.35;
        slit.rotation.z = -0.22;
        chassisGroup.add(slit);
    });

    // Recessed Circular Cyan AI Optic Lens at nose apex (Image 2 signature)
    const opticRingGeo = trackGeo(new THREE.TorusGeometry(0.024, 0.0055, 10, 24));
    const opticRing = new THREE.Mesh(opticRingGeo, cyanOpticMat);
    opticRing.rotation.y = Math.PI / 2;
    opticRing.position.set(0.39, -0.005, 0);
    chassisGroup.add(opticRing);

    // Glossy Smoked Obsidian Canopy + Cyan Spine HUD Seam (Image 3 signature)
    const canopyGeo = trackGeo(new THREE.SphereGeometry(0.12, 24, 18));
    canopyGeo.scale(1.75, 0.54, 0.76);
    const canopy = new THREE.Mesh(canopyGeo, canopyGlassMat);
    canopy.position.set(0.06, 0.078, 0);
    chassisGroup.add(canopy);

    const seamGeo = trackGeo(new THREE.BoxGeometry(0.28, 0.008, 0.01));
    const seam = new THREE.Mesh(seamGeo, cyanOpticMat);
    seam.position.set(0.08, 0.132, 0);
    seam.rotation.z = -0.08;
    chassisGroup.add(seam);

    // Stepped Dorsal Carbon Spine Louvers trailing rearward
    [0, 1, 2].forEach((idx) => {
        const louverGeo = trackGeo(new THREE.BoxGeometry(0.085 - idx * 0.01, 0.028, 0.16 - idx * 0.018));
        const louver = new THREE.Mesh(louverGeo, idx === 0 ? titaniumMat : carbonArmorMat);
        louver.position.set(-0.08 - idx * 0.08, 0.095 - idx * 0.012, 0);
        louver.rotation.z = 0.14;
        chassisGroup.add(louver);
    });

    // Ventral Underslung Gimbal Mechanical Assembly + Micro Targeting Nodes
    const bellyGeo = trackGeo(new THREE.CylinderGeometry(0.085, 0.052, 0.11, 8));
    const belly = new THREE.Mesh(bellyGeo, titaniumMat);
    belly.position.set(0.02, -0.085, 0);
    chassisGroup.add(belly);

    const bellyLedGeo = trackGeo(new THREE.BoxGeometry(0.025, 0.012, 0.04));
    const bellyLed = new THREE.Mesh(bellyLedGeo, crimsonCoreMat);
    bellyLed.position.set(0.07, -0.118, 0);
    chassisGroup.add(bellyLed);

    // 2. Twin Rear Vectored Thruster Pods & Additive Plasma Plumes (-X tail)
    const thrusterCones = [];
    [-1, 1].forEach((side) => {
        const nozGeo = trackGeo(new THREE.CylinderGeometry(0.042, 0.056, 0.13, 14));
        nozGeo.rotateZ(Math.PI / 2);
        const noz = new THREE.Mesh(nozGeo, titaniumMat);
        noz.position.set(-0.24, 0.005, side * 0.082);
        noz.rotation.y = side * 0.06;
        chassisGroup.add(noz);

        const throatGeo = trackGeo(new THREE.TorusGeometry(0.036, 0.007, 10, 20));
        const throat = new THREE.Mesh(throatGeo, crimsonCoreMat);
        throat.rotation.y = Math.PI / 2;
        throat.position.set(-0.305, 0.005, side * 0.085);
        chassisGroup.add(throat);

        // Inner cyan/white plasma core cone (base at nozzle exit extending -X)
        const plumeGroup = new THREE.Group();
        plumeGroup.position.set(-0.31, 0.005, side * 0.086);
        plumeGroup.rotation.z = Math.PI / 2;
        chassisGroup.add(plumeGroup);

        const coreConeGeo = trackGeo(new THREE.ConeGeometry(0.026, 0.24, 12, 1, true));
        coreConeGeo.translate(0, 0.12, 0);
        const coreCone = new THREE.Mesh(coreConeGeo, plasmaCoreMat);
        plumeGroup.add(coreCone);

        const outerConeGeo = trackGeo(new THREE.ConeGeometry(0.042, 0.36, 12, 1, true));
        outerConeGeo.translate(0, 0.18, 0);
        const outerCone = new THREE.Mesh(outerConeGeo, plasmaPlumeMat);
        plumeGroup.add(outerCone);

        thrusterCones.push(plumeGroup);
    });

    // 3. Swept Delta Wing Pylons + Dual Tilt-Rotor Ducted VTOL Pods + Vertical Ember Nacelles (±Z)
    const rotorGroups = [];
    const tiltPodGroups = [];

    const buildVTOLSide = (sideSign) => {
        // Swept stealth wing strut connecting hull to shoulder turbine
        const pylonGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.036, 0.22));
        const pylon = new THREE.Mesh(pylonGeo, carbonArmorMat);
        pylon.position.set(0.04, 0.052, sideSign * 0.18);
        pylon.rotation.x = sideSign * -0.14;
        pylon.rotation.y = sideSign * 0.24;
        droneRoot.add(pylon);

        // Articulated VTOL Turbine Pod Group (tilts forward during acceleration)
        const podGroup = new THREE.Group();
        podGroup.position.set(0.04, 0.095, sideSign * 0.31);
        droneRoot.add(podGroup);
        tiltPodGroups.push(podGroup);

        // Crimson Outer Armored Duct Shroud + Gunmetal Intake Barrel
        const shroudGeo = trackGeo(new THREE.TorusGeometry(0.115, 0.028, 14, 32));
        shroudGeo.rotateX(Math.PI / 2);
        const shroud = new THREE.Mesh(shroudGeo, crimsonArmorMat);
        podGroup.add(shroud);

        const ductWallGeo = trackGeo(new THREE.CylinderGeometry(0.105, 0.095, 0.068, 24, 1, true));
        const ductWall = new THREE.Mesh(ductWallGeo, titaniumMat);
        podGroup.add(ductWall);

        // Shoulder Armor Cowl wrapping outside edge of duct (Image 1!)
        const cowlGeo = trackGeo(new THREE.BoxGeometry(0.16, 0.048, 0.09));
        const cowl = new THREE.Mesh(cowlGeo, crimsonArmorMat);
        cowl.position.set(-0.02, 0.034, sideSign * 0.075);
        cowl.rotation.x = sideSign * 0.25;
        podGroup.add(cowl);

        // Glowing internal cyan stator ring
        const innerRingGeo = trackGeo(new THREE.TorusGeometry(0.095, 0.005, 8, 24));
        innerRingGeo.rotateX(Math.PI / 2);
        const innerRing = new THREE.Mesh(innerRingGeo, cyanOpticMat);
        innerRing.position.y = -0.015;
        podGroup.add(innerRing);

        // Spinning 4-Blade Hub + Motion-Blur Rotor Disc
        const rotorSpinGroup = new THREE.Group();
        podGroup.add(rotorSpinGroup);

        const hubGeo = trackGeo(new THREE.CylinderGeometry(0.024, 0.028, 0.045, 12));
        const hub = new THREE.Mesh(hubGeo, titaniumMat);
        rotorSpinGroup.add(hub);

        const bladeGeo = trackGeo(new THREE.BoxGeometry(0.175, 0.006, 0.022));
        for (let b = 0; b < 2; b++) {
            const blade = new THREE.Mesh(bladeGeo, carbonArmorMat);
            blade.rotation.y = (b * Math.PI) / 2;
            blade.rotation.x = 0.22;
            rotorSpinGroup.add(blade);
        }

        const blurDiscGeo = trackGeo(new THREE.CircleGeometry(0.1, 24));
        blurDiscGeo.rotateX(-Math.PI / 2);
        const blurDisc = new THREE.Mesh(blurDiscGeo, rotorBlurMat);
        blurDisc.position.y = 0.008;
        rotorSpinGroup.add(blurDisc);

        rotorGroups.push({ group: rotorSpinGroup, dir: sideSign });

        // Vertical Hanging Armored Fin / Side Nacelle with Ember LED Array (Image 1 & 2!)
        const finGroup = new THREE.Group();
        finGroup.position.set(0.01, -0.14, sideSign * 0.34);
        finGroup.rotation.x = sideSign * -0.12;
        droneRoot.add(finGroup);

        const finGeo = trackGeo(new THREE.BoxGeometry(0.145, 0.24, 0.058));
        const fin = new THREE.Mesh(finGeo, carbonArmorMat);
        fin.rotation.z = -0.12;
        finGroup.add(fin);

        const finCapGeo = trackGeo(new THREE.BoxGeometry(0.11, 0.065, 0.065));
        const finCap = new THREE.Mesh(finCapGeo, crimsonArmorMat);
        finCap.position.set(0.02, 0.075, sideSign * 0.006);
        finCap.rotation.z = -0.12;
        finGroup.add(finCap);

        // Vertical stack of 4 glowing ember-crimson LED telemetry bars (Image 1!)
        for (let ledIdx = 0; ledIdx < 4; ledIdx++) {
            const ledGeo = trackGeo(new THREE.BoxGeometry(0.018, 0.012, 0.014));
            const led = new THREE.Mesh(ledGeo, crimsonCoreMat);
            led.position.set(0.068 - ledIdx * 0.004, 0.01 - ledIdx * 0.028, sideSign * 0.028);
            finGroup.add(led);
        }

        // Cyan micro tip strobe at bottom edge of fin
        const tipLedGeo = trackGeo(new THREE.BoxGeometry(0.02, 0.02, 0.02));
        const tipLed = new THREE.Mesh(tipLedGeo, cyanOpticMat);
        tipLed.position.set(0.038, -0.098, sideSign * 0.015);
        finGroup.add(tipLed);
    };

    buildVTOLSide(1);
    buildVTOLSide(-1);

    // Local dual accent lights catching brushed metal edges & crimson cowlings
    const crimsonLight = new THREE.PointLight(0xef4444, 1.35, 2.8);
    crimsonLight.position.set(0.15, 0.14, 0);
    const cyanLight = new THREE.PointLight(0x22d3ee, 0.9, 2.4);
    cyanLight.position.set(0.35, -0.02, 0);
    droneRoot.add(crimsonLight, cyanLight);

    const dispose = () => {
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
    };

    return {
        flight,
        droneRoot,
        rotorGroups,
        tiltPodGroups,
        thrusterCones,
        crimsonCoreMat,
        cyanOpticMat,
        plasmaPlumeMat,
        plasmaCoreMat,
        dispose,
    };
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
                b.contains('projects-intro') ||
                b.contains('about-valley-locked') ||
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

        const rotorBlurTex = createRotorBlurTexture();
        const drone = buildCyberDroneRig(rotorBlurTex);
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

        const mouse = { tx: 0, ty: 0, sx: 0, sy: 0, vx: 0, vy: 0, lastT: performance.now(), active: false };
        const timer = new THREE.Timer();
        timer.connect(document);
        const projVec = new THREE.Vector3();

        // Autonomous non-repeating flight director (organic reconnaissance orbits + reactive evasion)
        const navAI = {
            sectorIdx: 0,
            nextSwitchAt: 2.8 + Math.random() * 2.0,
            offsetX: 0,
            offsetY: 0,
            goalOffsetX: 0,
            goalOffsetY: 0,
            phase: Math.random() * Math.PI * 2,
            dodgeVx: 0,
            dodgeVy: 0,
            rollKick: 0,
            boost: 0,
            lastDodgeAt: -10,
        };

        const pickNextSector = (nowElapsed) => {
            // Choose a distinct non-adjacent perimeter sector so motion feels spontaneous & never loops identically
            const step = 2 + Math.floor(Math.random() * (PERIMETER_SECTORS.length - 3));
            navAI.sectorIdx = (navAI.sectorIdx + step) % PERIMETER_SECTORS.length;
            navAI.nextSwitchAt = nowElapsed + 2.8 + Math.random() * 2.6;
        };

        const onPointerMove = (e) => {
            const vw = window.innerWidth || 1;
            const vh = window.innerHeight || 1;
            const nx = clamp((e.clientX / vw) * 2 - 1, -1, 1);
            const ny = clamp(-((e.clientY / vh) * 2 - 1), -1, 1);
            const now = performance.now();
            const dtMs = Math.max(8, now - mouse.lastT);
            mouse.vx = ((nx - mouse.tx) / dtMs) * 1000;
            mouse.vy = ((ny - mouse.ty) / dtMs) * 1000;
            mouse.lastT = now;
            mouse.tx = nx;
            mouse.ty = ny;
            mouse.active = true;

            // Reactive proximity evade when cursor sweeps rapidly right across the drone's flank
            const distToDrone = Math.hypot(nx - cur.x, ny - cur.y);
            const speed = Math.hypot(mouse.vx, mouse.vy);
            if (distToDrone < 0.28 && speed > 1.75 && !hoveredRef.current && now - navAI.lastDodgeAt > 1200) {
                navAI.lastDodgeAt = now;
                const pushAngle = Math.atan2(cur.y - ny, cur.x - nx) + (Math.random() - 0.5) * 0.7;
                navAI.dodgeVx = Math.cos(pushAngle) * 0.65;
                navAI.dodgeVy = Math.sin(pushAngle) * 0.52;
                navAI.rollKick = (mouse.vx >= 0 ? -1 : 1) * 38;
                navAI.boost = 1.0;
                pickNextSector(timer.getElapsed());
            }
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
            timer.update();
            const dt = Math.max(0.001, Math.min(timer.getDelta(), 0.05));
            const t = timer.getElapsed();
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

            if (!reduced && !hoveredRef.current) {
                if (t >= navAI.nextSwitchAt) {
                    pickNextSector(t);
                }
                const sec = PERIMETER_SECTORS[navAI.sectorIdx];
                // Blend route scroll flow (58%) with spontaneous outer-sector reconnaissance (42%)
                const blendW = pathnameRef.current === '/projects' ? 0.14 : isMobile ? 0.18 : 0.42;
                navAI.goalOffsetX = (sec.x - target.x) * blendW;
                navAI.goalOffsetY = (sec.y - target.y) * blendW;
            } else if (hoveredRef.current) {
                navAI.goalOffsetX *= 0.92;
                navAI.goalOffsetY *= 0.92;
            }

            navAI.offsetX = lerp(navAI.offsetX, navAI.goalOffsetX, 1 - Math.exp(-dt * 1.4));
            navAI.offsetY = lerp(navAI.offsetY, navAI.goalOffsetY, 1 - Math.exp(-dt * 1.4));

            // Irrational dual-frequency organic drift so patrol path never repeats identically
            const ph = navAI.phase;
            const freeWanderX = reduced || hoveredRef.current ? 0 : Math.sin(t * 0.71 + ph) * 0.055 + Math.cos(t * 1.19 + ph * 1.6) * 0.03;
            const freeWanderY = reduced || hoveredRef.current ? 0 : Math.cos(t * 0.89 + ph * 1.3) * 0.065 + Math.sin(t * 1.43 + ph * 0.7) * 0.028;

            // Cursor curiosity attraction (steers gently along outer flank toward pointer quad when pointer moves)
            const cursorPullX = reduced || !mouse.active || hoveredRef.current ? 0 : clamp(mouse.sx * 0.12, -0.14, 0.14);
            const cursorPullY = reduced || !mouse.active || hoveredRef.current ? 0 : clamp(mouse.sy * 0.10, -0.12, 0.12);

            navAI.dodgeVx *= Math.exp(-dt * 3.8);
            navAI.dodgeVy *= Math.exp(-dt * 3.8);
            navAI.rollKick *= Math.exp(-dt * 4.5);
            navAI.boost *= Math.exp(-dt * 2.8);

            const rawGoalX = target.x + navAI.offsetX + freeWanderX + cursorPullX + navAI.dodgeVx;
            const rawGoalY = target.y + navAI.offsetY + freeWanderY + cursorPullY + navAI.dodgeVy;
            const safeGoal = enforcePerimeterExclusion(rawGoalX, rawGoalY, isMobile);

            if (reduced) {
                cur.x = target.x;
                cur.y = target.y;
                cur.s = target.s;
                cur.yaw = target.yaw;
                cur.pitch = target.pitch;
                cur.roll = target.roll;
            } else {
                const steerSpeed = hoveredRef.current ? 4.2 : 1.9 + navAI.boost * 2.4;
                const k = 1 - Math.exp(-dt * steerSpeed);
                const kYaw = 1 - Math.exp(-dt * 3.2);
                cur.x = lerp(cur.x, safeGoal.x, k);
                cur.y = lerp(cur.y, safeGoal.y, k);
                cur.s = lerp(cur.s, target.s * (1 + navAI.boost * 0.14), k);

                // Orient drone naturally in flight direction OR track user pointer curiously
                const moveDx = safeGoal.x - cur.x;
                const lookTargetX = Math.abs(moveDx) > 0.06 ? moveDx : mouse.sx - cur.x;
                const desiredHeadingYaw = lookTargetX >= 0 ? 42 : 138;
                const desiredYaw = hoveredRef.current
                    ? 102
                    : lerpAngle(target.yaw, desiredHeadingYaw, mouse.active ? 0.65 : 0.4);

                cur.yaw = lerpAngle(cur.yaw, desiredYaw, kYaw);
                cur.pitch = lerp(cur.pitch, target.pitch + (mouse.sy - cur.y) * 5, k);
                cur.roll = lerp(cur.roll, target.roll + navAI.rollKick, k);
            }

            const vx = (cur.x - prevX) / dt;
            const vy = (cur.y - prevY) / dt;
            const flightSpeed = clamp(Math.hypot(vx, vy) * 0.55 + navAI.boost * 0.7, 0, 1);
            const moving = Math.max(target.moving, flightSpeed);

            const km = 1 - Math.exp(-dt * 2.2);
            mouse.sx = lerp(mouse.sx, reduced ? 0 : mouse.tx, km);
            mouse.sy = lerp(mouse.sy, reduced ? 0 : mouse.ty, km);

            const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            const halfW = halfH * camera.aspect;
            const hover = reduced ? 0 : Math.sin(t * 2.1 + navAI.phase) * 0.042 + Math.sin(t * 3.7) * 0.015;

            drone.flight.position.set(
                cur.x * halfW + (reduced ? 0 : Math.sin(t * 1.3 + navAI.phase) * 0.025),
                cur.y * halfH + hover * halfH * 0.45,
                reduced ? 0 : Math.sin(t * 0.9 + navAI.phase) * 0.18
            );

            // ~18% viewport height base scale keeps companion sleek and unobstructed across routes
            const droneScale = halfH * 2 * 0.185 * cur.s;
            drone.flight.scale.setScalar(droneScale);

            const yawRad = THREE.MathUtils.degToRad(-(cur.yaw + mouse.sx * 16));
            drone.flight.rotation.set(0, yawRad, 0);

            const pitchDeg =
                cur.pitch -
                clamp(vy * 22, -28, 28) +
                (reduced ? 0 : Math.sin(t * 2.1 + 1) * 3.2) +
                mouse.sy * 8;
            const rollDeg =
                cur.roll +
                clamp(vx * 18, -32, 32) +
                (reduced ? 0 : Math.sin(t * 1.7 + navAI.phase) * 4.0);

            drone.droneRoot.rotation.set(
                THREE.MathUtils.degToRad(rollDeg),
                0,
                THREE.MathUtils.degToRad(pitchDeg),
                'YZX'
            );

            // Pulse cyan optics, crimson ember arrays, and afterburner plasma jets dynamically
            drone.crimsonCoreMat.emissiveIntensity = hoveredRef.current
                ? 3.2
                : 1.9 + moving * 1.1 + Math.sin(t * 3.5) * 0.25;
            drone.cyanOpticMat.emissiveIntensity = hoveredRef.current
                ? 3.4
                : 2.3 + moving * 0.8 + Math.sin(t * 4.2 + 0.8) * 0.2;

            const jetStretch = 0.72 + moving * 0.78 + (reduced ? 0 : Math.sin(t * 28) * 0.06);
            drone.plasmaCoreMat.opacity = 0.55 + moving * 0.35;
            drone.plasmaPlumeMat.opacity = 0.36 + moving * 0.34;
            for (let i = 0; i < drone.thrusterCones.length; i++) {
                drone.thrusterCones[i].scale.set(1, jetStretch, 1);
            }

            // Counter-rotating ducted VTOL rotor turbines + forward nacelle gimbal tilt
            for (let i = 0; i < drone.tiltPodGroups.length; i++) {
                drone.tiltPodGroups[i].rotation.z = reduced ? -0.06 : -0.08 - moving * 0.22;
            }
            if (!reduced) {
                const spinRate = 24 + moving * 26;
                for (let i = 0; i < drone.rotorGroups.length; i++) {
                    const r = drone.rotorGroups[i];
                    r.group.rotation.y += dt * spinRate * r.dir;
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
            rotorBlurTex?.dispose();
            envRT.dispose();
            timer.dispose();
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
