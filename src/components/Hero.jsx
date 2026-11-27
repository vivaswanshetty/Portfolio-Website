import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Code, Cpu, Zap, Globe, User, Briefcase, Mail, RotateCcw, FastForward } from 'lucide-react';
import archiveBg from '../assets/archive_bg.webp';
import { useIntro } from '../context/useIntro';
import {
    HERO_VIDEOS,
    HERO_COPY,
    INTRO_DURATION_MS,
    FAILSAFE_START_MS,
    PRE_START_SETTLE_MS,
    RAIN_CROSSFADE_TRIGGER_SEC,
    computeStageImageWidth,
    buildHeroImageUrls,
    computeHeadlineLayout,
    computeTiltVideoTarget,
    kfOffset,
} from '../utils/heroMetrics';

function preloadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
            if (typeof img.decode === 'function') {
                img.decode().catch(() => {}).finally(resolve);
            } else {
                resolve();
            }
        };
        img.onerror = resolve;
        img.src = url;
    });
}

function waitForVideoReady(videoEl) {
    return new Promise((resolve) => {
        if (!videoEl || videoEl.readyState >= 4) {
            resolve();
            return;
        }
        const done = () => {
            videoEl.removeEventListener('canplaythrough', done);
            videoEl.removeEventListener('loadeddata', done);
            videoEl.removeEventListener('error', done);
            resolve();
        };
        videoEl.addEventListener('canplaythrough', done, { once: true });
        videoEl.addEventListener('loadeddata', done, { once: true });
        videoEl.addEventListener('error', done, { once: true });
    });
}

/**
 * Lightweight 3D foreground atmospheric rain & subtle neon bokeh canvas
 * placed between the mid skyline layer (z=3) and balcony foreground (z=5),
 * paused automatically when off-screen or when reduced motion is enabled.
 */
