import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
    Award,
    Briefcase,
    Calendar,
    ChevronRight,
    Cpu,
    ExternalLink,
    Globe,
    GraduationCap,
    Layers,
    MapPin,
    Play,
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import medfindImg from '../assets/medfind.webp';
import rvToursImg from '../assets/rv-tours.webp';
import conqueroneImg from '../assets/conquerone.webp';
import elevatexImg from '../assets/elevatex.webp';
import {
    PLATE_H,
    PLATE_W,
    RESUME_SKYLINE_ASSETS,
    VIDEO_CROP_H,
    VIDEO_CROP_Y,
    chromaKeyRgbaPixel,
    clamp,
    computeStageLayout,
    evaluateIntroTimeline,
    evaluateScrollTimeline,
    lerp,
} from '../utils/resumeSkyline';
import { LiquidGlass } from './ui/LiquidGlass';

const RESUME_ROLE_CARDS = [
    {
        slug: 'medfind',
        title: 'MedFind',
        subtitle: 'Lead Mobile Architect',
        year: '2026',
        img: medfindImg,
        specs: ['RN 0.88', '87 Ctry', 'OSM GPS'],
    },
    {
        slug: 'rv-tours-and-travels',
        title: 'RV Tours & Travels',
        subtitle: 'Full-Stack Architect',
        year: '2026–Now',
        img: rvToursImg,
        specs: ['Next 16', '100 SEO', 'Vercel'],
    },
    {
        slug: 'conquerone',
        title: 'CONQUER ONE',
        subtitle: 'Creator & Lead Dev',
        year: '2026–Now',
        img: conqueroneImg,
        specs: ['Expo 54', 'Gemini', 'Health API'],
    },
    {
        slug: 'elevatex-web',
        title: 'ElevateX',
        subtitle: 'Founder & Lead Dev',
        year: '2025–Now',
        img: elevatexImg,
        specs: ['MERN', '<50ms WS', 'Bun'],
    },
];

// Inline SVG mask polygon matching the exact cylindrical supertall silhouette on the 2048x1360 hero plate
const TOWER_MASK_SVG = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 1360" preserveAspectRatio="none"><defs><filter id="crownBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter></defs><polygon fill="white" points="978,1222 986,1150 990,700 994,420 990,340 994,316 1054,316 1058,340 1062,420 1065,1000 1068,1200 1074,1222"/><ellipse cx="1024" cy="322" rx="62" ry="38" fill="white" filter="url(#crownBlur)"/></svg>`
)}")`;

const MeasureHeadlineMetrics = (() => {
    let cachedCtx = null;
    return (fontFamily, text) => {
        if (typeof document === 'undefined') return null;
        if (!cachedCtx) {
            const c = document.createElement('canvas');
            cachedCtx = c.getContext('2d');
        }
        const ctx = cachedCtx;
        if (!ctx) return null;
        ctx.font = fontFamily;
        const m = ctx.measureText(text);
        return {
            width: Math.max(1, (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width)),
            leftOffset: m.actualBoundingBoxLeft || 0,
            capAscent: m.actualBoundingBoxAscent || 72,
            ascent: m.fontBoundingBoxAscent || 88,
            descent: m.fontBoundingBoxDescent || 22,
        };
    };
})();

