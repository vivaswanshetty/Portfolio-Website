import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Box,
    Check,
    Copy,
    Layers,
    Trash2,
    X,
} from 'lucide-react';
import { SKILLS_GALLERY_ITEMS, SKILLS_FRAME_STYLES } from '../data/skillsGalleryData';
import {
    ROOM,
    SMALL_SCREEN_MEDIA_QUERY,
    buildCorridorFramePlacements,
    computeDomCropStyle,
    easeOutExpo,
    findNearestOuterPlacement,
    getFocusPose,
    getSheetCellCrop,
    getSkillGalleryUnits,
    getWalkOffset,
    getWalkPose,
    interpolateFocusPose,
    lerp,
    poseToCameraVectors,
    stepWalkSlot,
} from '../utils/skillsGallery';
import {
    buildSkillsMasterSheet,
    createFloorCanvas,
    createHaloCanvas,
    createInnerPillarCanvas,
    createOuterWallCanvas,
    createPlaqueCanvas,
    createShadowCanvas,
} from '../utils/skillsArtAtlas';

/**
 * Reusable exact-crop artwork plate using computed CSS background-size & background-position
 * over the shared 1744x2336 master sheet.
 */
const SkillCropPlate = ({
    sheetUrl,
    skillIndex,
    className = '',
    style = {},
    children = null,
}) => {
    const innerRef = useRef(null);
    const crop = useMemo(() => getSheetCellCrop(skillIndex), [skillIndex]);
    const [boxSize, setBoxSize] = useState({ w: 360, h: 484 });

    useLayoutEffect(() => {
        const el = innerRef.current;
        if (!el) return undefined;

        const measure = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 1 && rect.height > 1) {
                setBoxSize((prev) =>
                    Math.abs(prev.w - rect.width) > 0.5 || Math.abs(prev.h - rect.height) > 0.5
                        ? { w: rect.width, h: rect.height }
                        : prev
                );
            }
        };

        measure();
        let ro;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(measure);
            ro.observe(el);
        }
        window.addEventListener('resize', measure, { passive: true });
        return () => {
            ro?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    const bgStyle = useMemo(() => {
        if (!sheetUrl) return {};
        const computed = computeDomCropStyle(crop, boxSize.w, boxSize.h);
        return {
            backgroundImage: `url(${sheetUrl})`,
            backgroundSize: computed.backgroundSize,
            backgroundPosition: computed.backgroundPosition,
            backgroundRepeat: 'no-repeat',
        };
    }, [sheetUrl, crop, boxSize.w, boxSize.h]);

    return (
        <div
            ref={innerRef}
            className={className}
            style={{
                ...bgStyle,
                ...style,
            }}
        >
            {children}
        </div>
    );
};

/**
 * Projects a Three.js PlaneGeometry print mesh's 4 world corners to its exact 2D screen bounding rect.
 */
function projectMeshScreenRect(mesh, camera, vw, vh) {
    if (!mesh || !camera) return null;
    mesh.updateWorldMatrix(true, false);
    const hw = ROOM.PW / 2;
    const hh = ROOM.PH / 2;
    const corners = [
        new THREE.Vector3(-hw, -hh, 0),
        new THREE.Vector3(hw, -hh, 0),
        new THREE.Vector3(hw, hh, 0),
        new THREE.Vector3(-hw, hh, 0),
    ];

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const c of corners) {
        c.applyMatrix4(mesh.matrixWorld).project(camera);
        if (c.z > 1) return null;
        const sx = (c.x * 0.5 + 0.5) * vw;
        const sy = (-c.y * 0.5 + 0.5) * vh;
        if (sx < minX) minX = sx;
        if (sy < minY) minY = sy;
        if (sx > maxX) maxX = sx;
        if (sy > maxY) maxY = sy;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 8 || height < 8) {
        return null;
    }

    return { left: minX, top: minY, width, height };
}