const HeroRainCanvas = ({ active, windRef }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !active) return;

        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (mq?.matches) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let rafId = null;
        let isVisible = true;
        let drops = [];
        let motes = [];

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
            const w = canvas.clientWidth || window.innerWidth;
            const h = canvas.clientHeight || window.innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = w < 768 ? 42 : 76;
            drops = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                len: 14 + Math.random() * 24,
                speed: 7.5 + Math.random() * 8.5,
                alpha: 0.08 + Math.random() * 0.16,
                crimson: Math.random() > 0.86,
            }));

            motes = Array.from({ length: 16 }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 0.8 + Math.random() * 1.6,
                vx: (Math.random() - 0.5) * 0.25,
                vy: -0.15 - Math.random() * 0.3,
                alpha: 0.08 + Math.random() * 0.14,
            }));
        };

        resize();
        window.addEventListener('resize', resize, { passive: true });

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry?.isIntersecting ?? true;
            },
            { threshold: 0.05 }
        );
        observer.observe(canvas);

        const draw = () => {
            if (isVisible) {
                const w = canvas.clientWidth || window.innerWidth;
                const h = canvas.clientHeight || window.innerHeight;
                const wind = (windRef?.current || 0) * 1.6 + 0.55;

                ctx.clearRect(0, 0, w, h);
                ctx.lineWidth = 1;

                for (let i = 0; i < drops.length; i++) {
                    const d = drops[i];
                    ctx.strokeStyle = d.crimson
                        ? `rgba(239, 68, 68, ${d.alpha * 0.85})`
                        : `rgba(210, 218, 255, ${d.alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(d.x + wind * 2.2, d.y + d.len);
                    ctx.stroke();

                    d.x += wind * (d.speed * 0.12);
                    d.y += d.speed;
                    if (d.y > h + 30) {
                        d.y = -d.len - Math.random() * 40;
                        d.x = Math.random() * (w + 80) - 40;
                    }
                    if (d.x > w + 40) d.x = -20;
                    if (d.x < -40) d.x = w + 20;
                }

                for (let i = 0; i < motes.length; i++) {
                    const m = motes[i];
                    ctx.fillStyle = `rgba(220, 210, 255, ${m.alpha})`;
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
                    ctx.fill();

                    m.x += m.vx + wind * 0.12;
                    m.y += m.vy;
                    if (m.y < -10) {
                        m.y = h + 10;
                        m.x = Math.random() * w;
                    }
                }
            }
            rafId = requestAnimationFrame(draw);
        };

        rafId = requestAnimationFrame(draw);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
            observer.disconnect();
        };
    }, [active, windRef]);

    return (
        <canvas
            ref={canvasRef}
            className="harbor-layer harbor-rain-canvas-layer"
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-hidden="true"
        />
    );
};

const Hero = () => {
    const {
        replayCount,
        isIntroActive,
        startPlaying,
        revealNav,
        completeIntro,
        skipIntro,
        replayIntro,
    } = useIntro();

    const heroRef = useRef(null);
    const rigRef = useRef(null);
    const leftDoorRef = useRef(null);
    const rightDoorRef = useRef(null);
    const openingRef = useRef(null);
    const tiltVideoRef = useRef(null);
    const backLayerRef = useRef(null);
    const back3dRef = useRef(null);
    const topShadeRef = useRef(null);
    const headlineLayerRef = useRef(null);
    const headline3dRef = useRef(null);
    const kickerRef = useRef(null);
    const letterRefs = useRef([]);
    const midLayerRef = useRef(null);
    const mid3dRef = useRef(null);
    const frontLayerRef = useRef(null);
    const front3dRef = useRef(null);
    const glassTintRef = useRef(null);
    const actionsBarRef = useRef(null);
    const measureRef = useRef(null);

    const rainARef = useRef(null);
    const rainBRef = useRef(null);
    const rainControlRef = useRef({
        started: false,
        activeIndex: 0,
        swapping: false,
        pauseTimer: null,
    });

    const animationsRef = useRef([]);
    const depthStrengthRef = useRef(isIntroActive ? 0 : 1);
    const windXRef = useRef(0);

    const [imgWidth] = useState(() => {
        if (typeof window === 'undefined') return 2000;
        return computeStageImageWidth(
            window.innerWidth,
            window.innerHeight,
            window.devicePixelRatio || 1
        );
    });

    const images = useMemo(() => buildHeroImageUrls(imgWidth), [imgWidth]);

    const [layout, setLayout] = useState(() => {
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
        return computeHeadlineLayout({ viewportW: vw, viewportH: vh });
    });

    const [rainActive, setRainActive] = useState(!isIntroActive);

    const measureAndLayout = useCallback(() => {
        if (typeof window === 'undefined') return;
        const vw = window.innerWidth;
        const vh = heroRef.current?.clientHeight || window.innerHeight;
        const navEl = document.querySelector('.navbar-main');
        const navRect = navEl?.getBoundingClientRect();
        const navHiddenShift = navEl?.classList.contains('navbar-intro-hidden') ? 6 : 0;
        const navBottom = navRect ? navRect.bottom + navHiddenShift : vw <= 900 ? 65 : 74;
        const wordWidthAt100 = measureRef.current?.getBoundingClientRect().width || 480;

        setLayout(
            computeHeadlineLayout({
                viewportW: vw,
                viewportH: vh,
                navBottom,
                wordWidthAt100,
            })
        );
    }, []);

    useEffect(() => {
        let rafId = null;
        const initRaf = requestAnimationFrame(measureAndLayout);
        const onResize = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(measureAndLayout);
        };
        window.addEventListener('resize', onResize, { passive: true });
        document.fonts?.ready?.then(() => {
            measureAndLayout();
        });
        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(initRaf);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [measureAndLayout]);

    const stopRainLoop = useCallback(() => {
        const rc = rainControlRef.current;
        if (rc.pauseTimer) {
            clearTimeout(rc.pauseTimer);
            rc.pauseTimer = null;
        }
        rc.started = false;
        rc.swapping = false;
        rc.activeIndex = 0;
        [rainARef.current, rainBRef.current].forEach((vid) => {
            if (!vid) return;
            vid.classList.remove('is-on');
            vid.pause();
            vid.currentTime = 0;
        });
    }, []);

    const startRainLoop = useCallback(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (mq?.matches) return;

        const rc = rainControlRef.current;
        if (rc.started) return;
        const vidA = rainARef.current;
        const vidB = rainBRef.current;
        if (!vidA || !vidB) return;

        rc.started = true;
        rc.activeIndex = 0;
        rc.swapping = false;

        vidB.classList.remove('is-on');
        vidB.pause();
        vidB.currentTime = 0;

        vidA.currentTime = 0;
        vidA.classList.add('is-on');
        vidA.play().catch(() => {});
    }, []);

    const handleRainTimeUpdate = useCallback((videoIdx, forceSwap = false) => {
        const rc = rainControlRef.current;
        if (!rc.started || rc.swapping || rc.activeIndex !== videoIdx) return;

        const vids = [rainARef.current, rainBRef.current];
        const currentVid = vids[videoIdx];
        const nextIdx = videoIdx === 0 ? 1 : 0;
        const nextVid = vids[nextIdx];
        if (!currentVid || !nextVid) return;

        if (forceSwap || currentVid.currentTime >= RAIN_CROSSFADE_TRIGGER_SEC) {
            rc.swapping = true;
            rc.activeIndex = nextIdx;

            nextVid.currentTime = 0;
            nextVid.play().catch(() => {});
            nextVid.classList.add('is-on');
            currentVid.classList.remove('is-on');

            if (rc.pauseTimer) clearTimeout(rc.pauseTimer);
            rc.pauseTimer = setTimeout(() => {
                currentVid.pause();
                currentVid.currentTime = 0;
                rc.swapping = false;
            }, 800);
        }
    }, []);

    // Lock vertical scroll cleanly during active intro sequence; always restore on skip/done/unmount
    useEffect(() => {
        if (!isIntroActive) return;

        const originalOverflow = document.body.style.overflow;
        const originalPadding = document.body.style.paddingRight;
        const barWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        if (barWidth > 0) {
            document.body.style.paddingRight = `${barWidth}px`;
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPadding;
        };
    }, [isIntroActive]);

    // Pause background rain loop when scrolled past hero or reduced motion
    useEffect(() => {
        if (isIntroActive || !heroRef.current) return;
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (mq?.matches) {
            stopRainLoop();
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const vids = [rainARef.current, rainBRef.current];
                const activeVid = vids[rainControlRef.current.activeIndex];
                if (entry?.isIntersecting) {
                    if (!rainControlRef.current.started) {
                        startRainLoop();
                    } else if (activeVid?.paused) {
                        activeVid.play().catch(() => {});
                    }
                } else {
                    vids.forEach((v) => v?.pause());
                }
            },
            { threshold: 0.05 }
        );
        observer.observe(heroRef.current);
        return () => observer.disconnect();
    }, [isIntroActive, startRainLoop, stopRainLoop]);

    // Clean up WAAPI animations safely
    const cancelAllIntroAnimations = useCallback(() => {
        animationsRef.current.forEach((anim) => {
            try {
                anim.cancel();
            } catch {
                // ignore already finished/cancelled animations
            }
        });
        animationsRef.current = [];
        if (tiltVideoRef.current) {
            tiltVideoRef.current.pause();
        }
    }, []);

    const handleSkipIntro = useCallback(() => {
        cancelAllIntroAnimations();
        depthStrengthRef.current = 1;
        setRainActive(true);
        startRainLoop();
        skipIntro();
    }, [cancelAllIntroAnimations, startRainLoop, skipIntro]);

    const handleReplayIntro = useCallback(() => {
        setRainActive(false);
        replayIntro();
    }, [replayIntro]);

    // Master 7.4s cinematic intro orchestrator
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!isIntroActive || mq?.matches) {
            depthStrengthRef.current = 1;
            if (!mq?.matches) {
                startRainLoop();
            }
            return;
        }

        let cancelled = false;
        let masterRafId = null;
        let failsafeTimer = null;
        let settleTimer = null;

        stopRainLoop();
        depthStrengthRef.current = 0;

        // Allow skipping with Escape key
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleSkipIntro();
            }
        };
        window.addEventListener('keydown', onKeyDown);

        const launchMasterTimeline = () => {
            if (cancelled) return;
            startPlaying();

            const anims = [];
            const addAnim = (el, keyframes) => {
                if (!el || typeof el.animate !== 'function') return;
                const anim = el.animate(keyframes, {
                    duration: INTRO_DURATION_MS,
                    fill: 'both',
                });
                anim.pause();
                anims.push(anim);
            };

            // Doors slide cleanly from exact center seam
            addAnim(leftDoorRef.current, [
                { offset: 0, transform: 'translateX(0%)' },
                { offset: kfOffset(20), transform: 'translateX(0%)', easing: 'cubic-bezier(0.1, 0.2, 0.8, 1)' },
                { offset: kfOffset(1130), transform: 'translateX(-101%)' },
                { offset: 1, transform: 'translateX(-101%)' },
            ]);

            addAnim(rightDoorRef.current, [
                { offset: 0, transform: 'translateX(0%)' },
                { offset: kfOffset(20), transform: 'translateX(0%)', easing: 'cubic-bezier(0.4, 0.6, 0.9, 1)' },
                { offset: kfOffset(1240), transform: 'translateX(101%)' },
                { offset: 1, transform: 'translateX(101%)' },
            ]);

            // Tilt video blends in seamlessly over identical rooftop still
            addAnim(tiltVideoRef.current, [
                { offset: 0, opacity: 0 },
                { offset: kfOffset(1190), opacity: 0, easing: 'ease-in-out' },
                { offset: kfOffset(1470), opacity: 1 },
                { offset: 1, opacity: 1 },
            ]);

            // Opening box crossfades into matched stacked back + skyline layers
            addAnim(openingRef.current, [
                { offset: 0, opacity: 1 },
                { offset: kfOffset(2450), opacity: 1, easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },
                { offset: kfOffset(2950), opacity: 0 },
                { offset: 1, opacity: 0 },
            ]);

            // Kicker & Giant Headline reveal left-to-right
            addAnim(kickerRef.current, [
                { offset: 0, opacity: 0, transform: 'translateY(0.5em)' },
                { offset: kfOffset(2450), opacity: 0, transform: 'translateY(0.5em)', easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)' },
                { offset: kfOffset(3100), opacity: 1, transform: 'translateY(0em)' },
                { offset: 1, opacity: 1, transform: 'translateY(0em)' },
            ]);

            const letters = letterRefs.current.filter(Boolean);
            letters.forEach((span, i) => {
                const startMs = 2450 + i * 42;
                const endMs = startMs + 700;
                addAnim(span, [
                    { offset: 0, opacity: 0, transform: 'translateY(0.14em)' },
                    { offset: kfOffset(startMs), opacity: 0, transform: 'translateY(0.14em)', easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)' },
                    { offset: kfOffset(endMs), opacity: 1, transform: 'translateY(0em)' },
                    { offset: 1, opacity: 1, transform: 'translateY(0em)' },
                ]);
            });

            // Top sky readability gradient
            addAnim(topShadeRef.current, [
                { offset: 0, opacity: 0 },
                { offset: kfOffset(2900), opacity: 0, easing: 'ease-in-out' },
                { offset: kfOffset(3700), opacity: 1 },
                { offset: 1, opacity: 1 },
            ]);

            // Back storm sky drift
            addAnim(backLayerRef.current, [
                { offset: 0, transform: 'translateY(0%)' },
                { offset: kfOffset(2900), transform: 'translateY(0%)', easing: 'cubic-bezier(0.45, 0, 0.35, 1)' },
                { offset: kfOffset(4300), transform: 'translateY(-1.5%)' },
                { offset: 1, transform: 'translateY(-1.5%)' },
            ]);

            // Mid neon city skyline rises to overlap word feet, holds, then settles
            addAnim(midLayerRef.current, [
                { offset: 0, transform: 'translateY(0%)' },
                { offset: kfOffset(2900), transform: 'translateY(0%)', easing: 'cubic-bezier(0.45, 0, 0.3, 1)' },
                { offset: kfOffset(4300), transform: 'translateY(-4%)', easing: 'linear' },
                { offset: kfOffset(4600), transform: 'translateY(-4%)', easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },
                { offset: kfOffset(6900), transform: 'translateY(0%)' },
                { offset: 1, transform: 'translateY(0%)' },
            ]);

            // Headline gentle lift after letter reveal
            addAnim(headlineLayerRef.current, [
                { offset: 0, transform: 'translateY(6%)' },
                { offset: kfOffset(3000), transform: 'translateY(6%)', easing: 'cubic-bezier(0.3, 0, 0.4, 1)' },
                { offset: kfOffset(4800), transform: 'translateY(0%)' },
                { offset: 1, transform: 'translateY(0%)' },
            ]);

            // Front balcony figure + glass railing rise from below and gently bob into rest
            addAnim(frontLayerRef.current, [
                { offset: 0, transform: 'translateY(66%)' },
                { offset: kfOffset(3350), transform: 'translateY(66%)', easing: 'cubic-bezier(0.2, 0.5, 0.2, 1)' },
                { offset: kfOffset(6000), transform: 'translateY(-2.5%)', easing: 'cubic-bezier(0.45, 0, 0.55, 1)' },
                { offset: kfOffset(7300), transform: 'translateY(0%)' },
                { offset: 1, transform: 'translateY(0%)' },
            ]);

            // Portfolio quick actions fade in cleanly as front figure settles
            addAnim(actionsBarRef.current, [
                { offset: 0, opacity: 0, transform: 'translateY(14px)' },
                { offset: kfOffset(5900), opacity: 0, transform: 'translateY(14px)', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
                { offset: kfOffset(7100), opacity: 1, transform: 'translateY(0px)' },
                { offset: 1, opacity: 1, transform: 'translateY(0px)' },
            ]);

            animationsRef.current = anims;

            const startClock = performance.now();
            let tiltStarted = false;
            let tiltEnded = false;
            let rainStarted = false;
            let navTriggered = false;

            const tick = (now) => {
                if (cancelled) return;
                const elapsed = Math.min(now - startClock, INTRO_DURATION_MS);

                for (let i = 0; i < anims.length; i++) {
                    anims[i].currentTime = elapsed;
                }

                // Smoothly blend live 3D interactive depth in during final settle (4.5s -> 7.4s)
                depthStrengthRef.current =
                    elapsed <= 4500 ? 0 : Math.min(1, (elapsed - 4500) / 2900);

                // Tilt video synchronization (1.25s -> 2.85s)
                const tv = tiltVideoRef.current;
                if (tv) {
                    const clipDur = Number.isFinite(tv.duration) && tv.duration > 0 ? tv.duration : 5.04;
                    const sync = computeTiltVideoTarget({
                        elapsedMs: elapsed,
                        clipDuration: clipDur,
                        currentVideoTime: tv.currentTime || 0,
                    });

                    if (sync.active) {
                        if (!tiltStarted) {
                            tiltStarted = true;
                            tv.currentTime = 0;
                            tv.playbackRate = sync.rate;
                            tv.play().catch(() => {});
                        } else {
                            tv.playbackRate = sync.rate;
                        }
                    } else if (sync.ended && !tiltEnded) {
                        tiltEnded = true;
                        tv.pause();
                        try {
                            tv.currentTime = clipDur;
                        } catch {
                            // ignore seek error on unbuffered video
                        }
                    }
                }

                if (elapsed >= 2400 && !rainStarted) {
                    rainStarted = true;
                    setRainActive(true);
                    startRainLoop();
                }

                if (elapsed >= 2450 && !navTriggered) {
                    navTriggered = true;
                    revealNav();
                }

                if (elapsed < INTRO_DURATION_MS) {
                    masterRafId = requestAnimationFrame(tick);
                } else {
                    cancelAllIntroAnimations();
                    depthStrengthRef.current = 1;
                    completeIntro();
                }
            };

            masterRafId = requestAnimationFrame(tick);
        };

        let started = false;
        const beginAfterSettle = () => {
            if (started || cancelled) return;
            started = true;
            if (failsafeTimer) clearTimeout(failsafeTimer);
            settleTimer = setTimeout(launchMasterTimeline, PRE_START_SETTLE_MS);
        };

        Promise.all([
            preloadImage(images.doors),
            preloadImage(images.aerial),
            preloadImage(images.back),
            preloadImage(images.mid),
            preloadImage(images.front),
            waitForVideoReady(tiltVideoRef.current),
        ]).then(beginAfterSettle);

        failsafeTimer = setTimeout(() => {
            if (!started && !cancelled) {
                started = true;
                launchMasterTimeline();
            }
        }, FAILSAFE_START_MS);

        return () => {
            cancelled = true;
            window.removeEventListener('keydown', onKeyDown);
            if (masterRafId) cancelAnimationFrame(masterRafId);
            if (failsafeTimer) clearTimeout(failsafeTimer);
            if (settleTimer) clearTimeout(settleTimer);
            cancelAllIntroAnimations();
        };
    }, [
        replayCount,
        isIntroActive,
        images,
        startPlaying,
        revealNav,
        completeIntro,
        startRainLoop,
        stopRainLoop,
        cancelAllIntroAnimations,
        handleSkipIntro,
    ]);

    // Live 3D Spatial Camera Rig (cursor depth + glass specular sheen + scroll parallax)
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (mq?.matches) return;

        const isCoarse = window.matchMedia?.('(pointer: coarse)')?.matches;
        let targetX = 0;
        let targetY = 0;
        let currX = 0;
        let currY = 0;
        let targetScroll = window.scrollY;
        let currScroll = window.scrollY;
        let rafId = null;

        const onPointerMove = (e) => {
            if (isCoarse) return;
            const vw = window.innerWidth || 1;
            const vh = window.innerHeight || 1;
            targetX = Math.max(-1, Math.min(1, (e.clientX / vw - 0.5) * 2));
            targetY = Math.max(-1, Math.min(1, (e.clientY / vh - 0.5) * 2));
        };

        const onPointerLeave = () => {
            targetX = 0;
            targetY = 0;
        };

        const onScroll = () => {
            targetScroll = window.scrollY;
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.body.addEventListener('mouseleave', onPointerLeave);
        window.addEventListener('scroll', onScroll, { passive: true });

        const tick3D = (now) => {
            // Subtle idle organic drift on coarse touch devices or stationary cursor
            const driftX = Math.sin(now * 0.00055) * 0.16;
            const driftY = Math.cos(now * 0.00042) * 0.12;
            const goalX = isCoarse ? driftX : targetX + driftX * 0.35;
            const goalY = isCoarse ? driftY : targetY + driftY * 0.35;

            currX += (goalX - currX) * 0.06;
            currY += (goalY - currY) * 0.06;
            currScroll += (targetScroll - currScroll) * 0.12;

            windXRef.current = currX;
            const mix = depthStrengthRef.current;
            const scrollClamp = Math.min(currScroll, 900);

            if (rigRef.current) {
                const rx = (-currY * 2.0 * mix).toFixed(3);
                const ry = (currX * 2.6 * mix).toFixed(3);
                const sc = (1 + 0.045 * mix).toFixed(4);
                rigRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${sc})`;
            }

            if (back3dRef.current) {
                back3dRef.current.style.transform = `translate3d(${(-currX * 8 * mix).toFixed(2)}px, ${(-currY * 5 * mix + scrollClamp * 0.14).toFixed(2)}px, -35px)`;
            }
            if (headline3dRef.current) {
                headline3dRef.current.style.transform = `translate3d(${(-currX * 18 * mix).toFixed(2)}px, ${(-currY * 10 * mix + scrollClamp * 0.24).toFixed(2)}px, 24px)`;
            }
            if (mid3dRef.current) {
                mid3dRef.current.style.transform = `translate3d(${(-currX * 30 * mix).toFixed(2)}px, ${(-currY * 16 * mix + scrollClamp * 0.34).toFixed(2)}px, 50px)`;
            }
            if (front3dRef.current) {
                front3dRef.current.style.transform = `translate3d(${(-currX * 48 * mix).toFixed(2)}px, ${(-currY * 22 * mix + scrollClamp * 0.06).toFixed(2)}px, 85px)`;
            }
            if (glassTintRef.current) {
                glassTintRef.current.style.setProperty('--glass-mx', `${(50 + currX * 38).toFixed(1)}%`);
                glassTintRef.current.style.setProperty('--glass-my', `${(35 + currY * 28).toFixed(1)}%`);
            }

            rafId = requestAnimationFrame(tick3D);
        };

        rafId = requestAnimationFrame(tick3D);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onPointerMove);
            document.body.removeEventListener('mouseleave', onPointerLeave);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const scrollToCapabilities = () => {
        const nextSection = document.getElementById('capabilities-section');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const letters = useMemo(() => HERO_COPY.word.split(''), []);

    return (
        <section
            ref={heroRef}
            className={`harbor-hero${isIntroActive ? ' intro' : ''}`}
            aria-label="Hero showcase"
        >
            {/* Offscreen DOM metric probe for exact Inter 700 width measurement */}
            <span
                ref={measureRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    visibility: 'hidden',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: "'InterHero', 'Inter', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    textTransform: 'uppercase',
                    fontSize: '100px',
                    lineHeight: 1,
                }}
            >
                {HERO_COPY.word}
            </span>

            {/* 3D Perspective Cover Stage */}
            <div className="harbor-stage-perspective">
                <div ref={rigRef} className="harbor-stage-rig">
                    <div
                        className="harbor-stage"
                        style={{
                            width: `${layout.stageW}px`,
                            height: `${layout.stageH}px`,
                        }}
                    >
                        {/* Layer 1: Back Storm Sky, Dual Seamless Rain Video Loop & Top Readability Shade */}
                        <div ref={backLayerRef} className="harbor-layer harbor-back-layer">
                            <div ref={back3dRef} className="harbor-3d-plane">
                                <img
                                    src={images.back}
                                    alt=""
                                    className="harbor-cover-media"
                                    decoding="async"
                                />
                                <video
                                    ref={rainARef}
                                    src={HERO_VIDEOS.rain}
                                    muted
                                    playsInline
                                    preload="auto"
                                    disablePictureInPicture
                                    onTimeUpdate={() => handleRainTimeUpdate(0)}
                                    onEnded={() => handleRainTimeUpdate(0, true)}
                                    className="harbor-cover-media harbor-rain-video"
                                />
                                <video
                                    ref={rainBRef}
                                    src={HERO_VIDEOS.rain}
                                    muted
                                    playsInline
                                    preload="auto"
                                    disablePictureInPicture
                                    onTimeUpdate={() => handleRainTimeUpdate(1)}
                                    onEnded={() => handleRainTimeUpdate(1, true)}
                                    className="harbor-cover-media harbor-rain-video"
                                />
                                <div ref={topShadeRef} className="harbor-top-shade" />
                            </div>
                        </div>

                        {/* Layer 2: Giant Dimensional Word & Kicker Between Back Sky & Skyline */}
                        <div ref={headlineLayerRef} className="harbor-layer harbor-headline-layer">
                            <div ref={headline3dRef} className="harbor-3d-plane">
                                <div
                                    className="harbor-headline-anchor"
                                    style={{
                                        bottom: `calc(${(1 - layout.baselinePct) * 100}% - ${(0.135 * layout.wordSize).toFixed(1)}px)`,
                                        width: '100vw',
                                    }}
                                >
                                    <span
                                        ref={kickerRef}
                                        className="harbor-kicker"
                                        style={{
                                            fontSize: `${layout.kickerSize.toFixed(1)}px`,
                                            marginBottom: `${layout.kickerGap.toFixed(1)}px`,
                                        }}
                                    >
                                        {HERO_COPY.kicker}
                                    </span>

                                    <h1
                                        className="harbor-word"
                                        aria-label={HERO_COPY.ariaLabel}
                                        style={{ fontSize: `${layout.wordSize.toFixed(1)}px` }}
                                    >
                                        {letters.map((char, idx) => (
                                            <span
                                                key={idx}
                                                ref={(el) => {
                                                    letterRefs.current[idx] = el;
                                                }}
                                                className="harbor-letter"
                                            >
                                                {char}
                                            </span>
                                        ))}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Layer 3: Mid Neon Harbour City Skyline */}
                        <div ref={midLayerRef} className="harbor-layer harbor-mid-layer">
                            <div ref={mid3dRef} className="harbor-3d-plane">
                                <img
                                    src={images.mid}
                                    alt="Neon city harbour skyline at night"
                                    className="harbor-cover-media"
                                    decoding="async"
                                />
                            </div>
                        </div>

                        {/* Layer 4: Foreground Rain & Specular Particles Canvas */}
                        <HeroRainCanvas active={rainActive || !isIntroActive} windRef={windXRef} />

                        {/* Layer 5: Front Glass Balustrade Tint & Balcony Silhouette */}
                        <div ref={frontLayerRef} className="harbor-layer harbor-front-layer">
                            <div ref={front3dRef} className="harbor-3d-plane">
                                <div ref={glassTintRef} className="harbor-glass-tint" aria-hidden="true">
                                    <div className="harbor-glass-sheen" />
                                </div>
                                <img
                                    src={images.front}
                                    alt="Penthouse terrace overlooking rain-soaked city harbour"
                                    className="harbor-cover-media"
                                    decoding="async"
                                />
                            </div>
                        </div>

                        {/* Layer 6 inside exact 16:9 Stage: Opening Drone Pool + Camera Tilt (zero seam on skyline handoff) */}
                        {isIntroActive && (
                            <div ref={openingRef} className="harbor-opening" aria-hidden="true">
                                <img
                                    src={images.aerial}
                                    alt=""
                                    className="harbor-cover-media"
                                    decoding="async"
                                />
                                <video
                                    ref={tiltVideoRef}
                                    src={HERO_VIDEOS.tilt}
                                    muted
                                    playsInline
                                    preload="auto"
                                    disablePictureInPicture
                                    className="harbor-cover-media"
                                    style={{ opacity: 0 }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Opening Doors & Skip Control (pinned cleanly to hero viewport edges) */}
            {isIntroActive && (
                <>
                    {/* Paired Black Lacquer Pocket Doors splitting cleanly from exact center seam */}
                    <div className="harbor-doors" aria-hidden="true">
                        <div ref={leftDoorRef} className="harbor-door-panel harbor-door-left">
                            <img
                                src={images.doors}
                                alt=""
                                className="harbor-door-img"
                                style={{
                                    width: `${layout.stageW}px`,
                                    height: `${layout.stageH}px`,
                                    right: `${-layout.stageW / 2}px`,
                                }}
                            />
                        </div>
                        <div ref={rightDoorRef} className="harbor-door-panel harbor-door-right">
                            <img
                                src={images.doors}
                                alt=""
                                className="harbor-door-img"
                                style={{
                                    width: `${layout.stageW}px`,
                                    height: `${layout.stageH}px`,
                                    left: `${-layout.stageW / 2}px`,
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSkipIntro}
                        className="harbor-skip-btn"
                        aria-label="Skip opening sequence"
                    >
                        <span>Skip Intro</span>
                        <FastForward size={12} />
                    </button>
                </>
            )}

            {/* Minimal Portfolio Actions Dock along bottom wet stone zone */}
            <div ref={actionsBarRef} className="harbor-actions-bar">
                <div className="harbor-cta-cluster">
                    <Link to="/projects" className="harbor-cta-primary">
                        <span>View Projects</span>
                        <ArrowRight size={14} />
                    </Link>
                    <Link to="/contact" className="harbor-cta-glass">
                        <span>Get In Touch</span>
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={scrollToCapabilities}
                    className="harbor-scroll-cue"
                    aria-label="Scroll to Engineering Capabilities"
                >
                    <span>Explore</span>
                    <ArrowDown size={13} />
                </button>

                <div className="harbor-right-meta">
                    <div className="harbor-status-pill">
                        <span className="editorial-status-beacon" aria-hidden="true" />
                        <span>Available · Bengaluru</span>
                    </div>
                    {!isIntroActive && (
                        <button
                            type="button"
                            onClick={handleReplayIntro}
                            className="harbor-replay-btn"
                            title="Replay cinematic entrance"
                            aria-label="Replay 3D opening animation"
                        >
                            <RotateCcw size={12} />
                            <span>Replay</span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ feature, idx, isInView }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={
                isInView
                    ? {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.5, delay: idx * 0.08 },
                      }
                    : {}
            }
            style={{ height: '100%' }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
            <div className="editorial-feature-card">
                <div>
                    <div className="feature-card-header">
                        <feature.icon size={22} className="feature-card-icon" />
                        <span className="feature-card-index">0{idx + 1}</span>
                    </div>
                    <h3 className="feature-card-title">{feature.title}</h3>
                </div>
                <p className="feature-card-desc">{feature.desc}</p>
            </div>
        </motion.div>
    );
};

const FeaturedSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const features = [
        {
            icon: Code,
            title: 'Full Stack & Mobile Systems',
            desc: 'Production-ready architecture with React Native, Expo & MERN ecosystem.',
        },
        {
            icon: Cpu,
            title: 'Visionary Architecture',
            desc: 'Designing resilient distributed backends and AI-first engineering workflows.',
        },
        {
            icon: Zap,
            title: 'High Performance & Precision',
            desc: 'Optimized 60 FPS interfaces, offline-first sync engines, and tight data pipelines.',
        },
        {
            icon: Globe,
            title: 'Leadership & Execution',
            desc: 'Driving end-to-end products from conception to high-scale execution.',
        },
    ];

    return (
        <section
            id="capabilities-section"
            ref={ref}
            style={{
                padding: '10rem 2.5rem 6rem',
                maxWidth: '1300px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 10,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="editorial-section-header"
            >
                <span className="editorial-eyebrow-text">WHAT I DO.</span>
                <h2 className="editorial-section-title">
                    ENGINEERING <span style={{ color: '#ef4444' }}>CAPABILITIES</span>
                </h2>
            </motion.div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                    gap: '1.25rem',
                }}
            >
                {features.map((feature, idx) => (
                    <FeatureCard key={idx} feature={feature} idx={idx} isInView={isInView} />
                ))}
            </div>
        </section>
    );
};

const QuickLinkCard = ({ link, idx, isInView }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
                isInView
                    ? {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, delay: idx * 0.08 },
                      }
                    : {}
            }
            style={{ height: '100%' }}
        >
            <Link to={link.path} className="editorial-quicklink-card">
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginBottom: '1.5rem',
                    }}
                >
                    <link.icon size={22} className="quicklink-icon" color="var(--text-main)" />
                    <ArrowRight size={16} className="quicklink-arrow" color="var(--text-subtle)" />
                </div>
                <div>
                    <span
                        style={{
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            fontFamily: 'var(--font-heading)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            display: 'block',
                            marginBottom: '0.3rem',
                            color: '#ffffff',
                        }}
                    >
                        {link.label}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                        {link.desc}
                    </span>
                </div>
            </Link>
        </motion.div>
    );
};

