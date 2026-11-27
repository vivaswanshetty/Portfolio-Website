import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Github } from 'lucide-react';
import portraitImg from '../assets/vivaswan_portrait.webp';
import { PROJECTS_SPHERE_ITEMS } from '../data/projectSphereItems';
import {
    buildSpherePoints,
    computeSphereLayout,
    computeCardDepthStyle,
    computeScrollDolly,
} from '../utils/projectSphere';

const HEADLINE_WORDS = ['I', 'Build', 'Systems', 'That', 'Scale'];
const MIN_SPLASH_MS = 1050;
const SPLASH_BACKSTOP_MS = 8500;
const IDLE_SCROLL_SNAP_LIMIT_PX = 20;

function decodeAndDownscale(src, maxWidth) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => {
            try {
                const natW = img.naturalWidth || 0;
                const natH = img.naturalHeight || 0;
                if (!natW || !natH || natW <= maxWidth) {
                    resolve({ url: src, blobUrl: null });
                    return;
                }
                const ratio = maxWidth / natW;
                const targetW = Math.round(maxWidth);
                const targetH = Math.max(1, Math.round(natH * ratio));
                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve({ url: src, blobUrl: null });
                    return;
                }
                ctx.drawImage(img, 0, 0, targetW, targetH);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve({ url: src, blobUrl: null });
                            return;
                        }
                        const blobUrl = URL.createObjectURL(blob);
                        resolve({ url: blobUrl, blobUrl });
                    },
                    'image/webp',
                    0.88
                );
            } catch {
                resolve({ url: src, blobUrl: null });
            }
        };
        img.onerror = () => resolve({ url: src, blobUrl: null });
        img.src = src;
    });
}