const Resume = () => {
    const navigate = useNavigate();
    const { experience, education, achievements, certifications } = portfolioData.resume;

    const storyRef = useRef(null);
    const stageRef = useRef(null);
    const viewRef = useRef(null);
    const headRef = useRef(null);
    const wordRef = useRef(null);
    const towerRef = useRef(null);
    const towerImgRef = useRef(null);
    const scriptRef = useRef(null);
    const shadeRef = useRef(null);
    const roomLayerRef = useRef(null);
    const roomCanvasRef = useRef(null);
    const heroImgRef = useRef(null);
    const heroVidRef = useRef(null);
    const skyRef = useRef(null);
    const buildRef = useRef(null);
    const paraRef = useRef(null);
    const cardRefs = useRef([]);
    const dossierRef = useRef(null);

    const [videoPlaying, setVideoPlaying] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(() =>
        typeof window !== 'undefined'
            ? Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
            : false
    );

    const engineRef = useRef({
        layout: typeof window !== 'undefined' ? computeStageLayout(window.innerWidth, window.innerHeight) : null,
        introStartMs: null,
        assetsReady: false,
        roomKeyed: false,
        pCur: 0,
        typography: null,
    });

    // Apply pure-indigo portal root class before first paint
    useLayoutEffect(() => {
        const prevTitle = document.title;
        document.title = 'Resume | Vivaswan Shetty — Engineering Trajectory';
        document.documentElement.classList.add('resume-skyline-html');
        document.body.classList.add('resume-skyline-route');
        return () => {
            document.title = prevTitle;
            document.documentElement.classList.remove('resume-skyline-html');
            document.body.classList.remove('resume-skyline-route');
            document.documentElement.style.removeProperty('--rs-s');
            document.documentElement.style.removeProperty('--rs-travel');
            document.documentElement.style.removeProperty('--rs-cs');
            document.documentElement.style.removeProperty('--rs-ph');
        };
    }, []);

    // Measure & synchronize canvas-accurate ink box placement ("RESUME" & "Engineering") + responsive cover layout
    useLayoutEffect(() => {
        const recalc = () => {
            const stageEl = stageRef.current;
            const W = window.innerWidth;
            const H = stageEl?.clientHeight || window.innerHeight;
            const navEl = document.querySelector('.navbar-main');
            const navBottom = navEl ? Math.max(navEl.getBoundingClientRect().bottom, 64) : 76;

            const layout = computeStageLayout(W, H, navBottom);
            engineRef.current.layout = layout;

            document.documentElement.style.setProperty('--rs-s', `${layout.s}`);
            document.documentElement.style.setProperty('--rs-travel', `${layout.travel}px`);
            document.documentElement.style.setProperty('--rs-cs', `${layout.cs}`);
            document.documentElement.style.setProperty('--rs-ph', `${layout.phRatio}`);

            // Plate cover placement (heroImg, heroVid rows 208..1360, .sky 1.6*ph, towerImg)
            const { sc, pw, ph, ox, oy, s, phone } = layout;
            if (heroImgRef.current) {
                Object.assign(heroImgRef.current.style, {
                    left: `${ox}px`,
                    top: `${oy}px`,
                    width: `${pw}px`,
                    height: `${ph}px`,
                });
            }
            if (towerImgRef.current) {
                Object.assign(towerImgRef.current.style, {
                    left: `${ox}px`,
                    top: `${oy}px`,
                    width: `${pw}px`,
                    height: `${ph}px`,
                });
            }
            if (heroVidRef.current) {
                Object.assign(heroVidRef.current.style, {
                    left: `${ox}px`,
                    top: `${oy + VIDEO_CROP_Y * sc}px`,
                    width: `${pw}px`,
                    height: `${VIDEO_CROP_H * sc}px`,
                });
            }
            if (skyRef.current) {
                Object.assign(skyRef.current.style, {
                    left: `${ox}px`,
                    top: `${oy - 0.6 * ph}px`,
                    width: `${pw}px`,
                    height: `${1.6 * ph}px`,
                });
            }
            if (roomLayerRef.current) {
                Object.assign(roomLayerRef.current.style, {
                    width: `${pw}px`,
                    height: `${ph}px`,
                });
            }

            // Build & Paragraph placement
            if (buildRef.current) {
                Object.assign(
                    buildRef.current.style,
                    phone
                        ? { left: `${20 * s}px`, top: `${navBottom + 20 * s}px` }
                        : { left: `${(W * 93) / 1418}px`, top: `${Math.max((H * 169) / 1012, navBottom + 24 * s)}px` }
                );
            }
            const buildBottom = buildRef.current
                ? buildRef.current.getBoundingClientRect().bottom
                : navBottom + 110 * s;

            if (paraRef.current) {
                if (phone) {
                    paraRef.current.classList.add('is-wrap');
                    Object.assign(paraRef.current.style, {
                        left: `${20 * s}px`,
                        right: `${20 * s}px`,
                        top: 'auto',
                        bottom: `${0.045 * H}px`,
                        width: 'auto',
                    });
                } else if (H < 620) {
                    paraRef.current.classList.add('is-wrap');
                    Object.assign(paraRef.current.style, {
                        left: 'auto',
                        right: `${(W * 68) / 1418}px`,
                        top: `${Math.max((H * 182) / 1012, navBottom + 24 * s)}px`,
                        bottom: 'auto',
                        width: `${0.4 * W}px`,
                    });
                } else {
                    paraRef.current.classList.remove('is-wrap');
                    Object.assign(paraRef.current.style, {
                        left: 'auto',
                        right: `${(W * 68) / 1418}px`,
                        top: `${Math.max((H * 182) / 1012, navBottom + 24 * s)}px`,
                        bottom: 'auto',
                        width: 'auto',
                    });
                }
            }

            // Canvas-measured Headline "RESUME" + Overlapping Script "Engineering"
            const scriptM = MeasureHeadlineMetrics('400 100px "Pinyon Script", cursive', 'Engineering');
            const wordM = MeasureHeadlineMetrics('330 100px "Outfit", sans-serif', 'RESUME');

            let wordW;
            let capH;
            let inkLeft;
            let capTop;

            const scriptTargetW = phone ? Math.min(W * 0.52, 260 * s) : Math.min((W * 406) / 1440, ((W * 1303) / 1440) * (406 / 1303));
            const scriptInkLeft = phone ? 20 * s : (W * 73) / 1440;
            const scriptFontSize = scriptM ? (100 * scriptTargetW) / scriptM.width : 60 * s;
            const scriptScale = scriptFontSize / 100;
            const scriptInkH = scriptM ? (scriptM.capAscent + scriptM.descent) * scriptScale : 80 * s;

            if (phone) {
                wordW = W - 40 * s;
                capH = (wordW * 150) / 1303;
                inkLeft = 20 * s;
                const scriptInkTop = buildBottom + 20 * s;
                capTop = scriptInkTop + scriptInkH * 1.04;
            } else {
                wordW = (W * 1303) / 1440;
                capH = Math.min(((150 * H) / 900) * 1.22, (wordW * 150) / 1303);
                wordW = Math.min(wordW, (capH * 1303) / 150 * 1.25);
                inkLeft = (W * 70) / 1440;
                capTop = (H * 446) / 900;
            }

            if (wordRef.current && wordM) {
                const fontSize = (100 * capH) / wordM.capAscent;
                const inkW = wordM.width * (fontSize / 100);
                const scaleX = wordW / inkW;
                const ascentScaled = wordM.ascent * (fontSize / 100);
                const descentScaled = wordM.descent * (fontSize / 100);
                const halfLead = (fontSize - (ascentScaled + descentScaled)) / 2;

                Object.assign(wordRef.current.style, {
                    fontSize: `${fontSize}px`,
                    left: `${inkLeft + wordM.leftOffset * scaleX}px`,
                    top: `${capTop - (halfLead + (ascentScaled - wordM.capAscent * (fontSize / 100)))}px`,
                    transform: `scaleX(${scaleX})`,
                });
            }

            if (scriptRef.current && scriptM) {
                const scriptAscent = scriptM.capAscent * scriptScale;
                const scriptTop = phone
                    ? buildBottom + 20 * s - scriptAscent * 0.15
                    : capTop - scriptInkH * 0.836;

                Object.assign(scriptRef.current.style, {
                    fontSize: `${scriptFontSize}px`,
                    left: `${scriptInkLeft + scriptM.leftOffset * scriptScale}px`,
                    top: `${scriptTop}px`,
                });
            }

            // Initialize card base width/compact class cleanly
            layout.cardPositions.forEach((pos, idx) => {
                const el = cardRefs.current[idx];
                if (!el) return;
                el.style.width = `${pos.width}px`;
                el.style.top = `${pos.y}px`;
                el.classList.toggle('is-compact', layout.cs < 0.8 && !phone);
            });
        };

        recalc();
        window.addEventListener('resize', recalc, { passive: true });
        document.fonts?.ready?.then(recalc);
        return () => window.removeEventListener('resize', recalc);
    }, []);

    // Track prefers-reduced-motion live
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!mq) return undefined;
        const onChange = () => setReducedMotion(mq.matches);
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);

    // Manage Hero harbor loop video playback state cleanly under reducedMotion
    useEffect(() => {
        const vid = heroVidRef.current;
        if (!vid) return;
        if (reducedMotion) {
            vid.pause();
            return;
        }
        vid.muted = true;
        vid.defaultMuted = true;
        vid.playsInline = true;
        const p = vid.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    }, [reducedMotion]);

    // Decode Hero plate + fonts -> start Intro Clock (3.5s failsafe), key #00FF00 green out of Room canvas, and run single RAF loop
    useEffect(() => {
        const eng = engineRef.current;
        let disposed = false;

        const startIntro = () => {
            if (eng.assetsReady || disposed) return;
            eng.assetsReady = true;
            eng.introStartMs = performance.now();
        };

        const heroImg = heroImgRef.current;
        const heroReadyPromise = new Promise((resolve) => {
            if (!heroImg) {
                resolve();
                return;
            }
            if (heroImg.complete && heroImg.naturalWidth > 0) {
                heroImg.decode?.().then(resolve).catch(resolve) || resolve();
            } else {
                heroImg.addEventListener('load', resolve, { once: true });
                heroImg.addEventListener('error', resolve, { once: true });
            }
        });

        Promise.all([heroReadyPromise, document.fonts?.ready || Promise.resolve()]).then(startIntro);
        const failsafe = setTimeout(startIntro, 3500);

        // Load room plate & run exact per-pixel chroma key into canvas#roomCv
        const roomImg = new Image();
        roomImg.crossOrigin = 'anonymous';
        roomImg.onload = () => {
            if (disposed || !roomCanvasRef.current) return;
            const canvas = roomCanvasRef.current;
            canvas.width = PLATE_W;
            canvas.height = PLATE_H;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;
            ctx.drawImage(roomImg, 0, 0, PLATE_W, PLATE_H);
            try {
                const imgData = ctx.getImageData(0, 0, PLATE_W, PLATE_H);
                const px = imgData.data;
                for (let i = 0; i < px.length; i += 4) {
                    const [nr, ng, nb, na] = chromaKeyRgbaPixel(px[i], px[i + 1], px[i + 2], px[i + 3]);
                    px[i] = nr;
                    px[i + 1] = ng;
                    px[i + 2] = nb;
                    px[i + 3] = na;
                }
                ctx.putImageData(imgData, 0, 0);
            } catch {
                // Canvas tainted fallback
            }
            eng.roomKeyed = true;
        };
        roomImg.src = RESUME_SKYLINE_ASSETS.roomPlateUrl;

        let lastNow = performance.now();
        let rafId = 0;

        const frame = (now) => {
            const dt = Math.min(0.1, Math.max(0.001, (now - lastNow) / 1000));
            lastNow = now;

            const layout = eng.layout;
            const storyEl = storyRef.current;
            if (layout && storyEl) {
                const { W, H, s, ox, oy, g, cardPositions } = layout;
                const storyTop = storyEl.getBoundingClientRect().top;
                const travel = Math.max(1, storyEl.offsetHeight - H);
                const pT = clamp(-storyTop / travel, 0, 1);

                if (reducedMotion) {
                    eng.pCur = pT;
                } else {
                    const alpha = 1 - Math.exp(-dt / 0.187);
                    eng.pCur += (pT - eng.pCur) * alpha;
                    if (Math.abs(pT - eng.pCur) < 1e-4) eng.pCur = pT;
                }

                const I = eng.assetsReady ? Math.max(0, (now - eng.introStartMs) / 1000) : 0;
                const intro = evaluateIntroTimeline(I, H, s, reducedMotion);
                const scr = evaluateScrollTimeline(eng.pCur, layout, reducedMotion);

                // View + Tower composite transform (maintains natural parallax into cropped window glass R)
                const viewTransform =
                    `translate3d(${scr.rcx}px, ${scr.rBottom}px, 0) scale(${scr.push}) ` +
                    `translate3d(${-scr.rcx}px, ${-scr.rBottom}px, 0) ` +
                    `translate3d(${scr.rcx}px, ${scr.rcy + intro.panY}px, 0) scale(${scr.kc * intro.panScale}) ` +
                    `translate3d(${-W / 2}px, ${-H / 2}px, 0)`;

                if (viewRef.current) viewRef.current.style.transform = viewTransform;
                if (towerRef.current) towerRef.current.style.transform = viewTransform;

                // Skyline separate rise on heroImg & video inside #view
                const viewScale = Math.max(0.001, scr.kc * intro.panScale * scr.push);
                const skyLocalY = (intro.skyOffsetH * H - intro.panY) / viewScale;
                if (heroImgRef.current) {
                    heroImgRef.current.style.transform = `translate3d(0, ${skyLocalY}px, 0)`;
                }
                if (heroVidRef.current) {
                    heroVidRef.current.style.transform = `translate3d(0, ${skyLocalY}px, 0)`;
                }

                // Typography layers (intro rise + scroll exit fade)
                if (headRef.current) {
                    headRef.current.style.transform = `translate3d(0, ${intro.headlineOffsetY + scr.headOutY}px, 0)`;
                    headRef.current.style.opacity = `${scr.headOutOpacity}`;
                }
                if (scriptRef.current) {
                    scriptRef.current.style.transform = `translate3d(0, ${intro.scriptOffsetY + scr.scriptOutY}px, 0)`;
                    scriptRef.current.style.opacity = `${scr.scriptOutOpacity}`;
                }

                const metaOp = intro.metaOpacity * scr.metaOutOpacity;
                const metaY = intro.metaOffsetY + scr.metaOutY;
                if (buildRef.current) {
                    buildRef.current.style.transform = `translate3d(0, ${metaY}px, 0)`;
                    buildRef.current.style.opacity = `${metaOp}`;
                    buildRef.current.style.pointerEvents = metaOp > 0.25 ? 'auto' : 'none';
                }
                if (paraRef.current) {
                    paraRef.current.style.transform = `translate3d(0, ${metaY}px, 0)`;
                    paraRef.current.style.opacity = `${metaOp}`;
                }
                if (shadeRef.current) {
                    shadeRef.current.style.opacity = layout.phone ? `${metaOp}` : '0';
                }

                // Indigo Room pull-back layer
                if (roomLayerRef.current) {
                    roomLayerRef.current.style.opacity = scr.roomVisible && eng.roomKeyed ? '1' : '0';
                    const roomTx = g.x - g.x * scr.S + ox * scr.S;
                    const roomTy = scr.gy - g.y * scr.S + oy * scr.S;
                    roomLayerRef.current.style.transform = `translate3d(${roomTx}px, ${roomTy}px, 0) scale(${scr.S})`;
                }

                // 4 Sliding Experience Role Cards
                cardPositions.forEach((pos, idx) => {
                    const cardEl = cardRefs.current[idx];
                    if (!cardEl) return;
                    const progress = scr.cardProgress[idx] ?? 0;
                    const offX = pos.side === 'left' ? -(pos.x + pos.width + 40) : W - pos.x + 40;
                    const curX = lerp(pos.x + offX, pos.x, progress);
                    cardEl.style.transform = `translate3d(${curX}px, 0, 0)`;
                    cardEl.style.opacity = progress > 0.01 ? '1' : '0';
                    cardEl.style.pointerEvents = progress > 0.85 ? 'auto' : 'none';
                });
            }

            rafId = requestAnimationFrame(frame);
        };

        rafId = requestAnimationFrame(frame);

        return () => {
            disposed = true;
            clearTimeout(failsafe);
            cancelAnimationFrame(rafId);
        };
    }, [reducedMotion]);

    const scrollToDossier = () => {
        dossierRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    const maskedHeroStyle = useMemo(
        () => ({
            maskImage: 'linear-gradient(to bottom, transparent 61%, #000 65.2%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 61%, #000 65.2%)',
        }),
        []
    );

    return (
        <div className="resume-skyline-root">
            {/* Part 1 & 2: Two-Part Sticky Spatial Skyline -> Room Pullback Stage */}
            <main id="resume-story" ref={storyRef} className="resume-story">
                <div ref={stageRef} className="resume-stage">
                    {/* 1. Back View Layer: Gradient Sky + Cropped Harbor Plate + Kling Loop Video */}
                    <div ref={viewRef} id="resume-view" className="resume-layer">
                        <div ref={skyRef} className="resume-sky" aria-hidden="true" />
                        <img
                            ref={heroImgRef}
                            id="resume-hero-img"
                            src={RESUME_SKYLINE_ASSETS.heroPlateUrl}
                            alt=""
                            crossOrigin="anonymous"
                            style={maskedHeroStyle}
                        />
                        <video
                            ref={heroVidRef}
                            id="resume-hero-vid"
                            className={!reducedMotion && videoPlaying ? 'on' : ''}
                            src={RESUME_SKYLINE_ASSETS.heroVideoUrl}
                            muted
                            loop
                            playsInline
                            preload="auto"
                            crossOrigin="anonymous"
                            aria-hidden="true"
                            style={maskedHeroStyle}
                            onPlaying={() => setVideoPlaying(true)}
                        />
                    </div>

                    {/* 2. Giant Display Headline ("RESUME" — passes behind tower mask) */}
                    <div ref={headRef} id="resume-head" className="resume-layer">
                        <span ref={wordRef} id="resume-word">
                            RESUME
                        </span>
                    </div>

                    {/* 3. Foreground Tower Silhouette Slice */}
                    <div ref={towerRef} id="resume-tower" className="resume-layer" aria-hidden="true">
                        <img
                            ref={towerImgRef}
                            src={RESUME_SKYLINE_ASSETS.heroPlateUrl}
                            alt=""
                            crossOrigin="anonymous"
                            style={{
                                maskImage: TOWER_MASK_SVG,
                                WebkitMaskImage: TOWER_MASK_SVG,
                                maskSize: '100% 100%',
                                WebkitMaskSize: '100% 100%',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                            }}
                        />
                    </div>

                    {/* 4. Overlapping Pinyon Script Lead ("Engineering" — always in front of tower) */}
                    <span ref={scriptRef} id="resume-script" className="resume-layer">
                        Engineering
                    </span>

                    {/* 5. Portrait Bottom Scrim */}
                    <div ref={shadeRef} className="resume-shade" aria-hidden="true" />

                    {/* 6. Indigo Room Window Cutout Canvas + Side Extensions */}
                    <div ref={roomLayerRef} id="resume-room" className="resume-layer">
                        <span className="resume-room-ext left" aria-hidden="true" />
                        <span className="resume-room-ext right" aria-hidden="true" />
                        <canvas ref={roomCanvasRef} id="resume-room-cv" />
                    </div>

                    {/* 7. Left "Full-Stack Architect." Thumbnail Action Block */}
                    <button
                        ref={buildRef}
                        id="resume-build"
                        type="button"
                        className="resume-layer resume-build-btn"
                        onClick={scrollToDossier}
                        aria-label="Jump to full Curriculum Vitae details"
                    >
                        <div
                            className="resume-build-thumb"
                            style={{ backgroundImage: `url(${elevatexImg})` }}
                        >
                            <span className="resume-play-badge" aria-hidden="true">
                                <Play size={14} fill="#060709" color="#060709" />
                            </span>
                        </div>
                        <span className="resume-build-title">
                            Full-Stack
                            <br />
                            Architect.
                        </span>
                    </button>

                    {/* 8. Right 4-Line Architectural Bio Paragraph */}
                    <p ref={paraRef} id="resume-para" className="resume-layer">
                        <span>Computer Science undergraduate at BMS College of Engineering </span>
                        <span>shipping resilient mobile and web platforms from Bengaluru. </span>
                        <span>Combining offline-first storage, real-time sockets, and AI </span>
                        <span>failover systems across production builds. Scroll to enter.</span>
                    </p>

                    {/* 9. Four Sliding Experience Role Cards Around Window Frame */}
                    {RESUME_ROLE_CARDS.map((card, idx) => (
                        <article
                            key={card.slug}
                            ref={(el) => {
                                cardRefs.current[idx] = el;
                            }}
                            className="resume-role-card"
                            onClick={() => navigate(`/projects/${card.slug}`)}
                        >
                            <div
                                className="resume-card-photo"
                                style={{ backgroundImage: `url(${card.img})` }}
                            />
                            <div className="resume-card-text-row">
                                <div className="resume-card-titles">
                                    <strong>{card.title}</strong>
                                    <span>{card.subtitle}</span>
                                </div>
                                <div className="resume-card-year">{card.year}</div>
                            </div>
                            <div className="resume-card-specs">
                                <span>
                                    <Cpu size={13} strokeWidth={1.7} />
                                    {card.specs[0]}
                                </span>
                                <span>
                                    <Layers size={13} strokeWidth={1.7} />
                                    {card.specs[1]}
                                </span>
                                <span>
                                    <Globe size={13} strokeWidth={1.7} />
                                    {card.specs[2]}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            {/* Full Structured Curriculum Vitae Dossier Below Sticky Pull-Back */}
            <section ref={dossierRef} id="resume-dossier" className="resume-dossier-section">
                <div className="resume-dossier-container">
                    <div className="resume-dossier-header">
                        <span className="editorial-eyebrow-text">CAREER TRACK &amp; PEDIGREE</span>
                        <h2 className="editorial-section-title">
                            EXPERIENCE, EDUCATION &amp; <span>CREDENTIALS</span>
                        </h2>
                        <p>
                            Complete production history, B.E. CSE records at BMS College of Engineering, and industry certifications.
                        </p>
                    </div>

                    {/* Experience List */}
                    <div className="resume-dossier-block">
                        <div className="resume-block-title">
                            <Briefcase size={18} />
                            <h3>PRODUCTION EXPERIENCE</h3>
                        </div>

                        <div className="resume-exp-grid">
                            {experience.map((job, idx) => (
                                <Motion.div
                                    key={job.company}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ duration: 0.45, delay: idx * 0.06 }}
                                >
                                    <LiquidGlass
                                        as="article"
                                        className="resume-dossier-card"
                                        radius={18}
                                        bevelDepth={14}
                                        scale={26}
                                        aberration={3}
                                        frost={0.4}
                                        tint={0.04}
                                        tintRgb="10 14 28"
                                    >
                                        <div className="resume-card-head">
                                            <div>
                                                <h4>{job.role}</h4>
                                                <strong>{job.company}</strong>
                                            </div>
                                            <span className="resume-duration-pill">
                                                <Calendar size={12} />
                                                {job.duration}
                                            </span>
                                        </div>
                                        <p>{job.description}</p>
                                        {job.highlights && (
                                            <div className="editorial-badge-group">
                                                {job.highlights.map((h) => (
                                                    <span key={h} className="editorial-badge">
                                                        {h}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </LiquidGlass>
                                </Motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Education & Honors Grid */}
                    <div className="resume-dossier-two-col">
                        <div className="resume-dossier-block">
                            <div className="resume-block-title">
                                <GraduationCap size={18} />
                                <h3>ACADEMIC QUALIFICATIONS</h3>
                            </div>

                            <div className="resume-edu-list">
                                {education.map((edu) => (
                                    <LiquidGlass
                                        key={edu.degree}
                                        className="resume-dossier-card"
                                        radius={18}
                                        bevelDepth={14}
                                        scale={24}
                                        aberration={3}
                                        frost={0.4}
                                        tint={0.04}
                                        tintRgb="10 14 28"
                                    >
                                        <h4>{edu.degree}</h4>
                                        <strong>{edu.institution}</strong>
                                        <span className="resume-duration-pill">
                                            <Calendar size={12} /> {edu.duration || edu.year} · <MapPin size={12} />{' '}
                                            Bengaluru
                                        </span>
                                        <p>{edu.description || edu.desc}</p>
                                    </LiquidGlass>
                                ))}
                            </div>
                        </div>

                        <div className="resume-dossier-block">
                            <div className="resume-block-title">
                                <Award size={18} />
                                <h3>ACHIEVEMENTS &amp; CERTIFICATIONS</h3>
                            </div>

                            <LiquidGlass
                                className="resume-dossier-card"
                                radius={18}
                                bevelDepth={14}
                                scale={24}
                                aberration={3}
                                frost={0.4}
                                tint={0.04}
                                tintRgb="10 14 28"
                            >
                                <span className="resume-sub-heading">ACADEMIC &amp; BUILDER HONORS</span>
                                <ul className="resume-bullet-list">
                                    {achievements.map((item) => (
                                        <li key={item}>
                                            <ChevronRight size={14} />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <span className="resume-sub-heading" style={{ marginTop: '20px' }}>
                                    VERIFIED CERTIFICATIONS
                                </span>
                                <ul className="resume-bullet-list">
                                    {certifications.map((cert) => (
                                        <li key={cert.name}>
                                            <ChevronRight size={14} />
                                            <div className="resume-cert-row">
                                                {cert.link ? (
                                                    <a href={cert.link} target="_blank" rel="noreferrer">
                                                        <span>{cert.name}</span>
                                                        <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span>{cert.name}</span>
                                                )}
                                                <small>
                                                    {cert.issuer} ({cert.year})
                                                </small>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </LiquidGlass>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Resume;