const QuickLinks = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const links = [
        { icon: User, label: 'About', path: '/about', desc: 'Journey & philosophy' },
        { icon: Briefcase, label: 'Projects', path: '/projects', desc: 'Featured systems' },
        { icon: Code, label: 'Skills', path: '/skills', desc: 'Technical stack' },
        { icon: Mail, label: 'Contact', path: '/contact', desc: 'Initiate dialogue' },
    ];

    return (
        <section
            ref={ref}
            style={{
                position: 'relative',
                padding: '6rem 2.5rem 8rem',
                maxWidth: '1300px',
                margin: '0 auto',
                zIndex: 10,
            }}
        >
            {/* Seamless Cinematic Atmospheric Backdrop (No box lines, infinite radial blend) */}
            <div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-25vw',
                    right: '-25vw',
                    bottom: '-20%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    maskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 85%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 50%, black 25%, transparent 85%)',
                }}
            >
                <img
                    src={archiveBg}
                    alt="Archive Atmosphere"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        opacity: 0.42,
                        filter: 'brightness(0.85) contrast(1.15)',
                    }}
                />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="editorial-section-header"
                >
                    <span className="editorial-eyebrow-text">NAVIGATION.</span>
                    <h2 className="editorial-section-title">
                        EXPLORE THE <span style={{ color: '#ef4444' }}>ARCHIVE</span>
                    </h2>
                </motion.div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                        gap: '1.25rem',
                    }}
                >
                    {links.map((link, idx) => (
                        <QuickLinkCard key={idx} link={link} idx={idx} isInView={isInView} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    return (
        <div className="home-editorial-wrapper">
            <Hero />
            <FeaturedSection />
            <QuickLinks />
        </div>
    );
};

export default Home;