const Projects = () => {
    const stageRef = useRef(null);
    const worldRef = useRef(null);
    const headlineRef = useRef(null);
    const cardRefs = useRef([]);
    const gridFigRefs = useRef({});
    const splashRef = useRef(null);
    const splashBarRef = useRef(null);
    const plateRef = useRef(null);
    const litImgRef = useRef(null);
    const dotRef = useRef(null);

    const spherePoints = useMemo(() => buildSpherePoints(PROJECTS_SPHERE_ITEMS.length), []);

    const [thumbMap, setThumbMap] = useState(() => {
        const initial = {};
        PROJECTS_SPHERE_ITEMS.forEach((item) => {
            initial[item.id] = item.src;
        });
        return initial;
    });
    const [avatarUrl, setAvatarUrl] = useState(portraitImg);
    const [loadedIds, setLoadedIds] = useState({});
    const [splashMounted, setSplashMounted] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    });

    const [gridOpen, setGridOpen] = useState(false);
    const [gridFilter, setGridFilter] = useState('All');
    const [gridQuery, setGridQuery] = useState('');
    const [litState, setLitState] = useState(null); // { idx, item, highResReady }

    // Imperative 3D physics + layout state (zero React re-renders during drag/scroll/frame)
    const camRef = useRef({
        spin: 0,
        tilt: -4,
        camZ: 0,
        dragX: 0,
        dragY: 0,
        velX: 0,
        velY: 0,
        dragging: false,
        focused: -1,
        hasLit: false,
        gridOpen: false,
        lastVw: typeof window !== 'undefined' ? window.innerWidth : 1440,
        lastVh: typeof window !== 'undefined' ? window.innerHeight : 900,
        metrics:
            typeof window !== 'undefined'
                ? computeSphereLayout(window.innerWidth, window.innerHeight)
                : computeSphereLayout(1440, 900),
        lastCardStyles: [],
        litSourceType: 'sphere', // 'sphere' | 'grid'
        litToken: 0,
        closeTimer: null,
    });

    const filteredGridItems = useMemo(() => {
        const q = gridQuery.toLowerCase().trim();
        return PROJECTS_SPHERE_ITEMS.map((item, idx) => ({ item, idx })).filter(({ item }) => {
            let matchesCat = true;
            if (gridFilter === 'Flagship') matchesCat = item.isFlagshipCover;
            else if (gridFilter === 'Mobile Apps') matchesCat = item.category === 'Mobile Apps';
            else if (gridFilter === 'Full-Stack Web') matchesCat = item.category === 'Full-Stack Web';

            const matchesQ =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.place.toLowerCase().includes(q) ||
                item.note.toLowerCase().includes(q) ||
                item.tech.some((t) => t.toLowerCase().includes(q));

            return matchesCat && matchesQ;
        });
    }, [gridFilter, gridQuery]);

    // Sync sphere layout variables onto document.body and card transforms
    const applySphereLayout = useCallback(
        (force = false) => {
            if (typeof window === 'undefined') return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const cam = camRef.current;

            if (
                !force &&
                Math.abs(vw - cam.lastVw) < IDLE_SCROLL_SNAP_LIMIT_PX &&
                Math.abs(vh - cam.lastVh) < IDLE_SCROLL_SNAP_LIMIT_PX
            ) {
                return;
            }

            cam.lastVw = vw;
            cam.lastVh = vh;
            const metrics = computeSphereLayout(vw, vh);
            cam.metrics = metrics;

            const body = document.body;
            body.style.setProperty('--persp', `${metrics.persp}px`);
            body.style.setProperty('--cw', `${metrics.cw}px`);
            body.style.setProperty('--hw', `${metrics.headlineWidth}px`);

            spherePoints.forEach((pt, idx) => {
                const cardEl = cardRefs.current[idx];
                if (!cardEl) return;
                cardEl.style.transform = `translate3d(${(pt.x * metrics.R).toFixed(2)}px, ${(-pt.y * metrics.R).toFixed(2)}px, ${(pt.z * metrics.R).toFixed(2)}px) rotateY(${pt.lon.toFixed(2)}deg) rotateX(${pt.lat.toFixed(2)}deg)`;
            });
        },
        [spherePoints]
    );

    // Activate body archive mode & restore cleanly when leaving /projects
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

        html.classList.add('projects-html');
        body.classList.add('projects-archive');
        if (prefersReduced) {
            body.classList.add('revealed');
        } else {
            body.classList.add('locked', 'projects-splash');
            html.style.overflow = 'hidden';
        }

        const initRaf = requestAnimationFrame(() => applySphereLayout(true));

        let orientTimer = null;
        const onResize = () => applySphereLayout(false);
        const onOrientation = () => {
            if (orientTimer) clearTimeout(orientTimer);
            orientTimer = setTimeout(() => applySphereLayout(true), 220);
        };
        const onVvResize = () => applySphereLayout(true);

        window.addEventListener('resize', onResize, { passive: true });
        window.addEventListener('orientationchange', onOrientation);
        window.visualViewport?.addEventListener('resize', onVvResize);
        window.visualViewport?.addEventListener('scroll', onVvResize);

        const closeTimerRef = camRef.current;

        return () => {
            cancelAnimationFrame(initRaf);
            if (orientTimer) clearTimeout(orientTimer);
            if (closeTimerRef.closeTimer) clearTimeout(closeTimerRef.closeTimer);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onOrientation);
            window.visualViewport?.removeEventListener('resize', onVvResize);
            window.visualViewport?.removeEventListener('scroll', onVvResize);

            html.classList.remove('projects-html');
            html.style.overflow = '';
            body.classList.remove(
                'projects-archive',
                'locked',
                'revealed',
                'deep',
                'gridview',
                'lit',
                'projects-splash'
            );
            body.style.removeProperty('--persp');
            body.style.removeProperty('--cw');
            body.style.removeProperty('--hw');
        };
    }, [applySphereLayout]);

    // Decode & Canvas-downscale 21 project images + avatar with splash progress bar
    useEffect(() => {
        let cancelled = false;
        const createdBlobs = [];
        const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const birthTime = performance.now();
        const { cardDecodeMax } = computeSphereLayout(window.innerWidth, window.innerHeight);

        let doneCount = 0;
        const total = PROJECTS_SPHERE_ITEMS.length + 1;
        const updateBar = () => {
            doneCount += 1;
            if (splashBarRef.current) {
                splashBarRef.current.style.transform = `scaleX(${Math.min(1, doneCount / total)})`;
            }
        };

        let finishTimeout = null;
        let removeSplashTimer = null;
        let finished = false;

        const revealArchive = () => {
            if (finished || cancelled) return;
            finished = true;
            if (splashBarRef.current) splashBarRef.current.style.transform = 'scaleX(1)';

            const body = document.body;
            const html = document.documentElement;
            body.classList.remove('locked', 'projects-splash');
            html.style.overflow = '';

            applySphereLayout(true);
            requestAnimationFrame(() => {
                if (cancelled) return;
                applySphereLayout(true);
                body.classList.add('revealed');
                if (splashRef.current) {
                    splashRef.current.classList.add('out');
                }
                removeSplashTimer = setTimeout(() => {
                    if (!cancelled) {
                        setSplashMounted(false);
                        applySphereLayout(true);
                    }
                }, 700);
            });
        };

        const backstopTimer = setTimeout(revealArchive, SPLASH_BACKSTOP_MS);

        const avatarTask = downscaleAndTrack(portraitImg, 160, (res) => {
            if (res.blobUrl) createdBlobs.push(res.blobUrl);
            if (!cancelled) setAvatarUrl(res.url);
        });

        const itemTasks = PROJECTS_SPHERE_ITEMS.map((item) =>
            downscaleAndTrack(item.src, cardDecodeMax, (res) => {
                if (res.blobUrl) createdBlobs.push(res.blobUrl);
                if (!cancelled) {
                    setThumbMap((prev) => ({ ...prev, [item.id]: res.url }));
                    setLoadedIds((prev) => ({ ...prev, [item.id]: true }));
                }
            })
        );

        function downscaleAndTrack(src, cap, onDone) {
            return decodeAndDownscale(src, cap).then((res) => {
                updateBar();
                onDone(res);
            });
        }

        Promise.all([avatarTask, ...itemTasks]).then(() => {
            if (cancelled) return;
            clearTimeout(backstopTimer);
            const elapsed = performance.now() - birthTime;
            const wait = prefersReduced ? 0 : Math.max(0, MIN_SPLASH_MS - elapsed);
            finishTimeout = setTimeout(revealArchive, wait);
        });

        return () => {
            cancelled = true;
            clearTimeout(backstopTimer);
            if (finishTimeout) clearTimeout(finishTimeout);
            if (removeSplashTimer) clearTimeout(removeSplashTimer);
            createdBlobs.forEach((b) => URL.revokeObjectURL(b));
        };
    }, [applySphereLayout]);

    // Main 60 FPS Camera & World Rotation Loop
    useEffect(() => {
        let rafId = null;

        const renderFrame = () => {
            const cam = camRef.current;
            const { R, persp } = cam.metrics;
            const vh = window.innerHeight || 900;
            const rawScroll = window.scrollY;

            const { p, maxScroll, camZTarget } = computeScrollDolly(rawScroll, vh, R);
            if (rawScroll > maxScroll && !cam.gridOpen && !cam.hasLit) {
                window.scrollTo(0, maxScroll);
            }

            // Toggle .deep class smoothly as visitor zooms into the archive
            const shouldBeDeep = p > 0.25;
            if (shouldBeDeep !== document.body.classList.contains('deep')) {
                document.body.classList.toggle('deep', shouldBeDeep);
            }

            if (!cam.dragging && !cam.hasLit) {
                cam.dragX += cam.velX;
                cam.dragY += cam.velY;
                cam.velX *= 0.94;
                cam.velY *= 0.94;
                if (Math.abs(cam.velX) < 0.002) cam.velX = 0;
                if (Math.abs(cam.velY) < 0.002) cam.velY = 0;
                // Clamp pitch so tilt + dragY stays inside ±32deg
                const clampedPitch = Math.max(-32, Math.min(32, cam.tilt + cam.dragY));
                cam.dragY = clampedPitch - cam.tilt;
            }

            cam.camZ += (camZTarget - cam.camZ) * 0.075;

            const sx = cam.tilt + cam.dragY;
            const sy = cam.spin + cam.dragX;

            if (worldRef.current) {
                worldRef.current.style.transform = `translateZ(${cam.camZ.toFixed(2)}px) rotateY(${sy.toFixed(3)}deg) rotateX(${sx.toFixed(3)}deg)`;
            }

            // Counter-rotate headline strictly in mandatory CSS right-to-left transform order
            if (headlineRef.current) {
                headlineRef.current.style.transform = `rotateX(${(-sx).toFixed(3)}deg) rotateY(${(-sy).toFixed(3)}deg) translateZ(${(R * 0.62).toFixed(2)}px)`;
                headlineRef.current.style.opacity = Math.max(0, 1 - p * 0.55).toFixed(3);
            }

            // Evaluate per-card atmospheric dark wash & near-plane fade only when values change
            for (let i = 0; i < spherePoints.length; i++) {
                const cardEl = cardRefs.current[i];
                if (!cardEl) continue;

                const { dim, opacity } = computeCardDepthStyle({
                    unitVec: spherePoints[i],
                    sxDeg: sx,
                    syDeg: sy,
                    R,
                    camZ: cam.camZ,
                    perspective: persp,
                    scrollP: p,
                    isFocused: cam.focused === i,
                    hasLit: cam.hasLit,
                });

                const prev = cam.lastCardStyles[i];
                if (!prev || prev.opacity !== opacity || prev.dim !== dim) {
                    if (!prev || prev.opacity !== opacity) {
                        cardEl.style.opacity = opacity;
                        cardEl.style.pointerEvents = opacity < 0.08 ? 'none' : 'auto';
                    }
                    if (!prev || prev.dim !== dim) {
                        cardEl.style.setProperty('--d', dim);
                    }
                    cam.lastCardStyles[i] = { dim, opacity };
                }
            }

            rafId = requestAnimationFrame(renderFrame);
        };

        // Run one synchronous initial frame before animation loop starts
        renderFrame();
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [spherePoints]);

    // Open Lightbox with FLIP transition from the clicked card or grid figure
    const openLightbox = useCallback(
        (idx, sourceEl, sourceType = 'sphere') => {
            const item = PROJECTS_SPHERE_ITEMS[idx];
            if (!item) return;

            const cam = camRef.current;
            const token = cam.litToken + 1;
            cam.litToken = token;
            cam.focused = idx;
            cam.hasLit = true;
            cam.litSourceType = sourceType;

            document.body.classList.add('lit');
            document.documentElement.style.overflow = 'hidden';

            const rect = sourceEl?.getBoundingClientRect();
            setLitState({ idx, item, previewSrc: thumbMap[item.id] || item.src });

            // Upgrade silently to full resolution original asset after onload
            const fullImg = new Image();
            fullImg.onload = () => {
                if (camRef.current.litToken !== token) return;
                if (litImgRef.current) {
                    litImgRef.current.src = item.src;
                }
            };
            fullImg.src = item.src;

            // Execute FLIP from source rect -> centered plate
            requestAnimationFrame(() => {
                const plate = plateRef.current;
                if (!plate || !rect || rect.width === 0) return;

                const destRect = plate.getBoundingClientRect();
                if (destRect.width === 0) return;

                const dx = rect.left + rect.width / 2 - (destRect.left + destRect.width / 2);
                const dy = rect.top + rect.height / 2 - (destRect.top + destRect.height / 2);
                const s = Math.max(0.04, rect.width / destRect.width);

                plate.style.transition = 'none';
                plate.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
                plate.style.opacity = '0';

                // Force style reflow before releasing to CSS transition
                void plate.offsetWidth;

                plate.style.transition = '';
                plate.style.transform = '';
                plate.style.opacity = '';
            });
        },
        [thumbMap]
    );

    const closeLightbox = useCallback(() => {
        const cam = camRef.current;
        if (!cam.hasLit) return;

        const closingIdx = cam.focused;
        const sourceType = cam.litSourceType;
        cam.litToken += 1;
        cam.focused = -1;
        cam.hasLit = false;

        const plate = plateRef.current;
        const targetEl =
            sourceType === 'grid'
                ? gridFigRefs.current[closingIdx]
                : cardRefs.current[closingIdx];

        if (plate && targetEl) {
            const destRect = targetEl.getBoundingClientRect();
            const plateRect = plate.getBoundingClientRect();
            if (destRect.width > 0 && plateRect.width > 0) {
                const dx = destRect.left + destRect.width / 2 - (plateRect.left + plateRect.width / 2);
                const dy = destRect.top + destRect.height / 2 - (plateRect.top + plateRect.height / 2);
                const s = Math.max(0.04, destRect.width / plateRect.width);
                plate.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
                plate.style.opacity = '0';
            }
        }

        document.body.classList.remove('lit');
        if (!cam.gridOpen) {
            document.documentElement.style.overflow = '';
        }

        if (cam.closeTimer) clearTimeout(cam.closeTimer);
        cam.closeTimer = setTimeout(() => {
            if (camRef.current.hasLit) return;
            if (plateRef.current) {
                plateRef.current.style.transition = 'none';
                plateRef.current.style.transform = '';
                plateRef.current.style.opacity = '';
                void plateRef.current.offsetWidth;
                plateRef.current.style.transition = '';
            }
            setLitState(null);
        }, 640);
    }, []);

    const toggleGrid = useCallback((nextVal) => {
        setGridOpen((prev) => {
            const next = typeof nextVal === 'boolean' ? nextVal : !prev;
            camRef.current.gridOpen = next;
            document.body.classList.toggle('gridview', next);
            document.documentElement.style.overflow = next ? 'hidden' : '';
            return next;
        });
    }, []);

    // Keyboard Escape hierarchy: lightbox first, then grid view
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            if (camRef.current.hasLit) {
                closeLightbox();
            } else if (camRef.current.gridOpen) {
                toggleGrid(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [closeLightbox, toggleGrid]);

    // Drag-to-rotate with momentum & smart touch gesture disambiguation
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        let activePointerId = null;
        let pointerType = 'mouse';
        let startX = 0;
        let startY = 0;
        let lastX = 0;
        let lastY = 0;
        let captured = false;
        let canceledForScroll = false;
        let downCardIdx = -1;

        const onPointerDown = (e) => {
            if (camRef.current.hasLit || camRef.current.gridOpen) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;

            const card = e.target.closest('.sphere-card');
            downCardIdx = card ? Number(card.dataset.idx) : -1;

            activePointerId = e.pointerId;
            pointerType = e.pointerType || 'mouse';
            startX = e.clientX;
            startY = e.clientY;
            lastX = e.clientX;
            lastY = e.clientY;
            canceledForScroll = false;

            if (pointerType !== 'touch') {
                captured = true;
                camRef.current.dragging = true;
                camRef.current.velX = 0;
                camRef.current.velY = 0;
                stage.setPointerCapture?.(e.pointerId);
            } else {
                captured = false;
            }
        };

        const onPointerMove = (e) => {
            if (e.pointerId !== activePointerId || canceledForScroll) return;

            const totalDx = Math.abs(e.clientX - startX);
            const totalDy = Math.abs(e.clientY - startY);

            if (pointerType === 'touch' && !captured) {
                if (totalDx < 10 && totalDy < 10) return;
                if (totalDy > totalDx * 1.15) {
                    canceledForScroll = true;
                    activePointerId = null;
                    downCardIdx = -1;
                    return;
                }
                captured = true;
                camRef.current.dragging = true;
                camRef.current.velX = 0;
                camRef.current.velY = 0;
                stage.setPointerCapture?.(e.pointerId);
            }

            if (!captured) return;

            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;

            const sensitivity = 0.13;
            const vx = dx * sensitivity;
            const vy = -dy * sensitivity;

            camRef.current.dragX += vx;
            const nextPitch = Math.max(
                -32,
                Math.min(32, camRef.current.tilt + camRef.current.dragY + vy)
            );
            camRef.current.dragY = nextPitch - camRef.current.tilt;
            camRef.current.velX = vx;
            camRef.current.velY = vy;
        };

        const onPointerUpOrCancel = (e) => {
            if (e.pointerId !== activePointerId) return;

            const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
            const slop = pointerType === 'touch' ? 14 : 6;
            const clickedIdx = downCardIdx;

            if (captured) {
                try {
                    stage.releasePointerCapture?.(e.pointerId);
                } catch {
                    // pointer may already be released
                }
            }

            camRef.current.dragging = false;
            activePointerId = null;
            captured = false;
            downCardIdx = -1;

            if (
                e.type === 'pointerup' &&
                !canceledForScroll &&
                dist <= slop &&
                clickedIdx >= 0 &&
                !camRef.current.hasLit
            ) {
                openLightbox(clickedIdx, cardRefs.current[clickedIdx], 'sphere');
            }
        };

        stage.addEventListener('pointerdown', onPointerDown);
        stage.addEventListener('pointermove', onPointerMove);
        stage.addEventListener('pointerup', onPointerUpOrCancel);
        stage.addEventListener('pointercancel', onPointerUpOrCancel);

        return () => {
            stage.removeEventListener('pointerdown', onPointerDown);
            stage.removeEventListener('pointermove', onPointerMove);
            stage.removeEventListener('pointerup', onPointerUpOrCancel);
            stage.removeEventListener('pointercancel', onPointerUpOrCancel);
        };
    }, [openLightbox]);

    // Fine-pointer custom difference cursor (#projects-dot)
    useEffect(() => {
        if (window.matchMedia?.('(hover: none), (pointer: coarse)')?.matches) return;
        const dot = dotRef.current;
        if (!dot) return;

        let targetX = -100;
        let targetY = -100;
        let currX = -100;
        let currY = -100;
        let rafId = null;

        const onMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            const hoverTarget = e.target.closest(
                '.sphere-card, a, button, #projects-grid figure'
            );
            dot.classList.toggle('wide', Boolean(hoverTarget));
            dot.style.opacity = '1';
        };

        const onLeave = () => {
            dot.style.opacity = '0';
        };

        const tick = () => {
            currX += (targetX - currX) * 0.2;
            currY += (targetY - currY) * 0.2;
            dot.style.transform = `translate3d(${currX.toFixed(1)}px, ${currY.toFixed(1)}px, 0)`;
            rafId = requestAnimationFrame(tick);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        document.body.addEventListener('mouseleave', onLeave);
        rafId = requestAnimationFrame(tick);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', onMove);
            document.body.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    return (
        <div className="projects-sphere-shell">
            {/* Scroll track defines 16vh depth dolly zoom */}
            <div id="scrolltrack" aria-hidden="true" />

            {/* Fixed 3D Fibonacci Sphere Stage */}
            <div ref={stageRef} id="stage" aria-label="Interactive 3D projects sphere">
                <div ref={worldRef} id="world">
                    <div id="orb">
                        {PROJECTS_SPHERE_ITEMS.map((item, i) => (
                            <div
                                key={item.id}
                                ref={(el) => {
                                    cardRefs.current[i] = el;
                                }}
                                data-idx={i}
                                className={`sphere-card${item.tall ? ' tall' : ''}`}
                                role="button"
                                tabIndex={gridOpen || litState ? -1 : 0}
                                aria-label={`${item.title} — ${item.projectTitle}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        openLightbox(i, cardRefs.current[i], 'sphere');
                                    }
                                }}
                            >
                                <figure>
                                    <img
                                        src={thumbMap[item.id] || item.src}
                                        alt={item.title}
                                        className={loadedIds[item.id] ? 'in' : ''}
                                        draggable={false}
                                    />
                                </figure>
                            </div>
                        ))}
                    </div>

                    {/* Centered serif headline straddling sphere origin (0x0) */}
                    <h1 ref={headlineRef} id="headline" aria-label={HEADLINE_WORDS.join(' ')}>
                        <span className="inner">
                            {HEADLINE_WORDS.map((word, i) => (
                                <React.Fragment key={word}>
                                    <span className="headline-word" style={{ '--i': i }}>
                                        {word}
                                    </span>
                                    {i < HEADLINE_WORDS.length - 1 ? ' ' : ''}
                                </React.Fragment>
                            ))}
                        </span>
                    </h1>
                </div>
            </div>

            {/* Subtle Edge Vignette */}
            <div className="vig" aria-hidden="true" />

            {/* Bottom-Left Engineer Bio */}
            <div className="bio chrome">
                <div className="who">
                    <img id="avatar" src={avatarUrl} alt="Vivaswan Shetty" />
                    <div>
                        <b>Vivaswan Shetty</b>
                        <small>Systems Architect · BMSCE</small>
                    </div>
                </div>
                <p>
                    Systems architecture is less about adding features and more about removing friction. Every product in this archive was built under real constraints.
                </p>
            </div>

            {/* Bottom-Right Colophon + Flat Grid Toggle Shortcut */}
            <div className="colophon chrome">
                <span className="colophon-label">Engineering Archive 2026</span>
                <button
                    type="button"
                    className="colophon-grid-shortcut"
                    onClick={() => toggleGrid(!gridOpen)}
                >
                    {gridOpen ? 'Sphere View' : 'Grid View'}
                </button>
            </div>

            {/* Bottom-Left 2x2 Grid Toggle Button (revealed on deep zoom / grid mode) */}
            <button
                type="button"
                id="gridBtn"
                className="gridbtn chrome"
                onClick={() => toggleGrid()}
                aria-label="Toggle grid view"
                aria-pressed={gridOpen}
            >
                <b />
                <b />
                <b />
                <b />
            </button>

            {/* Bottom-Center Drag / Scroll Cue */}
            <div className="cue chrome" aria-hidden="true">
                <s />
                <span>Drag to rotate · Scroll to zoom</span>
            </div>

            {/* Filterable Flat Grid View (#projects-grid) */}
            <section id="projects-grid" aria-label="Projects grid view" aria-hidden={!gridOpen}>
                <div className="projects-grid-header">
                    <div className="projects-grid-filters">
                        {[
                            { key: 'All', label: `All (${PROJECTS_SPHERE_ITEMS.length})` },
                            { key: 'Flagship', label: 'Flagship Systems (6)' },
                            { key: 'Mobile Apps', label: 'Mobile Apps' },
                            { key: 'Full-Stack Web', label: 'Full-Stack Web' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`projects-grid-filter-btn${gridFilter === tab.key ? ' active' : ''}`}
                                onClick={() => setGridFilter(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="projects-grid-search">
                        <input
                            type="text"
                            value={gridQuery}
                            onChange={(e) => setGridQuery(e.target.value)}
                            placeholder="Filter by stack or project..."
                            aria-label="Filter project archive"
                        />
                    </div>
                </div>

                <div className="rows">
                    {filteredGridItems.map(({ item, idx }) => (
                        <figure
                            key={item.id}
                            ref={(el) => {
                                gridFigRefs.current[idx] = el;
                            }}
                            data-idx={idx}
                            className={item.tall ? 'tall-frame' : ''}
                            onClick={() => openLightbox(idx, gridFigRefs.current[idx], 'grid')}
                        >
                            <img
                                src={thumbMap[item.id] || item.src}
                                alt={item.title}
                                loading="lazy"
                            />
                            <figcaption>
                                {item.title}
                                <small>{item.projectTitle}</small>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            {/* FLIP Zoom Lightbox (#lit) */}
            <div id="lit" role="dialog" aria-modal="true" aria-hidden={!litState} aria-label="Project showcase plate">
                <div className="scrim" onClick={closeLightbox} />
                {litState && (
                    <div ref={plateRef} className="plate">
                        <div className={`shot${litState.item.tall ? ' tall-shot' : ''}`}>
                            <img
                                ref={litImgRef}
                                src={litState.previewSrc}
                                alt={litState.item.title}
                            />
                            <button
                                type="button"
                                className="lit-close"
                                data-close
                                onClick={closeLightbox}
                            >
                                Close
                            </button>
                        </div>

                        <div className="meta">
                            <div>
                                <h2 id="litTitle">{litState.item.title}</h2>
                                <div id="litWhere" className="where">
                                    {litState.item.place}
                                </div>
                                <div className="lit-actions">
                                    <Link
                                        to={`/projects/${litState.item.slug}`}
                                        className="lit-case-btn"
                                        onClick={closeLightbox}
                                    >
                                        <span>Open Case Study</span>
                                        <ArrowRight size={13} />
                                    </Link>
                                    {litState.item.repo && (
                                        <a
                                            href={litState.item.repo}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="lit-ext-btn"
                                        >
                                            <Github size={13} />
                                            <span>Code</span>
                                        </a>
                                    )}
                                    {litState.item.liveUrl && litState.item.liveUrl !== '/' && (
                                        <a
                                            href={litState.item.liveUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="lit-ext-btn"
                                        >
                                            <ExternalLink size={13} />
                                            <span>Live</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <p id="litNote" className="note">
                                {litState.item.note}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Minimal Preload Splash */}
            {splashMounted && (
                <div ref={splashRef} id="projects-splash" aria-hidden="true">
                    <div className="mark">
                        Vivaswan<em>Archive</em>
                    </div>
                    <div className="bar">
                        <s ref={splashBarRef} />
                    </div>
                    <div className="tag">Engineering Systems 2026</div>
                </div>
            )}

            {/* Fine-Pointer Custom Difference Cursor */}
            <div ref={dotRef} id="projects-dot" aria-hidden="true" />
        </div>
    );
};

export default Projects;