const Skills = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const rootRef = useRef(null);
    const pageRef = useRef(null);
    const stickyPlateRef = useRef(null);
    const flyerRef = useRef(null);
    const pillRef = useRef(null);
    const sheetUrlRef = useRef('');

    const placements = useMemo(() => buildCorridorFramePlacements(), []);

    const [sheetUrl, setSheetUrl] = useState('');
    const [introReady, setIntroReady] = useState(false);
    const [veilGone, setVeilGone] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia(SMALL_SCREEN_MEDIA_QUERY).matches : false
    );
    const [focusedSlot, setFocusedSlot] = useState(null); // { slotId, skillIdx, wall, angle }
    const [lastSkillIdx, setLastSkillIdx] = useState(0);
    const [activeSkillIdx, setActiveSkillIdx] = useState(null);
    const [listOpen, setListOpen] = useState(false);
    const [listCategory, setListCategory] = useState('All');

    // Spec Sheet UI state
    const [detailsReady, setDetailsReady] = useState(false);
    const [plateRevealed, setPlateRevealed] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState('');
    const [selectedTier, setSelectedTier] = useState('');
    const [selectedVerification, setSelectedVerification] = useState('');
    const [selectedFrameId, setSelectedFrameId] = useState('titanium');
    const [qty, setQty] = useState(1);
    const [openAccordions, setOpenAccordions] = useState({ 0: true });

    // Stack Shortlist Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [stackItems, setStackItems] = useState([]);
    const [briefCopied, setBriefCopied] = useState(false);

    // Imperative Three.js & camera navigation state (zero per-frame React re-renders)
    const navRef = useRef({
        th: getWalkOffset(false),
        targetTh: getWalkOffset(false),
        pose: getWalkPose(getWalkOffset(false), false),
        isSmall: false,
        reducedMotion: false,
        focusMeta: null,
        focusMesh: null,
        focusGlide: null, // { from, to, elapsed, duration, entering }
        introGlide: null, // { startTh, endTh, startR, endR, elapsed, duration }
        pageOpen: false,
        listOpen: false,
        drawerOpen: false,
        dragging: false,
        dragMoved: false,
        downX: 0,
        downY: 0,
        angleAtDown: 0,
        scene: null,
        camera: null,
        renderer: null,
        raycaster: new THREE.Raycaster(),
        meshes: [],
        meshBySlot: new Map(),
        hoveredPrint: false,
        hoveredFocused: false,
    });

    const activeSkill = activeSkillIdx !== null ? SKILLS_GALLERY_ITEMS[activeSkillIdx] : null;
    const selectedFrame = useMemo(
        () => SKILLS_FRAME_STYLES.find((f) => f.id === selectedFrameId) || SKILLS_FRAME_STYLES[1],
        [selectedFrameId]
    );

    const isOverlayOpen = activeSkillIdx !== null || listOpen || drawerOpen;

    // Document title, obsidian pre-paint class, and CSS unit synchronization
    useLayoutEffect(() => {
        const prevTitle = document.title;
        document.title = 'Skills & Technical Arsenal | Vivaswan Shetty';
        document.documentElement.classList.add('skills-gallery-html');
        document.body.classList.add('skills-gallery-route');

        const syncUnits = () => {
            const small = window.matchMedia(SMALL_SCREEN_MEDIA_QUERY).matches;
            setIsSmallScreen(small);
            navRef.current.isSmall = small;
            const { u, w } = getSkillGalleryUnits(window.innerWidth, window.innerHeight, small);
            document.documentElement.style.setProperty('--sk-u', `${u}px`);
            document.documentElement.style.setProperty('--sk-w', `${w}px`);
        };

        syncUnits();
        window.addEventListener('resize', syncUnits, { passive: true });
        return () => {
            window.removeEventListener('resize', syncUnits);
            document.title = prevTitle;
            document.documentElement.classList.remove('skills-gallery-html');
            document.body.classList.remove('skills-gallery-route', 'skills-overlay-open');
            document.documentElement.style.removeProperty('--sk-u');
            document.documentElement.style.removeProperty('--sk-w');
        };
    }, []);

    // Keep CyberDrone suppressed whenever Spec Sheet, List View, or Drawer covers the viewport
    useEffect(() => {
        if (isOverlayOpen) {
            document.body.classList.add('skills-overlay-open');
        } else {
            document.body.classList.remove('skills-overlay-open');
        }
        navRef.current.pageOpen = activeSkillIdx !== null;
        navRef.current.listOpen = listOpen;
        navRef.current.drawerOpen = drawerOpen;
    }, [isOverlayOpen, activeSkillIdx, listOpen, drawerOpen]);

    // Step camera smoothly back into corridor walk pose
    const stepBackToWalk = useCallback(() => {
        const nav = navRef.current;
        if (!nav.focusMeta && !nav.focusGlide?.entering) return;

        const D = getWalkOffset(nav.isSmall);
        const destTh = nav.pose.th + D;
        const walkDest = getWalkPose(destTh, nav.isSmall);

        nav.focusMeta = null;
        nav.focusMesh = null;
        nav.hoveredFocused = false;
        setFocusedSlot(null);

        if (pillRef.current) {
            pillRef.current.style.opacity = '0';
        }

        if (nav.reducedMotion) {
            nav.focusGlide = null;
            nav.pose = walkDest;
            nav.th = destTh;
            nav.targetTh = destTh;
        } else {
            nav.focusGlide = {
                from: { ...nav.pose },
                to: walkDest,
                elapsed: 0,
                duration: 0.95,
                entering: false,
            };
            nav.th = destTh;
            nav.targetTh = destTh;
        }
    }, []);

    // Glide camera into focus on a specific gallery placement
    const focusPlacement = useCallback((placement, instant = false) => {
        const nav = navRef.current;
        const goal = getFocusPose(placement.wall, placement.angle, nav.pose.th, nav.isSmall);
        const mesh = nav.meshBySlot.get(placement.slotId) || null;

        nav.introGlide = null;
        nav.focusMeta = placement;
        nav.focusMesh = mesh;
        setFocusedSlot(placement);
        setLastSkillIdx(placement.skillIdx);

        if (nav.reducedMotion || instant) {
            nav.focusGlide = null;
            nav.pose = goal;
            nav.th = goal.th;
            nav.targetTh = goal.th;
        } else {
            nav.focusGlide = {
                from: { ...nav.pose },
                to: goal,
                elapsed: 0,
                duration: 0.95,
                entering: true,
            };
        }
    }, []);

    // Run WAAPI FLIP flyer from a source rectangle into the Spec Sheet left sticky box
    const launchFlyer = useCallback((skillIdx, sourceRect) => {
        const flyer = flyerRef.current;
        const destEl = stickyPlateRef.current;
        const reduced = navRef.current.reducedMotion;

        if (!flyer || !destEl || !sourceRect || reduced) {
            setPlateRevealed(true);
            return;
        }

        setPlateRevealed(false);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const destRect = destEl.getBoundingClientRect();
                if (!destRect.width || !destRect.height) {
                    setPlateRevealed(true);
                    return;
                }

                const crop = getSheetCellCrop(skillIdx);
                const computed = computeDomCropStyle(crop, destRect.width, destRect.height);

                flyer.style.left = `${destRect.left}px`;
                flyer.style.top = `${destRect.top}px`;
                flyer.style.width = `${destRect.width}px`;
                flyer.style.height = `${destRect.height}px`;
                flyer.style.backgroundImage = `url(${sheetUrlRef.current})`;
                flyer.style.backgroundSize = computed.backgroundSize;
                flyer.style.backgroundPosition = computed.backgroundPosition;
                flyer.style.backgroundRepeat = 'no-repeat';
                flyer.style.opacity = '1';

                const dx = sourceRect.left - destRect.left;
                const dy = sourceRect.top - destRect.top;
                const sx = sourceRect.width / destRect.width;
                const sy = sourceRect.height / destRect.height;

                const anim = flyer.animate(
                    [
                        {
                            transformOrigin: 'top left',
                            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
                        },
                        {
                            transformOrigin: 'top left',
                            transform: 'translate3d(0px, 0px, 0) scale(1, 1)',
                        },
                    ],
                    {
                        duration: 300,
                        easing: 'cubic-bezier(0.25, 0.75, 0.25, 1)',
                        fill: 'forwards',
                    }
                );

                anim.onfinish = () => {
                    setPlateRevealed(true);
                    flyer.style.opacity = '0';
                    anim.cancel();
                };
            });
        });
    }, []);

    // Open Skill Spec Sheet from 3D mesh, list card, or Explore band card
    const detailsTimerRef = useRef(null);
    const openSpecSheet = useCallback(
        (skillIdx, sourceRect = null) => {
            const skill = SKILLS_GALLERY_ITEMS[skillIdx];
            if (!skill) return;

            if (detailsTimerRef.current) {
                clearTimeout(detailsTimerRef.current);
            }

            setLastSkillIdx(skillIdx);
            setActiveSkillIdx(skillIdx);
            setSelectedLayer(skill.layers[0]);
            setSelectedTier(skill.scaleTiers[1] || skill.scaleTiers[0]);
            setSelectedVerification(skill.verificationModes[1] || skill.verificationModes[0]);
            setQty(1);
            setOpenAccordions({ 0: true });

            if (pageRef.current) {
                pageRef.current.scrollTo({ top: 0, behavior: 'auto' });
            }

            if (navRef.current.reducedMotion) {
                setDetailsReady(true);
                setPlateRevealed(true);
            } else {
                setDetailsReady(false);
                launchFlyer(skillIdx, sourceRect);
                detailsTimerRef.current = setTimeout(() => {
                    setDetailsReady(true);
                }, 1000);
            }
        },
        [launchFlyer]
    );

    useEffect(() => {
        return () => {
            if (detailsTimerRef.current) clearTimeout(detailsTimerRef.current);
        };
    }, []);

    // Return to 3D Gallery in front of the outer-wall copy of the last inspected skill
    const returnToGallery = useCallback(() => {
        setActiveSkillIdx(null);
        setListOpen(false);
        setDetailsReady(false);

        const nav = navRef.current;
        const { placement } = findNearestOuterPlacement(placements, lastSkillIdx, nav.pose.th);
        if (placement) {
            focusPlacement(placement);
        } else {
            stepBackToWalk();
        }
    }, [placements, lastSkillIdx, focusPlacement, stepBackToWalk]);

    // Step along discrete corridor slots via ← / → arrows or keyboard
    const handleStepSlot = useCallback(
        (direction) => {
            const nav = navRef.current;
            if (nav.focusMeta || nav.focusGlide?.entering) {
                stepBackToWalk();
            }
            const D = getWalkOffset(nav.isSmall);
            nav.targetTh = stepWalkSlot(nav.targetTh, D, direction);
            if (nav.reducedMotion) {
                nav.th = nav.targetTh;
                nav.pose = getWalkPose(nav.targetTh, nav.isSmall);
            }
        },
        [stepBackToWalk]
    );

    // Mount & run Three.js WebGL Curved Corridor Gallery
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;

        const reduced = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
        const nav = navRef.current;
        nav.reducedMotion = reduced;
        const initialSmall = window.matchMedia(SMALL_SCREEN_MEDIA_QUERY).matches;
        nav.isSmall = initialSmall;

        const startD = getWalkOffset(initialSmall);
        const walkStart = getWalkPose(startD, initialSmall);
        nav.th = startD;
        nav.targetTh = startD;
        nav.pose = reduced
            ? walkStart
            : { ...walkStart, th: startD + 0.16, r: walkStart.r - 0.35 };

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#060709');
        scene.fog = new THREE.Fog('#060709', 10, 46);

        const vw0 = window.innerWidth;
        const vh0 = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(vw0 >= vh0 ? 56 : 70, vw0 / vh0, 0.05, 100);
        scene.add(camera);

        const hemi = new THREE.HemisphereLight(0xfffdf6, 0x1e293b, 1.55);
        const ambient = new THREE.AmbientLight(0xf8fafc, 0.55);
        scene.add(hemi, ambient);

        // Textures & Materials to dispose cleanly on unmount
        const disposables = [];
        const trackGeo = (g) => {
            disposables.push(g);
            return g;
        };
        const trackMat = (m) => {
            disposables.push(m);
            return m;
        };
        const trackTex = (t) => {
            disposables.push(t);
            return t;
        };

        const makeCanvasTex = (c) => {
            const tex = trackTex(new THREE.CanvasTexture(c));
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.needsUpdate = true;
            return tex;
        };

        const outerWallTex = makeCanvasTex(createOuterWallCanvas());
        const innerPillarTex = makeCanvasTex(createInnerPillarCanvas());
        const floorTex = makeCanvasTex(createFloorCanvas());
        const haloTex = makeCanvasTex(createHaloCanvas());
        const shadowTex = makeCanvasTex(createShadowCanvas());

        const outerGeo = trackGeo(new THREE.CylinderGeometry(ROOM.R, ROOM.R, ROOM.H, 160, 1, true));
        const outerMat = trackMat(new THREE.MeshBasicMaterial({ map: outerWallTex, side: THREE.BackSide }));
        const outerWall = new THREE.Mesh(outerGeo, outerMat);
        outerWall.position.y = ROOM.H / 2;
        scene.add(outerWall);

        const innerGeo = trackGeo(new THREE.CylinderGeometry(ROOM.RIN, ROOM.RIN, ROOM.H, 120, 1, true));
        const innerMat = trackMat(new THREE.MeshBasicMaterial({ map: innerPillarTex, side: THREE.FrontSide }));
        const innerWall = new THREE.Mesh(innerGeo, innerMat);
        innerWall.position.y = ROOM.H / 2;
        scene.add(innerWall);

        const floorGeo = trackGeo(new THREE.CircleGeometry(ROOM.R, 160));
        floorGeo.rotateX(-Math.PI / 2);
        const floorMat = trackMat(new THREE.MeshBasicMaterial({ map: floorTex }));
        scene.add(new THREE.Mesh(floorGeo, floorMat));

        const ceilGeo = trackGeo(new THREE.CircleGeometry(ROOM.R, 160));
        ceilGeo.rotateX(-Math.PI / 2);
        const ceilMat = trackMat(new THREE.MeshBasicMaterial({ color: '#070a10', side: THREE.BackSide }));
        const ceilMesh = new THREE.Mesh(ceilGeo, ceilMat);
        ceilMesh.position.y = ROOM.H;
        scene.add(ceilMesh);

        // Shared master artwork sheet + plaque textures
        const initialSheet = buildSkillsMasterSheet();
        sheetUrlRef.current = initialSheet.dataUrl;
        let disposed = false;
        queueMicrotask(() => {
            if (!disposed) setSheetUrl(initialSheet.dataUrl);
        });

        const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 1);
        const masterSheetTex = trackTex(new THREE.CanvasTexture(initialSheet.canvas));
        masterSheetTex.colorSpace = THREE.SRGBColorSpace;
        masterSheetTex.anisotropy = maxAniso;

        const skillCropTextures = SKILLS_GALLERY_ITEMS.map((_, i) => {
            const crop = getSheetCellCrop(i);
            const t = masterSheetTex.clone();
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = maxAniso;
            t.repeat.set(crop.repeatX, crop.repeatY);
            t.offset.set(crop.offsetX, crop.offsetY);
            t.needsUpdate = true;
            return trackTex(t);
        });

        const plaqueTextures = SKILLS_GALLERY_ITEMS.map((skill) =>
            makeCanvasTex(createPlaqueCanvas(skill))
        );

        // Shared frame geometry & materials
        const haloGeo = trackGeo(new THREE.PlaneGeometry(2.1 * ROOM.PW, 1.75 * ROOM.PH));
        const haloMat = trackMat(
            new THREE.MeshBasicMaterial({
                map: haloTex,
                transparent: true,
                depthWrite: false,
                fog: true,
            })
        );

        const shadowGeo = trackGeo(new THREE.PlaneGeometry(1.25 * ROOM.PW, 1.18 * ROOM.PH));
        const shadowMat = trackMat(
            new THREE.MeshBasicMaterial({
                map: shadowTex,
                transparent: true,
                depthWrite: false,
                fog: true,
            })
        );

        const frameGeo = trackGeo(new THREE.BoxGeometry(ROOM.PW + 0.07, ROOM.PH + 0.07, 0.06));
        const frameMat = trackMat(new THREE.MeshBasicMaterial({ color: '#2b3244' }));
        const printGeo = trackGeo(new THREE.PlaneGeometry(ROOM.PW, ROOM.PH));
        const labelGeo = trackGeo(new THREE.PlaneGeometry(0.92, (0.92 * 260) / 640));

        const printMaterials = skillCropTextures.map((tex) =>
            trackMat(new THREE.MeshBasicMaterial({ map: tex }))
        );
        const labelMaterials = plaqueTextures.map((tex) =>
            trackMat(
                new THREE.MeshBasicMaterial({
                    map: tex,
                    transparent: true,
                    depthWrite: false,
                    fog: true,
                })
            )
        );

        const raycastMeshes = [];
        const meshBySlot = new Map();

        for (const placement of placements) {
            const group = new THREE.Group();
            const px = placement.radius * Math.cos(placement.angle);
            const pz = placement.radius * Math.sin(placement.angle);
            group.position.set(px, 0, pz);

            if (placement.wall === 'outer') {
                group.lookAt(0, 0, 0);
            } else {
                group.lookAt(px * 2, 0, pz * 2);
            }

            const halo = new THREE.Mesh(haloGeo, haloMat);
            halo.position.set(0, ROOM.PY + 0.05, 0.005);

            const shadow = new THREE.Mesh(shadowGeo, shadowMat);
            shadow.position.set(0.05, ROOM.PY - 0.06, 0.01);

            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.set(0, ROOM.PY, 0.045);

            const print = new THREE.Mesh(printGeo, printMaterials[placement.skillIdx]);
            print.position.set(0, ROOM.PY, 0.077);
            print.userData = placement;

            const label = new THREE.Mesh(labelGeo, labelMaterials[placement.skillIdx]);
            label.position.set(-ROOM.PW / 2 + 0.46, ROOM.PY - ROOM.PH / 2 - 0.42, 0.02);

            group.add(halo, shadow, frame, print, label);
            scene.add(group);

            raycastMeshes.push(print);
            meshBySlot.set(placement.slotId, print);
        }

        nav.scene = scene;
        nav.camera = camera;
        nav.renderer = renderer;
        nav.meshes = raycastMeshes;
        nav.meshBySlot = meshBySlot;

        // Opening choreography after document.fonts.ready (with 4s failsafe)
        let startedIntro = false;

        const beginEntrance = () => {
            if (startedIntro || disposed) return;
            startedIntro = true;

            // Redraw artwork sheet + museum labels once bundled/web fonts (Outfit, Inter, Space Grotesk) finish loading
            const refreshed = buildSkillsMasterSheet();
            sheetUrlRef.current = refreshed.dataUrl;
            setSheetUrl(refreshed.dataUrl);
            masterSheetTex.image = refreshed.canvas;
            masterSheetTex.needsUpdate = true;
            skillCropTextures.forEach((t) => {
                t.needsUpdate = true;
            });

            SKILLS_GALLERY_ITEMS.forEach((skill, idx) => {
                const freshPlaque = createPlaqueCanvas(skill);
                plaqueTextures[idx].image = freshPlaque;
                plaqueTextures[idx].needsUpdate = true;
            });

            setIntroReady(true);
            setVeilGone(true);

            if (!reduced) {
                const D = getWalkOffset(nav.isSmall);
                nav.introGlide = {
                    startTh: D + 0.16,
                    endTh: D,
                    startR: walkStart.r - 0.35,
                    endR: walkStart.r,
                    elapsed: 0,
                    duration: 1.4,
                };
            }
        };

        const failsafe = setTimeout(beginEntrance, 4000);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(beginEntrance).catch(beginEntrance);
        } else {
            beginEntrance();
        }

        const onResize = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            camera.fov = vw >= vh ? 56 : 70;
            camera.aspect = vw / vh;
            camera.updateProjectionMatrix();
            renderer.setSize(vw, vh);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        };
        window.addEventListener('resize', onResize, { passive: true });

        const timer = new THREE.Timer();
        timer.connect(document);

        let rafId = 0;
        const tick = () => {
            timer.update();
            const dt = Math.min(timer.getDelta() || 0.016, 0.1);

            if (nav.focusGlide) {
                const fg = nav.focusGlide;
                fg.elapsed += dt;
                const progress = fg.duration <= 0 ? 1 : Math.min(1, fg.elapsed / fg.duration);
                nav.pose = interpolateFocusPose(fg.from, fg.to, progress);
                nav.th = nav.pose.th;
                nav.targetTh = nav.pose.th;
                if (progress >= 1) {
                    nav.pose = { ...fg.to };
                    nav.focusGlide = null;
                }
            } else if (nav.focusMeta) {
                // Hold exact focus pose cleanly once glide completes
                const goal = getFocusPose(
                    nav.focusMeta.wall,
                    nav.focusMeta.angle,
                    nav.pose.th,
                    nav.isSmall
                );
                nav.pose = goal;
            } else {
                // Walk state with smooth tau = 0.36s exponential damping
                const walkBase = getWalkPose(nav.th, nav.isSmall);

                if (nav.introGlide) {
                    const ig = nav.introGlide;
                    ig.elapsed += dt;
                    const p = Math.min(1, ig.elapsed / ig.duration);
                    const e = easeOutExpo(p);
                    const D = getWalkOffset(nav.isSmall);
                    const userOffset = nav.targetTh - D;
                    const thNow = lerp(ig.startTh, ig.endTh, e) + userOffset;
                    nav.th = thNow;
                    nav.pose = {
                        ...walkBase,
                        th: thNow,
                        r: lerp(ig.startR, ig.endR, e),
                    };
                    if (p >= 1) {
                        nav.introGlide = null;
                    }
                } else {
                    const alpha = nav.reducedMotion ? 1 : 1 - Math.exp(-dt / 0.36);
                    nav.th += (nav.targetTh - nav.th) * alpha;
                    nav.pose = { ...walkBase, th: nav.th };
                }
            }

            const { pos, lookAt } = poseToCameraVectors(nav.pose);
            camera.position.set(pos[0], pos[1], pos[2]);
            camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
            renderer.render(scene, camera);

            // Auto-position hover/open pill on touch/small screens over focused frame (55% down)
            if (pillRef.current && !nav.pageOpen && !nav.listOpen && !nav.drawerOpen) {
                if (nav.isSmall && nav.focusMesh) {
                    const rect = projectMeshScreenRect(
                        nav.focusMesh,
                        camera,
                        window.innerWidth,
                        window.innerHeight
                    );
                    if (rect) {
                        pillRef.current.style.left = `${(rect.left + rect.width / 2).toFixed(1)}px`;
                        pillRef.current.style.top = `${(rect.top + rect.height * 0.55).toFixed(1)}px`;
                        pillRef.current.style.opacity = '1';
                    }
                } else if (nav.isSmall) {
                    pillRef.current.style.opacity = '0';
                }
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            disposed = true;
            clearTimeout(failsafe);
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', onResize);
            timer.dispose();
            disposables.forEach((d) => d.dispose?.());
            renderer.dispose();
        };
    }, [placements]);

    // Corridor wheel, pointer drag, raycast hover/click, and keyboard controls
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;

        const updateRaycastFromEvent = (clientX, clientY) => {
            const nav = navRef.current;
            if (!nav.camera || !nav.meshes.length) return null;
            const ndcX = (clientX / window.innerWidth) * 2 - 1;
            const ndcY = -(clientY / window.innerHeight) * 2 + 1;
            nav.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), nav.camera);
            const hits = nav.raycaster.intersectObjects(nav.meshes, false);
            return hits.length > 0 ? hits[0].object : null;
        };

        const onWheel = (e) => {
            const nav = navRef.current;
            if (nav.pageOpen || nav.listOpen || nav.drawerOpen) return;
            e.preventDefault();

            if (nav.focusMeta || nav.focusGlide?.entering) {
                stepBackToWalk();
                return;
            }

            const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
            nav.targetTh -= delta * 0.0016;
            if (nav.reducedMotion) {
                nav.th = nav.targetTh;
            }
        };

        const onPointerDown = (e) => {
            const nav = navRef.current;
            if (nav.pageOpen || nav.listOpen || nav.drawerOpen) return;
            if (e.button !== 0 && e.pointerType === 'mouse') return;

            nav.dragging = true;
            nav.dragMoved = false;
            nav.downX = e.clientX;
            nav.downY = e.clientY;
            nav.angleAtDown = nav.targetTh;
            canvas.setPointerCapture?.(e.pointerId);
            canvas.classList.add('grabbing');
        };

        const onPointerMove = (e) => {
            const nav = navRef.current;
            if (nav.pageOpen || nav.listOpen || nav.drawerOpen) return;

            if (nav.dragging) {
                const dx = e.clientX - nav.downX;
                const dy = e.clientY - nav.downY;
                if (!nav.dragMoved && Math.hypot(dx, dy) > 6) {
                    nav.dragMoved = true;
                    if (nav.focusMeta || nav.focusGlide?.entering) {
                        stepBackToWalk();
                        nav.angleAtDown = nav.targetTh;
                        nav.downX = e.clientX;
                        nav.downY = e.clientY;
                        return;
                    }
                }

                if (nav.dragMoved) {
                    const dominant = Math.abs(dx) > Math.abs(dy) ? dx : dy;
                    const factor = nav.isSmall ? 0.0042 : 0.0022;
                    nav.targetTh = nav.angleAtDown + dominant * factor;
                    if (nav.reducedMotion) {
                        nav.th = nav.targetTh;
                    }
                }
                return;
            }

            if (nav.isSmall) return;

            const hitMesh = updateRaycastFromEvent(e.clientX, e.clientY);
            const overPrint = Boolean(hitMesh);
            if (overPrint !== nav.hoveredPrint) {
                nav.hoveredPrint = overPrint;
                canvas.classList.toggle('over-print', overPrint);
            }

            const overFocused =
                Boolean(hitMesh) &&
                Boolean(nav.focusMeta) &&
                hitMesh.userData?.slotId === nav.focusMeta.slotId;

            if (pillRef.current) {
                if (overFocused) {
                    pillRef.current.style.left = `${e.clientX}px`;
                    pillRef.current.style.top = `${e.clientY}px`;
                    pillRef.current.style.opacity = '1';
                } else {
                    pillRef.current.style.opacity = '0';
                }
            }
        };

        const onPointerUp = (e) => {
            const nav = navRef.current;
            if (!nav.dragging) return;
            nav.dragging = false;
            canvas.classList.remove('grabbing');
            canvas.releasePointerCapture?.(e.pointerId);

            if (nav.dragMoved || nav.pageOpen || nav.listOpen || nav.drawerOpen) return;

            const hitMesh = updateRaycastFromEvent(e.clientX, e.clientY);
            if (hitMesh && hitMesh.userData) {
                const hitPlacement = hitMesh.userData;
                if (nav.focusMeta && nav.focusMeta.slotId === hitPlacement.slotId) {
                    const rect = projectMeshScreenRect(
                        hitMesh,
                        nav.camera,
                        window.innerWidth,
                        window.innerHeight
                    );
                    openSpecSheet(hitPlacement.skillIdx, rect);
                } else {
                    focusPlacement(hitPlacement);
                }
            } else if (nav.focusMeta || nav.focusGlide?.entering) {
                stepBackToWalk();
            }
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (drawerOpen) {
                    setDrawerOpen(false);
                    return;
                }
                if (activeSkillIdx !== null) {
                    returnToGallery();
                    return;
                }
                if (listOpen) {
                    returnToGallery();
                    return;
                }
                if (navRef.current.focusMeta || navRef.current.focusGlide?.entering) {
                    stepBackToWalk();
                }
                return;
            }

            if (navRef.current.pageOpen || navRef.current.listOpen || navRef.current.drawerOpen) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                handleStepSlot(1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                handleStepSlot(-1);
            }
        };

        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            canvas.removeEventListener('wheel', onWheel);
            canvas.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [
        activeSkillIdx,
        listOpen,
        drawerOpen,
        stepBackToWalk,
        focusPlacement,
        openSpecSheet,
        returnToGallery,
        handleStepSlot,
    ]);

    // Add current configured skill item into slide-in Stack Shortlist Drawer
    const handleAddToStack = () => {
        if (!activeSkill) return;

        const reduced = navRef.current.reducedMotion;
        const itemKey = `${activeSkill.id}::${selectedLayer}::${selectedTier}::${selectedFrameId}`;

        setStackItems((prev) => {
            const existingIdx = prev.findIndex((entry) => entry.key === itemKey);
            if (existingIdx !== -1) {
                return prev.map((entry, idx) =>
                    idx === existingIdx
                        ? { ...entry, qty: Math.min(9, entry.qty + qty), animateIn: true }
                        : entry
                );
            }
            return [
                ...prev,
                {
                    key: itemKey,
                    skillIdx: activeSkill.index,
                    title: activeSkill.title,
                    subtitle: activeSkill.subtitle,
                    layer: selectedLayer,
                    tier: selectedTier,
                    verification: selectedVerification,
                    frameLabel: selectedFrame.shortLabel,
                    proficiency: activeSkill.proficiency,
                    qty,
                    animateIn: false,
                },
            ];
        });

        setDrawerOpen(true);

        if (reduced) {
            setStackItems((prev) => prev.map((entry) => ({ ...entry, animateIn: true })));
        } else {
            setTimeout(() => {
                setStackItems((prev) =>
                    prev.map((entry) => (entry.key === itemKey ? { ...entry, animateIn: true } : entry))
                );
            }, 750);
        }
    };

    const handleDrawerQty = (key, delta) => {
        setStackItems((prev) =>
            prev
                .map((entry) =>
                    entry.key === key
                        ? { ...entry, qty: Math.max(0, Math.min(9, entry.qty + delta)) }
                        : entry
                )
                .filter((entry) => entry.qty > 0)
        );
    };

    const handleCopyBrief = async () => {
        if (stackItems.length === 0) return;
        const summary = [
            'Vivaswan Shetty — Technical Stack Shortlist',
            '==========================================',
            ...stackItems.map(
                (item, idx) =>
                    `${idx + 1}. ${item.title} (${item.proficiency}%) — ${item.layer} / ${item.tier} [Weight ${item.qty}x]`
            ),
            '',
            'Discuss implementation at: vivaswanprofessional@gmail.com',
        ].join('\n');

        try {
            await navigator.clipboard.writeText(summary);
            setBriefCopied(true);
            setTimeout(() => setBriefCopied(false), 2000);
        } catch {
            // clipboard unavailable
        }
    };

    // Related capabilities strip on Spec Sheet (current + next 3 capabilities wrapping 0..8)
    const relatedCards = useMemo(() => {
        if (activeSkillIdx === null) return [];
        return [0, 1, 2, 3].map((offset) => SKILLS_GALLERY_ITEMS[(activeSkillIdx + offset) % 9]);
    }, [activeSkillIdx]);

    const filteredListSkills = useMemo(() => {
        if (listCategory === 'All') return SKILLS_GALLERY_ITEMS;
        if (listCategory === 'Frontend & 3D') {
            return SKILLS_GALLERY_ITEMS.filter((s) => [0, 1, 5, 8].includes(s.index));
        }
        if (listCategory === 'Backend & AI') {
            return SKILLS_GALLERY_ITEMS.filter((s) => [2, 3, 4].includes(s.index));
        }
        return SKILLS_GALLERY_ITEMS.filter((s) => [6, 7].includes(s.index));
    }, [listCategory]);

    const totalShortlistCount = useMemo(
        () => stackItems.reduce((sum, item) => sum + item.qty, 0),
        [stackItems]
    );

    const averageShortlistMastery = useMemo(() => {
        if (stackItems.length === 0) return 0;
        const weighted = stackItems.reduce((sum, item) => sum + item.proficiency * item.qty, 0);
        return Math.round(weighted / Math.max(1, totalShortlistCount));
    }, [stackItems, totalShortlistCount]);

    const hintLine1 = focusedSlot ? 'CLICK THE PLATE TO OPEN SPEC SHEET' : 'SCROLL OR DRAG TO WALK ROUND';
    const hintLine2 = focusedSlot ? 'ESC OR CLICK AWAY TO STEP BACK' : 'CLICK A PLATE TO LOOK CLOSER';

    return (
        <div
            ref={rootRef}
            className={`skills-corridor-root${introReady ? ' intro-started' : ''}${isOverlayOpen ? ' overlay-open' : ''}`}
        >
            {/* Full-screen WebGL 3D Gallery Stage */}
            <main id="skills-gallery" className="skills-gallery" aria-label="Interactive 3D Skills Corridor">
                <canvas ref={canvasRef} className="skills-canvas" />
                <div
                    id="skills-veil"
                    className={`skills-veil${veilGone ? ' gone' : ''}`}
                    aria-hidden="true"
                />
            </main>

            {/* Gallery HUD Controls (fades out when Spec Sheet or List View opens) */}
            <div
                className={`skills-gui${activeSkillIdx !== null || listOpen ? ' hidden' : ''}`}
                aria-hidden={activeSkillIdx !== null || listOpen}
            >
                {/* Left Corridor Step Arrows */}
                <div className="skills-arrows" aria-label="Corridor step navigation">
                    <button
                        type="button"
                        className="skills-arrow-btn"
                        aria-label="Step to previous capability"
                        onClick={() => handleStepSlot(-1)}
                    >
                        <ArrowLeft size={18} strokeWidth={1.6} />
                    </button>
                    <button
                        type="button"
                        className="skills-arrow-btn"
                        aria-label="Step to next capability"
                        onClick={() => handleStepSlot(1)}
                    >
                        <ArrowRight size={18} strokeWidth={1.6} />
                    </button>
                </div>

                {/* Right Walk / Focus Micro Hint */}
                <div className="skills-hint" aria-live="polite">
                    <span className="skills-mask">
                        <span className="skills-mask-inner" style={{ '--stagger': 0 }}>
                            {hintLine1}
                        </span>
                    </span>
                    <span className="skills-mask">
                        <span className="skills-mask-inner" style={{ '--stagger': 1 }}>
                            {hintLine2}
                        </span>
                    </span>
                </div>

                {/* Right Mode Toggle + Stack Brief Trigger */}
                <div className="skills-right-controls">
                    <button
                        type="button"
                        className={`skills-stack-trigger${totalShortlistCount > 0 ? ' has-items' : ''}`}
                        onClick={() => setDrawerOpen(true)}
                        aria-label={`Open stack shortlist drawer (${totalShortlistCount} items)`}
                    >
                        <span>STACK BRIEF</span>
                        <span className={`skills-stack-badge${totalShortlistCount > 0 ? ' show' : ''}`}>
                            {totalShortlistCount}
                        </span>
                    </button>

                    <div className="skills-toggle" role="tablist" aria-label="View mode">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={!listOpen && activeSkillIdx === null}
                            className={`skills-toggle-btn${!listOpen ? ' active' : ''}`}
                            onClick={returnToGallery}
                        >
                            GALLERY
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={listOpen}
                            className={`skills-toggle-btn${listOpen ? ' active' : ''}`}
                            onClick={() => {
                                setActiveSkillIdx(null);
                                setListOpen(true);
                            }}
                        >
                            LIST
                        </button>
                    </div>
                </div>

                {/* Bottom-Left Exhibition Caption Block */}
                <div className="skills-caption">
                    <p className="skills-kicker">
                        <span className="skills-mask">
                            <span className="skills-mask-inner" style={{ '--stagger': 2 }}>
                                YOU ARE WALKING PAST<em className="skills-crimson-dot"> · 09 SYSTEMS</em>
                            </span>
                        </span>
                    </p>

                    <div className="skills-headline-row">
                        <h1 className="skills-headline">
                            <span className="skills-mask">
                                <span className="skills-mask-inner" style={{ '--stagger': 3 }}>
                                    {isSmallScreen ? (
                                        <>
                                            TECH
                                            <br />
                                            ARSENAL
                                        </>
                                    ) : (
                                        'TECH ARSENAL'
                                    )}
                                </span>
                            </span>
                        </h1>

                        <button
                            type="button"
                            className="skills-enter-link"
                            onClick={() => {
                                setActiveSkillIdx(null);
                                setListOpen(true);
                            }}
                        >
                            <span className="skills-mask">
                                <span className="skills-mask-inner" style={{ '--stagger': 4 }}>
                                    ENTER THE COLLECTION →
                                </span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hover / Focus Pill Over Print */}
            <button
                ref={pillRef}
                type="button"
                className="skills-hover-pill"
                aria-hidden={!focusedSlot}
                tabIndex={-1}
                onClick={() => {
                    if (focusedSlot && navRef.current.focusMesh && navRef.current.camera) {
                        const rect = projectMeshScreenRect(
                            navRef.current.focusMesh,
                            navRef.current.camera,
                            window.innerWidth,
                            window.innerHeight
                        );
                        openSpecSheet(focusedSlot.skillIdx, rect);
                    }
                }}
            >
                INSPECT SKILL
            </button>

            {/* Skill Spec Sheet Page (section#skills-page) */}
            <section
                ref={pageRef}
                id="skills-page"
                className={`skills-page${activeSkill ? ' open' : ''}${detailsReady ? ' details-ready' : ''}`}
                aria-hidden={!activeSkill}
                aria-label={activeSkill ? `${activeSkill.title} capability specification` : 'Skill detail'}
            >
                {activeSkill && (
                    <>
                        {/* Persistent Top Corner Controls inside Inspector */}
                        <div className="skills-page-subbar">
                            <button
                                type="button"
                                className="skills-subbar-back"
                                onClick={returnToGallery}
                            >
                                <ArrowLeft size={14} />
                                <span>BACK TO CORRIDOR</span>
                            </button>

                            <div className="skills-subbar-actions">
                                <button
                                    type="button"
                                    className="skills-subbar-btn"
                                    onClick={() => {
                                        setActiveSkillIdx(null);
                                        setListOpen(true);
                                    }}
                                >
                                    ALL 9 SKILLS
                                </button>
                                <button
                                    type="button"
                                    className="skills-subbar-btn"
                                    onClick={() => setDrawerOpen(true)}
                                >
                                    <span>STACK</span>
                                    {totalShortlistCount > 0 && (
                                        <span className="skills-stack-badge show">{totalShortlistCount}</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="skills-page-grid">
                            {/* Left Sticky Artwork Plate */}
                            <div className="skills-page-left">
                                <div className="skills-page-sticky">
                                    <div
                                        ref={stickyPlateRef}
                                        className={`skills-page-plate-wrap frame-${selectedFrame.id}`}
                                        style={{
                                            opacity: plateRevealed ? 1 : 0,
                                            borderColor: selectedFrame.borderColor,
                                            backgroundColor: selectedFrame.matColor,
                                        }}
                                    >
                                        <SkillCropPlate
                                            sheetUrl={sheetUrl}
                                            skillIndex={activeSkill.index}
                                            className="skills-page-plate"
                                        />
                                    </div>

                                    <div className="skills-page-meta-row">
                                        <span>{activeSkill.code}</span>
                                        <button
                                            type="button"
                                            className="skills-meta-action"
                                            onClick={returnToGallery}
                                        >
                                            <Box size={15} strokeWidth={1.6} />
                                            <span>View in corridor</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="skills-meta-bookmark"
                                            aria-label="Quick add to stack shortlist"
                                            onClick={handleAddToStack}
                                        >
                                            <Bookmark size={15} strokeWidth={1.6} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Capability Specification & Interactive Configurator */}
                            <div className="skills-page-right">
                                <h2 className="skills-page-title">{activeSkill.title}</h2>
                                <p className="skills-page-subtitle">
                                    {activeSkill.subtitle} · {activeSkill.years}
                                </p>

                                <p className="skills-page-desc">{activeSkill.description}</p>

                                <div className="skills-page-price-row">
                                    <span className="skills-page-price">{activeSkill.proficiencyLabel}</span>
                                    <div className="skills-prof-track" aria-hidden="true">
                                        <div
                                            className="skills-prof-fill"
                                            style={{ width: `${activeSkill.proficiency}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="skills-page-tax-note">
                                    Configure stack emphasis &amp; add to your project blueprint shortlist.
                                </p>

                                {/* 1. Focus Layer Chips */}
                                <div className="skills-opt-group">
                                    <div className="skills-opt-label">
                                        <span>FOCUS LAYER:</span>
                                        <strong>{selectedLayer}</strong>
                                    </div>
                                    <div className="skills-chips">
                                        {activeSkill.layers.map((layer) => (
                                            <button
                                                key={layer}
                                                type="button"
                                                className={`skills-chip${selectedLayer === layer ? ' on' : ''}`}
                                                onClick={() => setSelectedLayer(layer)}
                                            >
                                                {layer}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Production Scale Tier Chips */}
                                <div className="skills-opt-group">
                                    <div className="skills-opt-label">
                                        <span>PRODUCTION SCOPE:</span>
                                        <strong>{selectedTier}</strong>
                                    </div>
                                    <div className="skills-chips">
                                        {activeSkill.scaleTiers.map((tier) => (
                                            <button
                                                key={tier}
                                                type="button"
                                                className={`skills-chip${selectedTier === tier ? ' on' : ''}`}
                                                onClick={() => setSelectedTier(tier)}
                                            >
                                                {tier}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Verification Proof Chips */}
                                <div className="skills-opt-group">
                                    <div className="skills-opt-label">
                                        <span>VERIFICATION:</span>
                                        <strong>{selectedVerification}</strong>
                                    </div>
                                    <div className="skills-chips">
                                        {activeSkill.verificationModes.map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                className={`skills-chip${selectedVerification === mode ? ' on' : ''}`}
                                                onClick={() => setSelectedVerification(mode)}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 4. Frame Presentation Thumbnails */}
                                <div className="skills-opt-group">
                                    <div className="skills-opt-label">
                                        <span>EXHIBITION FRAME:</span>
                                        <strong>{selectedFrame.label}</strong>
                                    </div>
                                    <div className="skills-frame-chips">
                                        {SKILLS_FRAME_STYLES.map((frameOpt) => (
                                            <button
                                                key={frameOpt.id}
                                                type="button"
                                                className={`skills-frame-chip${selectedFrameId === frameOpt.id ? ' on' : ''}`}
                                                onClick={() => setSelectedFrameId(frameOpt.id)}
                                            >
                                                <div className={`skills-frame-thumb-wrap frame-${frameOpt.id}`}>
                                                    <SkillCropPlate
                                                        sheetUrl={sheetUrl}
                                                        skillIndex={activeSkill.index}
                                                        className="skills-frame-thumb"
                                                    />
                                                </div>
                                                <span>{frameOpt.shortLabel}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Buy / Add to Stack Row */}
                                <div className="skills-buy-row">
                                    <div className="skills-qty-stepper" aria-label="Priority weight">
                                        <button
                                            type="button"
                                            className="skills-qty-btn"
                                            aria-label="Decrease priority weight"
                                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        >
                                            −
                                        </button>
                                        <span>{qty}</span>
                                        <button
                                            type="button"
                                            className="skills-qty-btn"
                                            aria-label="Increase priority weight"
                                            onClick={() => setQty((q) => Math.min(9, q + 1))}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="skills-add-btn"
                                        onClick={handleAddToStack}
                                    >
                                        ADD TO STACK
                                    </button>
                                </div>

                                {/* Related Case Studies Quick Links */}
                                {activeSkill.relatedProjects?.length > 0 && (
                                    <div className="skills-project-pills">
                                        <span className="skills-project-pills-label">SHIPPED IN:</span>
                                        {activeSkill.relatedProjects.map((proj) => (
                                            <Link
                                                key={proj.slug}
                                                to={`/projects/${proj.slug}`}
                                                className="skills-project-link"
                                            >
                                                <span>{proj.label}</span>
                                                <ArrowRight size={12} />
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Accordions */}
                                <div className="skills-accordions">
                                    {activeSkill.accordions.map((acc, idx) => {
                                        const isOpen = Boolean(openAccordions[idx]);
                                        return (
                                            <div key={acc.title} className={`skills-acc-item${isOpen ? ' open' : ''}`}>
                                                <button
                                                    type="button"
                                                    className="skills-acc-trigger"
                                                    aria-expanded={isOpen}
                                                    onClick={() =>
                                                        setOpenAccordions((prev) => ({
                                                            ...prev,
                                                            [idx]: !prev[idx],
                                                        }))
                                                    }
                                                >
                                                    <span>{acc.title}</span>
                                                    <span className="skills-acc-plus" aria-hidden="true">
                                                        +
                                                    </span>
                                                </button>
                                                <div className="skills-acc-body">
                                                    <div className="skills-acc-body-inner">
                                                        <p>{acc.body}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Explore Band ("GET THE COLLECTION" equivalent) */}
                        <div className="skills-collection-band">
                            <h3 className="skills-collection-heading">EXPLORE THE COLLECTION</h3>
                            <div className="skills-collection-row">
                                {relatedCards.map((card) => (
                                    <button
                                        key={card.id}
                                        type="button"
                                        className="skills-col-card"
                                        onClick={(e) => {
                                            const imgBox = e.currentTarget.querySelector('.skills-col-card-img');
                                            const rect = imgBox?.getBoundingClientRect() || null;
                                            pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                            openSpecSheet(card.index, rect);
                                        }}
                                    >
                                        <div className="skills-col-card-mat">
                                            <SkillCropPlate
                                                sheetUrl={sheetUrl}
                                                skillIndex={card.index}
                                                className="skills-col-card-img"
                                            />
                                        </div>
                                        <strong className="skills-col-card-title">{card.title}</strong>
                                        <em className="skills-col-card-sub">{card.subtitle}</em>
                                        <span className="skills-col-card-meta">
                                            {card.proficiency}% · {card.domainTag}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* All 9 Capabilities Grid View (section#skills-list) */}
            <section
                id="skills-list"
                className={`skills-list${listOpen && activeSkillIdx === null ? ' open' : ''}`}
                aria-hidden={!listOpen || activeSkillIdx !== null}
                aria-label="All 9 engineering capabilities"
            >
                <div className="skills-list-head">
                    <div>
                        <p className="skills-list-eyebrow">COMPLETE ARCHITECTURAL OVERVIEW</p>
                        <h2 className="skills-list-title">TECH ARSENAL — ALL CAPABILITIES</h2>
                    </div>

                    <div className="skills-list-toolbar">
                        <div className="skills-list-filters">
                            {['All', 'Frontend & 3D', 'Backend & AI', 'Systems & Cloud'].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`skills-list-filter${listCategory === cat ? ' active' : ''}`}
                                    onClick={() => setListCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="skills-toggle" role="tablist" aria-label="Switch back to 3D corridor">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={false}
                                className="skills-toggle-btn"
                                onClick={returnToGallery}
                            >
                                GALLERY
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={true}
                                className="skills-toggle-btn active"
                                onClick={() => setListOpen(true)}
                            >
                                LIST
                            </button>
                        </div>
                    </div>
                </div>

                <div className="skills-list-grid">
                    {filteredListSkills.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="skills-col-card skills-list-card"
                            onClick={(e) => {
                                const imgBox = e.currentTarget.querySelector('.skills-col-card-img');
                                const rect = imgBox?.getBoundingClientRect() || null;
                                openSpecSheet(item.index, rect);
                            }}
                        >
                            <div className="skills-col-card-mat">
                                <SkillCropPlate
                                    sheetUrl={sheetUrl}
                                    skillIndex={item.index}
                                    className="skills-col-card-img"
                                />
                            </div>
                            <strong className="skills-col-card-title">{item.title}</strong>
                            <em className="skills-col-card-sub">{item.subtitle}</em>
                            <span className="skills-col-card-meta">
                                {item.proficiency}% · {item.years}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Right Slide-In Stack Shortlist Drawer (aside.skills-drawer) */}
            {drawerOpen && (
                <div
                    className="skills-drawer-scrim"
                    aria-hidden="true"
                    onClick={() => setDrawerOpen(false)}
                />
            )}
            <aside
                className={`skills-drawer${drawerOpen ? ' open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!drawerOpen}
                aria-label="Your stack blueprint shortlist"
            >
                <div className="skills-drawer-head">
                    <div className="skills-drawer-head-left">
                        <Layers size={18} strokeWidth={1.8} />
                        <h3 className="skills-drawer-title">YOUR STACK BRIEF</h3>
                    </div>
                    <button
                        type="button"
                        className="skills-drawer-close"
                        aria-label="Close stack brief drawer"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <X size={20} strokeWidth={1.6} />
                    </button>
                </div>

                <div className="skills-drawer-body">
                    {stackItems.length === 0 ? (
                        <p className="skills-drawer-empty">
                            YOUR STACK BRIEF IS EMPTY. INSPECT ANY CAPABILITY TO ADD IT.
                        </p>
                    ) : (
                        stackItems.map((item) => (
                            <div
                                key={item.key}
                                className={`skills-drawer-item${item.animateIn ? ' visible' : ''}`}
                            >
                                <SkillCropPlate
                                    sheetUrl={sheetUrl}
                                    skillIndex={item.skillIdx}
                                    className="skills-drawer-thumb"
                                />
                                <div className="skills-drawer-meta">
                                    <strong>{item.title}</strong>
                                    <em>
                                        {item.layer} · {item.frameLabel}
                                    </em>
                                    <span>
                                        {item.tier} · {item.proficiency}%
                                    </span>
                                    <div className="skills-drawer-item-actions">
                                        <div className="skills-drawer-qty">
                                            <button
                                                type="button"
                                                aria-label="Decrease priority"
                                                onClick={() => handleDrawerQty(item.key, -1)}
                                            >
                                                −
                                            </button>
                                            <span>{item.qty}</span>
                                            <button
                                                type="button"
                                                aria-label="Increase priority"
                                                onClick={() => handleDrawerQty(item.key, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            className="skills-drawer-trash"
                                            aria-label={`Remove ${item.title}`}
                                            onClick={() => handleDrawerQty(item.key, -99)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="skills-drawer-foot">
                    <div className="skills-drawer-subrow">
                        <span>Average Coverage ({totalShortlistCount} selected)</span>
                        <strong>{averageShortlistMastery}% CORE</strong>
                    </div>

                    <button
                        type="button"
                        className="skills-drawer-copy-btn"
                        disabled={stackItems.length === 0}
                        onClick={handleCopyBrief}
                    >
                        {briefCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{briefCopied ? 'COPIED BRIEF TO CLIPBOARD' : 'COPY STACK BRIEF'}</span>
                    </button>

                    <button
                        type="button"
                        className="skills-drawer-checkout"
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate('/contact');
                        }}
                    >
                        DISCUSS PROJECT →
                    </button>
                </div>
            </aside>

            {/* Shared GPU FLIP Flyer Layer */}
            <div ref={flyerRef} className="skills-flyer" aria-hidden="true" />
        </div>
    );
};

export default Skills;
