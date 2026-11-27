import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Github, Layers, LayoutGrid, Search, X } from 'lucide-react';
import portraitImg from '../assets/vivaswan_portrait.webp';
import { portfolioData } from '../data/portfolioData';
import { PROJECTS_SPHERE_ITEMS } from '../data/projectSphereItems';
import {
    buildSpherePoints,
    computeSphereLayout,
    computeCardDepthStyle,
    computeScrollDolly,
} from '../utils/projectSphere';

const HEADLINE_WORDS = ['I', 'Build', 'Systems', 'That', 'Scale'];
const INTRO_FILM_URL =
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260922_195107_ed3f055a-3a13-4a71-b743-e10310454246.mp4';
const INTRO_FILM_BACKSTOP_MS = 14000;
const AUTOPLAY_STALL_MS = 2600;
const IDLE_SCROLL_SNAP_LIMIT_PX = 20;

function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        const done = () => resolve(src);
        img.onload = () => {
            if (typeof img.decode === 'function') {
                img.decode().then(done).catch(done);
            } else {
                done();
            }
        };
        img.onerror = done;
        img.src = src;
        if (img.complete) done();
    });
}

const Projects = () => {
    const navigate = useNavigate();
    const stageRef = useRef(null);
    const worldRef = useRef(null);
    const headlineRef = useRef(null);
    const cardRefs = useRef([]);
    const washRefs = useRef([]);
    const introRef = useRef(null);
    const filmRef = useRef(null);
    const revealIntroRef = useRef(null);
    const litOverlayRef = useRef(null);
    const plateRef = useRef(null);
    const dotRef = useRef(null);
    const spotlightIdxRef = useRef(-1);

    const spherePoints = useMemo(() => buildSpherePoints(PROJECTS_SPHERE_ITEMS.length), []);

    const [imagesReady, setImagesReady] = useState(false);
    const [introMounted, setIntroMounted] = useState(() => {
        if (typeof window === 'undefined') return false;
        return !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    });

    const [spotlightIdx, setSpotlightIdx] = useState(-1);
    const [gridOpen, setGridOpen] = useState(false);
    const [gridFilter, setGridFilter] = useState('All');
    const [gridQuery, setGridQuery] = useState('');
    const [litState, setLitState] = useState(null); // { idx, item, previewSrc }

    // Imperative 3D physics + layout state (zero React re-renders during drag/scroll/frame)
    // Resting (spin: 255, tilt: 22) opens an unobstructed equatorial portal around #headline on load.
    const camRef = useRef({
        spin: 255,
        tilt: 22,
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
        litToken: 0,
        closeTimer: null,
    });

    // Overview grid uses only the 6 core projects (mirroring the original portfolio overview layout)
    const filteredOverviewProjects = useMemo(() => {
        const q = gridQuery.toLowerCase().trim();
        return portfolioData.projects.filter((project) => {
            let matchesCat = true;
            if (gridFilter === 'Mobile Apps') matchesCat = project.category === 'Mobile Apps';
            else if (gridFilter === 'Full-Stack Web') matchesCat = project.category === 'Full-Stack Web';

            const matchesQ =
                !q ||
                project.title.toLowerCase().includes(q) ||
                project.problem.toLowerCase().includes(q) ||
                (project.tagline && project.tagline.toLowerCase().includes(q)) ||
                project.tech.some((t) => t.toLowerCase().includes(q));

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
            body.classList.add('locked', 'projects-intro');
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

        const closeTimerRef = camRef.current;

        return () => {
            cancelAnimationFrame(initRaf);
            if (orientTimer) clearTimeout(orientTimer);
            if (closeTimerRef.closeTimer) clearTimeout(closeTimerRef.closeTimer);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onOrientation);
            window.visualViewport?.removeEventListener('resize', onVvResize);

            html.classList.remove('projects-html');
            html.style.overflow = '';
            body.classList.remove(
                'projects-archive',
                'locked',
                'revealed',
                'deep',
                'bio-out',
                'gridview',
                'lit',
                'projects-intro'
            );
            body.style.removeProperty('--persp');
            body.style.removeProperty('--cw');
            body.style.removeProperty('--hw');
        };
    }, [applySphereLayout]);

    // Preload 21 project images silently in background while opening directly into #intro film -> black veil -> sphere
    useEffect(() => {
        let cancelled = false;
        const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

        let revealScheduleTimer = null;
        let veilDoneTimer = null;
        let removeIntroTimer = null;
        let filmBackstopTimer = null;
        let autoplayStallTimer = null;
        let introRevealed = false;
        let unlockBound = false;

        const video = filmRef.current;

        const unbindUnlockGestures = () => {
            if (!unlockBound) return;
            unlockBound = false;
            window.removeEventListener('pointerdown', retryVideoPlay);
            window.removeEventListener('keydown', retryVideoPlay);
            window.removeEventListener('touchstart', retryVideoPlay);
        };

        const revealFromIntro = () => {
            if (introRevealed || cancelled) return;
            introRevealed = true;
            clearTimeout(revealScheduleTimer);
            clearTimeout(filmBackstopTimer);
            clearTimeout(autoplayStallTimer);
            unbindUnlockGestures();

            const body = document.body;
            const html = document.documentElement;
            if (introRef.current) {
                introRef.current.classList.add('closing');
            }
            body.classList.remove('locked');
            html.style.overflow = '';

            // Measure sphere twice inside the black veil before revealing
            applySphereLayout(true);
            requestAnimationFrame(() => {
                if (!cancelled) applySphereLayout(true);
            });

            veilDoneTimer = setTimeout(() => {
                if (cancelled) return;
                applySphereLayout(true);
                body.classList.remove('projects-intro');
                body.classList.add('revealed');
                if (introRef.current) {
                    introRef.current.classList.add('gone');
                }
                removeIntroTimer = setTimeout(() => {
                    if (!cancelled) {
                        setIntroMounted(false);
                        applySphereLayout(true);
                    }
                }, 700);
            }, 1000);
        };

        revealIntroRef.current = revealFromIntro;

        function retryVideoPlay() {
            if (!video || introRevealed || cancelled) return;
            video.muted = true;
            video.defaultMuted = true;
            video.playbackRate = 2;
            video.play().catch(() => {});
        }

        const bindUnlockGestures = () => {
            if (unlockBound) return;
            unlockBound = true;
            window.addEventListener('pointerdown', retryVideoPlay, { passive: true, once: true });
            window.addEventListener('keydown', retryVideoPlay, { passive: true, once: true });
            window.addEventListener('touchstart', retryVideoPlay, { passive: true, once: true });
        };

        const scheduleRevealFromVideo = () => {
            if (!video || introRevealed || cancelled) return;
            if (Number.isFinite(video.duration) && video.duration > 0) {
                const remainingMs = ((video.duration - video.currentTime - 0.45) / 2) * 1000;
                const delay = Math.max(300, remainingMs);
                clearTimeout(revealScheduleTimer);
                revealScheduleTimer = setTimeout(revealFromIntro, delay);
            }
        };

        const onVideoPlay = () => {
            if (video) video.playbackRate = 2;
        };

        const onVideoPlaying = () => {
            clearTimeout(autoplayStallTimer);
            unbindUnlockGestures();
            if (video) video.playbackRate = 2;
            scheduleRevealFromVideo();
        };

        const onVideoEnded = () => {
            revealFromIntro();
        };

        const onVideoError = () => {
            if (introRef.current) {
                introRef.current.classList.add('novideo');
            }
            clearTimeout(revealScheduleTimer);
            revealScheduleTimer = setTimeout(revealFromIntro, 1300);
        };

        if (video) {
            video.addEventListener('play', onVideoPlay);
            video.addEventListener('playing', onVideoPlaying);
            video.addEventListener('ended', onVideoEnded);
            video.addEventListener('error', onVideoError);
        }

        // Preload card imagery silently in background without blocking the eye intro
        Promise.all([
            preloadImage(portraitImg),
            ...PROJECTS_SPHERE_ITEMS.map((item) => preloadImage(item.src)),
        ]).then(() => {
            if (!cancelled) setImagesReady(true);
        });

        if (prefersReduced || !video) {
            revealFromIntro();
        } else {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.setAttribute('webkit-playsinline', 'true');
            video.playbackRate = 2;

            filmBackstopTimer = setTimeout(revealFromIntro, INTRO_FILM_BACKSTOP_MS);
            autoplayStallTimer = setTimeout(() => {
                if (!cancelled && !introRevealed && video.paused) {
                    revealFromIntro();
                }
            }, AUTOPLAY_STALL_MS);

            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    bindUnlockGestures();
                });
            }
            bindUnlockGestures();
        }

        return () => {
            cancelled = true;
            revealIntroRef.current = null;
            clearTimeout(revealScheduleTimer);
            clearTimeout(veilDoneTimer);
            clearTimeout(removeIntroTimer);
            clearTimeout(filmBackstopTimer);
            clearTimeout(autoplayStallTimer);
            unbindUnlockGestures();
            if (video) {
                video.removeEventListener('play', onVideoPlay);
                video.removeEventListener('playing', onVideoPlaying);
                video.removeEventListener('ended', onVideoEnded);
                video.removeEventListener('error', onVideoError);
            }
        };
    }, [applySphereLayout]);

    // Main 60 FPS Camera, Spotlight Zoom Focus, and Deep Zoom Portal to Overview Grid
    useEffect(() => {
        let rafId = null;

        const renderFrame = () => {
            const cam = camRef.current;
            const { R, persp } = cam.metrics;
            const vh = window.innerHeight || 900;
            const rawScroll = window.scrollY;

            const { p, camZTarget } = computeScrollDolly(rawScroll, vh, R);

            const shouldFadeBio = p > 0.08;
            if (shouldFadeBio !== document.body.classList.contains('bio-out')) {
                document.body.classList.toggle('bio-out', shouldFadeBio);
            }
            const shouldBeDeep = p > 0.24;
            if (shouldBeDeep !== document.body.classList.contains('deep')) {
                document.body.classList.toggle('deep', shouldBeDeep);
            }

            if (p < 0.55) {
                cam.zoomLatched = false;
            }

            if (!cam.dragging && !cam.hasLit) {
                cam.dragX += cam.velX;
                cam.dragY += cam.velY;
                cam.velX *= 0.94;
                cam.velY *= 0.94;
                if (Math.abs(cam.velX) < 0.002) cam.velX = 0;
                if (Math.abs(cam.velY) < 0.002) cam.velY = 0;
                const clampedPitch = Math.max(-32, Math.min(32, cam.tilt + cam.dragY));
                cam.dragY = clampedPitch - cam.tilt;
            }

            cam.camZ += (camZTarget - cam.camZ) * 0.075;

            const sx = cam.tilt + cam.dragY;
            const sy = cam.spin + cam.dragX;

            if (worldRef.current) {
                worldRef.current.style.transform = `translateZ(${cam.camZ.toFixed(2)}px) rotateY(${sy.toFixed(3)}deg) rotateX(${sx.toFixed(3)}deg)`;
            }

            if (headlineRef.current) {
                const headZ = R * 0.96 - cam.camZ * 0.42;
                headlineRef.current.style.transform = `rotateX(${(-sx).toFixed(3)}deg) rotateY(${(-sy).toFixed(3)}deg) translateZ(${headZ.toFixed(2)}px)`;
                headlineRef.current.style.opacity = Math.max(0, 1 - p * 0.72).toFixed(3);
            }

            // Identify closest front-center card during scroll-zoom so zooming actively focuses & unlocks inspection
            let nextSpotlight = -1;
            if (p > 0.14 && p < 0.94 && !cam.hasLit && !cam.gridOpen) {
                const radX = (sx * Math.PI) / 180;
                const radY = (sy * Math.PI) / 180;
                const cosX = Math.cos(radX);
                const sinX = Math.sin(radX);
                const cosY = Math.cos(radY);
                const sinY = Math.sin(radY);

                let bestScore = -Infinity;
                for (let i = 0; i < spherePoints.length; i++) {
                    const u = spherePoints[i];
                    const py = -u.y;
                    const y1 = py * cosX - u.z * sinX;
                    const z1 = py * sinX + u.z * cosX;
                    const x2 = u.x * cosY + z1 * sinY;
                    const z2 = -u.x * sinY + z1 * cosY;
                    if (z2 > 0.25 && z2 * R + cam.camZ < persp * 0.72) {
                        const score = z2 - Math.hypot(x2, y1) * 0.65;
                        if (score > bestScore) {
                            bestScore = score;
                            nextSpotlight = i;
                        }
                    }
                }
            }

            if (spotlightIdxRef.current !== nextSpotlight) {
                if (spotlightIdxRef.current >= 0 && cardRefs.current[spotlightIdxRef.current]) {
                    cardRefs.current[spotlightIdxRef.current].classList.remove('is-spotlight');
                }
                if (nextSpotlight >= 0 && cardRefs.current[nextSpotlight]) {
                    cardRefs.current[nextSpotlight].classList.add('is-spotlight');
                }
                spotlightIdxRef.current = nextSpotlight;
                setSpotlightIdx(nextSpotlight);
            }

            // Diving all the way in (p >= 0.94) smoothly transitions through the constellation into the full Overview Grid
            if (p >= 0.94 && !cam.gridOpen && !cam.hasLit && !cam.zoomLatched) {
                cam.zoomLatched = true;
                cam.gridOpen = true;
                document.body.classList.add('gridview');
                document.documentElement.style.overflow = 'hidden';
                setGridOpen(true);
            }

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
                        const washEl = washRefs.current[i];
                        if (washEl) {
                            washEl.style.opacity = dim;
                        }
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

    // Open Lightbox with FLIP transition from clicked sphere card
    const openLightbox = useCallback((idx, sourceEl) => {
        const item = PROJECTS_SPHERE_ITEMS[idx];
        if (!item) return;

        const cam = camRef.current;
        const token = cam.litToken + 1;
        cam.litToken = token;
        cam.focused = idx;
        cam.hasLit = true;

        document.body.classList.add('lit');
        document.documentElement.style.overflow = 'hidden';

        const rect = sourceEl?.getBoundingClientRect();
        setLitState({ idx, item, previewSrc: item.src });

        // Reset modal scroll & execute FLIP from source rect -> centered plate
        requestAnimationFrame(() => {
            if (litOverlayRef.current) {
                litOverlayRef.current.scrollTop = 0;
            }
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
    }, []);

    const closeLightbox = useCallback(() => {
        const cam = camRef.current;
        if (!cam.hasLit) return;

        const closingIdx = cam.focused;
        cam.litToken += 1;
        cam.focused = -1;
        cam.hasLit = false;

        const plate = plateRef.current;
        const targetEl = cardRefs.current[closingIdx];

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
            if (!next) {
                camRef.current.zoomLatched = false;
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
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
                                        src={item.src}
                                        alt={item.title}
                                        className={imagesReady ? 'in' : ''}
                                        decoding="async"
                                        draggable={false}
                                    />
                                    <span
                                        ref={(el) => {
                                            washRefs.current[i] = el;
                                        }}
                                        className="sphere-wash"
                                        aria-hidden="true"
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
                    <img id="avatar" src={portraitImg} alt="Vivaswan Shetty" />
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
                    <LayoutGrid size={13} />
                    <span>{gridOpen ? 'Sphere View' : 'Grid View'}</span>
                </button>
            </div>

            {/* Interactive Zoom Spotlight HUD (lets zoom inspect front card or dive straight into Overview Grid) */}
            {spotlightIdx >= 0 && PROJECTS_SPHERE_ITEMS[spotlightIdx] && (
                <button
                    type="button"
                    className="projects-zoom-hud"
                    onClick={() =>
                        openLightbox(
                            spotlightIdx,
                            cardRefs.current[spotlightIdx],
                            'sphere'
                        )
                    }
                >
                    Inspect {PROJECTS_SPHERE_ITEMS[spotlightIdx].projectTitle} · <span>Keep scrolling for Grid ↓</span>
                </button>
            )}

            {/* Bottom-Center Drag / Scroll Cue */}
            <div className="cue chrome" aria-hidden="true">
                <s />
                <span>Drag to rotate · Scroll to zoom into Grid</span>
            </div>

            {/* Project Overview Grid View (#projects-grid) matching editorial project overviews */}
            <section id="projects-grid" aria-label="Projects grid view" aria-hidden={!gridOpen}>
                <div className="projects-grid-intro">
                    <span className="projects-grid-eyebrow">SELECTED WORKS & ARCHIVE</span>
                    <h2 className="projects-grid-title">
                        PRODUCTION <span>SYSTEMS</span>
                    </h2>
                    <p className="projects-grid-sub">
                        Project overviews across mobile applications and full-stack platforms — select any system for full architecture breakdowns and screenshots.
                    </p>
                </div>

                <div className="projects-grid-header">
                    <div className="projects-grid-filters">
                        {[
                            { key: 'All', label: `All (${portfolioData.projects.length})` },
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
                        <Search size={14} className="projects-grid-search-icon" aria-hidden="true" />
                        <input
                            type="text"
                            value={gridQuery}
                            onChange={(e) => setGridQuery(e.target.value)}
                            placeholder="Filter by tech or project..."
                            aria-label="Filter project overviews"
                        />
                        {gridQuery && (
                            <button
                                type="button"
                                className="projects-grid-search-clear"
                                onClick={() => setGridQuery('')}
                                aria-label="Clear filter"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="projects-grid-count">
                    <span>
                        Showing {filteredOverviewProjects.length} of {portfolioData.projects.length} project overviews
                    </span>
                    {(gridQuery || gridFilter !== 'All') && (
                        <button
                            type="button"
                            className="projects-grid-reset"
                            onClick={() => {
                                setGridFilter('All');
                                setGridQuery('');
                            }}
                        >
                            Reset filters
                        </button>
                    )}
                </div>

                <div className="rows">
                    {filteredOverviewProjects.length === 0 ? (
                        <div className="projects-grid-empty">
                            <Search size={28} />
                            <h3>No matching projects found</h3>
                            <p>Try searching for Expo, Firebase, Next.js, or Socket.io.</p>
                            <button
                                type="button"
                                className="lit-case-btn"
                                onClick={() => {
                                    setGridFilter('All');
                                    setGridQuery('');
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        filteredOverviewProjects.map((project) => (
                            <article
                                key={project.slug}
                                className="projects-overview-card"
                                onClick={(e) => {
                                    if (e.target.closest('a') || e.target.closest('button')) return;
                                    navigate(`/projects/${project.slug}`);
                                }}
                            >
                                {project.image && (
                                    <div className="projects-overview-cover">
                                        <img src={project.image} alt={project.title} loading="lazy" />
                                        <div className="projects-overview-cover-scrim" />
                                        <span className="projects-overview-category">{project.category}</span>
                                    </div>
                                )}

                                <div className="projects-overview-body">
                                    <div className="projects-overview-top">
                                        <div className="projects-overview-brand">
                                            {project.logo && (
                                                <div className="projects-overview-logo">
                                                    <img src={project.logo} alt={`${project.title} logo`} loading="lazy" />
                                                </div>
                                            )}
                                            <div>
                                                <h3>{project.title}</h3>
                                                {project.tagline && (
                                                    <span className="projects-overview-tagline">
                                                        {project.tagline}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="projects-overview-links">
                                            {project.repo && (
                                                <a
                                                    href={project.repo}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="GitHub Repository"
                                                    aria-label={`${project.title} GitHub repository`}
                                                >
                                                    <Github size={17} />
                                                </a>
                                            )}
                                            {project.link && (
                                                <a
                                                    href={project.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="Live Preview"
                                                    aria-label={`${project.title} live preview`}
                                                >
                                                    <ExternalLink size={17} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <p className="projects-overview-summary">{project.problem}</p>

                                    <div className="projects-overview-tech">
                                        {project.tech.slice(0, 3).map((t) => (
                                            <span key={t} className="projects-overview-chip">
                                                {t}
                                            </span>
                                        ))}
                                        {project.tech.length > 3 && (
                                            <span className="projects-overview-chip muted">
                                                +{project.tech.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="projects-overview-footer">
                                        <span className="projects-overview-metric">
                                            <Layers size={14} />
                                            <span>{project.metrics ? project.metrics[0].val : 'Case Study'}</span>
                                        </span>
                                        <Link to={`/projects/${project.slug}`} className="projects-overview-cta">
                                            <span>Explore Case Study</span>
                                            <ArrowRight size={13} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>

            {/* Liquid Glass Scrollable FLIP Lightbox (#lit) */}
            <div
                id="lit"
                ref={litOverlayRef}
                role="dialog"
                aria-modal="true"
                aria-hidden={!litState}
                aria-label="Project showcase plate"
            >
                <div className="scrim" onClick={closeLightbox} />
                {litState && (
                    <div ref={plateRef} className="plate">
                        <div className="lit-topbar">
                            <span className="lit-kicker">
                                {litState.item.projectTitle} · {litState.item.category}
                            </span>
                            <button
                                type="button"
                                className="lit-close"
                                data-close
                                onClick={closeLightbox}
                                aria-label="Close expanded view"
                            >
                                <span>Close</span>
                                <X size={14} />
                            </button>
                        </div>

                        <div className={`shot${litState.item.tall ? ' tall-shot' : ''}`}>
                            <img
                                src={litState.previewSrc}
                                alt={litState.item.title}
                            />
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

            {/* Intro Film Layer (#projects-intro) */}
            {introMounted && (
                <div ref={introRef} id="projects-intro">
                    <video
                        ref={filmRef}
                        id="film"
                        src={INTRO_FILM_URL}
                        muted
                        playsInline
                        autoPlay
                        preload="auto"
                        disablePictureInPicture
                    />
                    <div className="fallback" aria-hidden="true" />
                    <div className="veil" aria-hidden="true" />
                    <button
                        type="button"
                        id="skip"
                        className="skip"
                        onClick={() => revealIntroRef.current?.()}
                    >
                        Skip
                    </button>
                </div>
            )}

            {/* Fine-Pointer Custom Difference Cursor */}
            <div ref={dotRef} id="projects-dot" aria-hidden="true" />
        </div>
    );
};

export default Projects;
