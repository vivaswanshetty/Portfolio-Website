import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { buildVhsArchiveAtlas } from '../utils/vhsArchiveAtlas';
import {
    ARCHIVE_ITEM_COUNT,
    ARCHIVE_TOTAL_TAPES,
    COVER_CELL_BOXES,
    COVERS_SHEET_H,
    COVERS_SHEET_W,
    INK_BLOT_CIRCLES,
    INITIAL_SCROLL_SLOT,
    SPINE_CELL_BOXES,
    SPINES_SHEET_H,
    SPINES_SHEET_W,
    TIMELINE_MAX_YEAR,
    TIMELINE_MIN_YEAR,
    TIMELINE_SPAN,
    VHS_ARCHIVE_ITEMS,
    buildXScreenTable,
    clamp,
    computeDetailClipInset,
    computeSheetCropBackground,
    computeSvgPosterPlacement,
    computeTapeDimensions,
    computeTapePose,
    evaluateTimelineTargetYear,
    normalizeRelIndex,
    resolveShortestTapeTarget,
    smoothstep01,
} from '../utils/vhsArchiveMath';

const TIMELINE_TICKS = Array.from({ length: 17 }, (_, idx) => {
    const year = TIMELINE_MIN_YEAR + idx * 0.25;
    return {
        year,
        major: idx % 4 === 0,
        label: idx % 4 === 0 ? String(year) : null,
        pct: ((year - TIMELINE_MIN_YEAR) / TIMELINE_SPAN) * 100,
    };
});

/**
 * Slides a text span cleanly into an overflow mask line with Web Animations API
 * without opacity crossfades, removing superseded spans once slid out.
 */
function swapMaskSpan(container, text, dir, reducedMotion) {
    if (!container) return;
    const oldSpans = Array.from(container.children);
    const nextSpan = document.createElement('span');
    nextSpan.className = 'vhs-mask-line';
    nextSpan.textContent = text;
    container.appendChild(nextSpan);

    if (reducedMotion || typeof nextSpan.animate !== 'function') {
        oldSpans.forEach((s) => s.remove());
        return;
    }

    const enterY = `${(dir >= 0 ? 1 : -1) * 105}%`;
    const exitY = `${(dir >= 0 ? -1 : 1) * 105}%`;

    nextSpan.animate(
        [
            { transform: `translateY(${enterY})` },
            { transform: 'translateY(0%)' },
        ],
        { duration: 650, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' }
    );

    oldSpans.forEach((old) => {
        const computed = getComputedStyle(old).transform;
        const startTransform = computed && computed !== 'none' ? computed : 'translateY(0%)';
        const anim = old.animate(
            [
                { transform: startTransform },
                { transform: `translateY(${exitY})` },
            ],
            { duration: 650, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' }
        );
        anim.onfinish = () => old.remove();
        anim.oncancel = () => old.remove();
    });
}

const VhsArchiveSection = () => {
    const navigate = useNavigate();
    const uid = useId().replace(/:/g, '');
    const inkFilterId = `vhs-ink-${uid}`;
    const posterMaskId = `vhs-mask-${uid}`;
    const grainFilterId = `vhs-grain-${uid}`;

    const sectionRef = useRef(null);
    const probeRef = useRef(null);
    const playRef = useRef(null);
    const titleMaskRef = useRef(null);
    const subMaskRef = useRef(null);
    const metaMaskRef = useRef(null);
    const timelineDotRef = useRef(null);
    const timelineRef = useRef(null);
    const cursorRef = useRef(null);
    const detailRef = useRef(null);
    const detailTextRefs = useRef([]);
    const inkCircleRefs = useRef([]);

    const tapeRefs = useRef([]);
    const spineShadeRefs = useRef([]);
    const coverShadeRefs = useRef([]);
    const coverFaceRefs = useRef([]);

    const [atlasUrls, setAtlasUrls] = useState({ coversUrl: '', spinesUrl: '' });
    const [activeModState, setActiveModState] = useState(INITIAL_SCROLL_SLOT % ARCHIVE_ITEM_COUNT);
    const [detailItem, setDetailItem] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const [reducedMotion, setReducedMotion] = useState(() =>
        typeof window !== 'undefined'
            ? Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
            : false
    );

    const simRef = useRef({
        s: INITIAL_SCROLL_SLOT,
        T: INITIAL_SCROLL_SLOT,
        activeMod: ((INITIAL_SCROLL_SLOT % ARCHIVE_ITEM_COUNT) + ARCHIVE_ITEM_COUNT) % ARCHIVE_ITEM_COUNT,
        lifts: new Float32Array(ARCHIVE_TOTAL_TAPES),
        hoveredTape: -1,
        dragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragStartT: INITIAL_SCROLL_SLOT,
        didDrag: false,
        wheelSnapTimer: null,
        tiltX: 0,
        tiltY: 0,
        pointerInside: false,
        mx: 0,
        my: 0,
        cursorX: 0,
        cursorY: 0,
        cursorInit: false,
        cursorState: '',
        timelineYear: VHS_ARCHIVE_ITEMS[INITIAL_SCROLL_SLOT % ARCHIVE_ITEM_COUNT].year,
        inView: true,
        detailOpen: false,
        isPhone: false,
        dims: computeTapeDimensions(360, 1440),
        xTable: buildXScreenTable(360 * 1.3),
        stageW: 1440,
        stageH: 820,
        cyPx: 336,
        detailAnims: [],
        detailOpeningBusy: false,
    });

    // Listen to OS reduced-motion preference
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!mq) return undefined;
        const onChange = () => setReducedMotion(mq.matches);
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);

    // Synthesize procedural covers (4x3) and spines (12x1) sprites with progressive WebP enrichment
    useEffect(() => {
        return buildVhsArchiveAtlas((urls) => setAtlasUrls(urls));
    }, []);

    // Precompute CSS background crop metrics for all 12 covers & 12 spines
    const itemStyles = useMemo(() => {
        return VHS_ARCHIVE_ITEMS.map((item, idx) => {
            const coverCrop = computeSheetCropBackground(
                COVERS_SHEET_W,
                COVERS_SHEET_H,
                COVER_CELL_BOXES[idx]
            );
            const spineCrop = computeSheetCropBackground(
                SPINES_SHEET_W,
                SPINES_SHEET_H,
                SPINE_CELL_BOXES[idx]
            );
            const svgPlacement = computeSvgPosterPlacement(
                COVERS_SHEET_W,
                COVERS_SHEET_H,
                COVER_CELL_BOXES[idx]
            );
            return { coverCrop, spineCrop, svgPlacement, item };
        });
    }, []);

    // Initialize initial caption spans once
    useEffect(() => {
        const initial = VHS_ARCHIVE_ITEMS[INITIAL_SCROLL_SLOT % ARCHIVE_ITEM_COUNT];
        swapMaskSpan(titleMaskRef.current, initial.title, 1, true);
        swapMaskSpan(subMaskRef.current, `${initial.romaji} / ${initial.kanji}`, 1, true);
        swapMaskSpan(metaMaskRef.current, `${initial.displayYear} — ${initial.category}`, 1, true);
    }, []);

    const getCenterVirtualSlot = useCallback(() => {
        const sim = simRef.current;
        const roundS = Math.round(sim.s);
        let bestV = -1;
        let bestDist = Infinity;
        for (let v = 0; v < ARCHIVE_TOTAL_TAPES; v++) {
            const r = normalizeRelIndex(v, roundS);
            if (Math.abs(r) < bestDist) {
                bestDist = Math.abs(r);
                bestV = v;
            }
        }
        return bestV;
    }, []);

    const getActiveCoverRect = useCallback(() => {
        const v = getCenterVirtualSlot();
        const coverEl = v >= 0 ? coverFaceRefs.current[v] : null;
        if (coverEl) {
            const rect = coverEl.getBoundingClientRect();
            if (rect.width > 12 && rect.height > 12) return rect;
        }
        const sim = simRef.current;
        const secRect = sectionRef.current?.getBoundingClientRect();
        const cx = secRect ? secRect.left + sim.stageW / 2 : window.innerWidth / 2;
        const cy = secRect ? secRect.top + sim.cyPx : window.innerHeight * 0.45;
        return {
            left: cx - sim.dims.d / 2,
            right: cx + sim.dims.d / 2,
            top: cy - sim.dims.H / 2,
            bottom: cy + sim.dims.H / 2,
            width: sim.dims.d,
            height: sim.dims.H,
        };
    }, [getCenterVirtualSlot]);

    const cancelDetailAnimations = useCallback(() => {
        const sim = simRef.current;
        sim.detailAnims.forEach((a) => {
            try {
                a.cancel();
            } catch {
                // ignore cancelled animation errors
            }
        });
        sim.detailAnims = [];
    }, []);

    const openDetailSheet = useCallback(() => {
        const sim = simRef.current;
        if (sim.detailOpen || sim.detailOpeningBusy) return;
        sim.T = Math.round(sim.T);
        sim.s = sim.T;
        const activeIdx = ((Math.round(sim.s) % ARCHIVE_ITEM_COUNT) + ARCHIVE_ITEM_COUNT) % ARCHIVE_ITEM_COUNT;
        const chosen = VHS_ARCHIVE_ITEMS[activeIdx];
        sim.detailOpen = true;
        sim.detailOpeningBusy = true;
        setDetailItem(chosen);
        setDetailOpen(true);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const sheetEl = detailRef.current;
                if (!sheetEl) {
                    sim.detailOpeningBusy = false;
                    return;
                }
                cancelDetailAnimations();

                const rect = getActiveCoverRect();
                const startClip = computeDetailClipInset(rect, window.innerWidth, window.innerHeight);
                const endClip = 'inset(0px 0px 0px 0px round 0px)';
                const instant = reducedMotion;

                const sheetAnim = sheetEl.animate(
                    [{ clipPath: startClip }, { clipPath: endClip }],
                    {
                        duration: instant ? 1 : 1050,
                        easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
                        fill: 'both',
                    }
                );
                sim.detailAnims.push(sheetAnim);

                detailTextRefs.current.forEach((el, i) => {
                    if (!el || typeof el.animate !== 'function') return;
                    const textAnim = el.animate(
                        [{ transform: 'translateY(110%)' }, { transform: 'translateY(0%)' }],
                        {
                            duration: instant ? 1 : 900,
                            delay: instant ? 0 : 620 + i * 75,
                            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                            fill: 'both',
                        }
                    );
                    sim.detailAnims.push(textAnim);
                });

                inkCircleRefs.current.forEach((circleEl, idx) => {
                    const spec = INK_BLOT_CIRCLES[idx];
                    if (!circleEl || !spec || typeof circleEl.animate !== 'function') return;
                    circleEl.setAttribute('r', instant ? '720' : '0');
                    const blotAnim = circleEl.animate([{ r: 0 }, { r: 720 }], {
                        duration: instant ? 1 : 1250,
                        delay: instant ? 0 : 520 + spec.delayMs,
                        easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
                        fill: 'both',
                    });
                    if (instant) {
                        blotAnim.currentTime = 5000;
                    }
                    sim.detailAnims.push(blotAnim);
                });

                sim.detailOpeningBusy = false;
            });
        });
    }, [cancelDetailAnimations, getActiveCoverRect, reducedMotion]);

    const closeDetailSheet = useCallback(
        (onClosed) => {
            const sim = simRef.current;
            const sheetEl = detailRef.current;
            if (!sim.detailOpen) return;

            if (!sheetEl || typeof sheetEl.animate !== 'function') {
                cancelDetailAnimations();
                sim.detailOpen = false;
                setDetailOpen(false);
                if (typeof onClosed === 'function') onClosed();
                return;
            }

            cancelDetailAnimations();
            const rect = getActiveCoverRect();
            const targetClip = computeDetailClipInset(rect, window.innerWidth, window.innerHeight);

            const closeAnim = sheetEl.animate(
                [{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: targetClip }],
                {
                    duration: reducedMotion ? 1 : 850,
                    easing: 'cubic-bezier(0.76, 0, 0.18, 1)',
                    fill: 'both',
                }
            );
            sim.detailAnims.push(closeAnim);

            const finish = () => {
                cancelDetailAnimations();
                sim.detailOpen = false;
                setDetailOpen(false);
                if (typeof onClosed === 'function') onClosed();
            };
            closeAnim.onfinish = finish;
            closeAnim.oncancel = finish;
        },
        [cancelDetailAnimations, getActiveCoverRect, reducedMotion]
    );

    const stepShelf = useCallback((delta) => {
        const sim = simRef.current;
        if (sim.detailOpen) return;
        sim.T = Math.round(sim.T + delta);
    }, []);

    const handleTimelineClick = useCallback((e) => {
        const sim = simRef.current;
        if (sim.detailOpen || !timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        if (rect.width <= 0) return;
        const frac = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        const clickedYear = TIMELINE_MIN_YEAR + frac * TIMELINE_SPAN;

        let bestIdx = 0;
        let bestDist = Infinity;
        VHS_ARCHIVE_ITEMS.forEach((item, idx) => {
            const diff = Math.abs(item.year - clickedYear);
            if (diff < bestDist) {
                bestDist = diff;
                bestIdx = idx;
            }
        });
        sim.T = resolveShortestTapeTarget(sim.T, bestIdx);
    }, []);

    // Measure stage dimensions & probe tape height H on mount / resize
    useEffect(() => {
        const measure = () => {
            const sec = sectionRef.current;
            const probe = probeRef.current;
            if (!sec || !probe) return;
            const W = sec.clientWidth || window.innerWidth;
            const H = sec.clientHeight || window.innerHeight;
            const tapeH = probe.offsetHeight || Math.min(390, H * 0.42);
            const dims = computeTapeDimensions(tapeH, window.innerWidth);
            const sim = simRef.current;
            sim.stageW = W;
            sim.stageH = H;
            sim.dims = dims;
            sim.xTable = buildXScreenTable(dims.U);
            sim.isPhone = window.innerWidth <= 767;
            sim.cyPx = (sim.isPhone ? 0.4 : 0.41) * H;

            // Size face boxes directly from measured dims (W = ws or d, H = tapeH)
            for (let v = 0; v < ARCHIVE_TOTAL_TAPES; v++) {
                const el = tapeRefs.current[v];
                if (!el) continue;
                const sp = el.firstElementChild;
                const cv = sp?.nextElementSibling;
                if (sp) {
                    sp.style.width = `${dims.ws.toFixed(2)}px`;
                    sp.style.height = `${dims.H.toFixed(2)}px`;
                    sp.style.left = `${(-dims.ws / 2).toFixed(2)}px`;
                    sp.style.top = `${(-dims.H / 2).toFixed(2)}px`;
                    sp.style.transform = `translateZ(${(dims.d / 2).toFixed(2)}px)`;
                }
                if (cv) {
                    cv.style.width = `${dims.d.toFixed(2)}px`;
                    cv.style.height = `${dims.H.toFixed(2)}px`;
                    cv.style.left = `${(-dims.d / 2).toFixed(2)}px`;
                    cv.style.top = `${(-dims.H / 2).toFixed(2)}px`;
                    cv.style.transform = `rotateY(90deg) translateZ(${(dims.ws / 2).toFixed(2)}px)`;
                }
            }
        };

        measure();
        const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
        if (sectionRef.current && ro) ro.observe(sectionRef.current);
        window.addEventListener('resize', measure, { passive: true });
        return () => {
            ro?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    // Intersection observer so rAF idles when section is offscreen
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || typeof IntersectionObserver !== 'function') return undefined;
        const io = new IntersectionObserver(
            ([entry]) => {
                simRef.current.inView = Boolean(entry?.isIntersecting);
            },
            { rootMargin: '220px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Keyboard controls (Left/Right arrows, Enter, Escape)
    useEffect(() => {
        const onKeyDown = (e) => {
            const sim = simRef.current;
            if (e.key === 'Escape' && sim.detailOpen) {
                e.preventDefault();
                closeDetailSheet();
                return;
            }
            if (!sim.inView || sim.detailOpen) return;
            const tag = e.target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                stepShelf(1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                stepShelf(-1);
            } else if (e.key === 'Enter' && (sim.pointerInside || document.activeElement === sectionRef.current)) {
                e.preventDefault();
                openDetailSheet();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [closeDetailSheet, openDetailSheet, stepShelf]);

    // Lock body scroll cleanly while full-screen Detail Sheet is open
    useEffect(() => {
        if (!detailOpen) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [detailOpen]);

    // Scoped pointer + custom cursor tracking across section and portal detail sheet
    useEffect(() => {
        const finePointer = window.matchMedia?.('(pointer: fine)')?.matches;
        const onMove = (e) => {
            const sim = simRef.current;
            sim.mx = e.clientX;
            sim.my = e.clientY;
            if (!sim.cursorInit) {
                sim.cursorX = e.clientX;
                sim.cursorY = e.clientY;
                sim.cursorInit = true;
            }

            const target = e.target;
            if (!sim.detailOpen && target?.closest?.('.navbar-main, .cyberdrone-root')) {
                sim.pointerInside = false;
                sim.cursorState = '';
                return;
            }

            if (sim.detailOpen) {
                sim.pointerInside = true;
            } else if (sectionRef.current) {
                const r = sectionRef.current.getBoundingClientRect();
                sim.pointerInside =
                    e.clientX >= r.left &&
                    e.clientX <= r.right &&
                    e.clientY >= r.top &&
                    e.clientY <= r.bottom;
            }

            if (!finePointer) return;
            if (target?.closest?.('button, a, [data-vhs-btn], [data-vhs-timeline]')) {
                sim.cursorState = 'btn';
            } else if (!sim.detailOpen && target?.closest?.('.vhs-tape')) {
                const secRect = sectionRef.current?.getBoundingClientRect();
                const stageCx = secRect ? secRect.left + sim.stageW / 2 : window.innerWidth / 2;
                const stageCy = secRect ? secRect.top + sim.cyPx : window.innerHeight * 0.41;
                const onCenterCover =
                    Math.abs(e.clientX - stageCx) <= 0.55 * sim.dims.d &&
                    Math.abs(e.clientY - stageCy) <= 0.55 * sim.dims.H &&
                    Math.abs(sim.T - sim.s) < 0.3;
                sim.cursorState = onCenterCover ? 'open' : 'spine';
            } else {
                sim.cursorState = '';
            }
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    // Global drag / wheel release listeners while scrubbing
    useEffect(() => {
        const onPointerMove = (e) => {
            const sim = simRef.current;
            if (!sim.dragging) return;
            const dx = e.clientX - sim.dragStartX;
            const dy = e.clientY - sim.dragStartY;
            if (!sim.didDrag && Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) {
                sim.didDrag = true;
            }
            if (sim.didDrag) {
                const pitch = sim.dims.ws + sim.dims.gap;
                sim.T = sim.dragStartT - dx / Math.max(24, pitch);
            }
        };

        const onPointerUp = () => {
            const sim = simRef.current;
            if (!sim.dragging) return;
            sim.dragging = false;
            if (sim.didDrag) {
                sim.T = Math.round(sim.T);
            }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerup', onPointerUp, { passive: true });
        window.addEventListener('pointercancel', onPointerUp, { passive: true });
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
        };
    }, []);

    // Unified single rAF simulation loop driving 3D tapes, tilt, hover lift, caption swap, play ring, dot & cursor
    useEffect(() => {
        let rafId = null;
        let lastTime = 0;

        const tick = (now) => {
            const sim = simRef.current;
            const dt = lastTime ? Math.min(0.05, Math.max(0, (now - lastTime) / 1000)) : 0.016;
            lastTime = now;

            if (sim.inView || sim.detailOpen) {
                // 1. Damped shelf spring
                if (reducedMotion) {
                    sim.s = sim.T;
                } else {
                    const kSpring = sim.dragging ? 18 : 5.2;
                    sim.s += (sim.T - sim.s) * (1 - Math.exp(-kSpring * dt));
                    if (Math.abs(sim.T - sim.s) < 0.0004 && !sim.dragging) {
                        sim.s = sim.T;
                    }
                }

                // Re-center modulo 12 copies after +/- 4 loops
                if (Math.abs(sim.s) > ARCHIVE_ITEM_COUNT * 4) {
                    const shift = Math.trunc(sim.s / ARCHIVE_ITEM_COUNT) * ARCHIVE_ITEM_COUNT;
                    sim.s -= shift;
                    sim.T -= shift;
                    sim.dragStartT -= shift;
                }

                // 2. Active index check & caption mask swap
                const nextMod =
                    ((Math.round(sim.s) % ARCHIVE_ITEM_COUNT) + ARCHIVE_ITEM_COUNT) % ARCHIVE_ITEM_COUNT;
                if (nextMod !== sim.activeMod) {
                    const dir = Math.sign(sim.T - sim.s) || 1;
                    sim.activeMod = nextMod;
                    const item = VHS_ARCHIVE_ITEMS[nextMod];
                    swapMaskSpan(titleMaskRef.current, item.title, dir, reducedMotion);
                    swapMaskSpan(subMaskRef.current, `${item.romaji} / ${item.kanji}`, dir, reducedMotion);
                    swapMaskSpan(metaMaskRef.current, `${item.displayYear} — ${item.category}`, dir, reducedMotion);
                    setActiveModState(nextMod);
                }

                // 3. Cover pointer tilt targets & fresh bounds check across window scroll
                const secRect = sectionRef.current?.getBoundingClientRect();
                if (!sim.detailOpen && secRect && sim.cursorInit) {
                    const overGlobalUi = document.elementFromPoint(sim.mx, sim.my)?.closest?.('.navbar-main, .cyberdrone-root');
                    sim.pointerInside =
                        !overGlobalUi &&
                        sim.mx >= secRect.left &&
                        sim.mx <= secRect.right &&
                        sim.my >= secRect.top &&
                        sim.my <= secRect.bottom;
                }
                const stageCx = secRect ? secRect.left + sim.stageW / 2 : window.innerWidth / 2;
                const stageCy = secRect ? secRect.top + sim.cyPx : window.innerHeight * 0.41;
                const settled = Math.abs(sim.T - sim.s) < 0.3;
                const onCover =
                    sim.pointerInside &&
                    !sim.detailOpen &&
                    settled &&
                    Math.abs(sim.mx - stageCx) <= 0.55 * sim.dims.d &&
                    Math.abs(sim.my - stageCy) <= 0.55 * sim.dims.H;

                let targetTiltY = 0;
                let targetTiltX = 0;
                if (onCover) {
                    targetTiltY = ((sim.mx - stageCx) / Math.max(1, 0.55 * sim.dims.d)) * 8;
                    targetTiltX = -((sim.my - stageCy) / Math.max(1, 0.5 * sim.dims.H)) * 5;
                } else if (sim.pointerInside && !sim.detailOpen) {
                    targetTiltY = ((sim.mx - stageCx) / Math.max(1, sim.stageW)) * 4;
                    targetTiltX = 0;
                }
                const tiltLerp = reducedMotion ? 1 : 1 - Math.exp(-7 * dt);
                sim.tiltX += (targetTiltX - sim.tiltX) * tiltLerp;
                sim.tiltY += (targetTiltY - sim.tiltY) * tiltLerp;

                // Refresh settled cursor open state cleanly as spring comes to rest
                if (sim.pointerInside && !sim.detailOpen && sim.cursorState !== 'btn') {
                    if (onCover) sim.cursorState = 'open';
                    else if (sim.hoveredTape >= 0) sim.cursorState = 'spine';
                }

                // 4. Position all 36 virtual VHS tapes along curved bowl
                const liftRate = reducedMotion ? 1 : 1 - Math.exp(-12 * dt);
                for (let v = 0; v < ARCHIVE_TOTAL_TAPES; v++) {
                    const el = tapeRefs.current[v];
                    if (!el) continue;

                    const r = normalizeRelIndex(v, sim.s);
                    const targetLift = sim.hoveredTape === v && Math.abs(r) > 0.5 && !sim.detailOpen ? 1 : 0;
                    sim.lifts[v] += (targetLift - sim.lifts[v]) * liftRate;

                    const pose = computeTapePose(
                        r,
                        sim.lifts[v],
                        sim.tiltX,
                        sim.tiltY,
                        sim.dims,
                        sim.xTable
                    );

                    if (!pose.visible) {
                        el.style.display = 'none';
                        continue;
                    }
                    el.style.display = 'block';
                    el.style.zIndex = `${pose.zIndex}`;
                    el.style.transform = `translate3d(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px, ${pose.z.toFixed(2)}px) rotateX(${pose.rotX.toFixed(2)}deg) rotateY(${pose.rotY.toFixed(2)}deg)`;

                    const spOverlay = spineShadeRefs.current[v];
                    if (spOverlay) {
                        spOverlay.style.setProperty('--vhs-shade', pose.spineShade.toFixed(3));
                    }
                    const cvOverlay = coverShadeRefs.current[v];
                    if (cvOverlay) {
                        cvOverlay.style.setProperty('--vhs-shade', pose.coverShade.toFixed(3));
                    }
                }

                // 5. Play / Inspect button anchor at bottom-left corner of center cover
                if (playRef.current) {
                    const playScale = sim.detailOpen
                        ? 0
                        : smoothstep01(Math.max(0, 1 - Math.abs(sim.T - sim.s) * 3));
                    const playLeft = sim.stageW / 2 - sim.dims.d / 2 - 6;
                    const playTop = sim.cyPx + 0.36 * sim.dims.H;
                    playRef.current.style.left = `${playLeft.toFixed(1)}px`;
                    playRef.current.style.top = `${playTop.toFixed(1)}px`;
                    playRef.current.style.transform = `translate(-50%, -50%) scale(${playScale.toFixed(3)})`;
                    playRef.current.style.pointerEvents = playScale > 0.35 ? 'auto' : 'none';
                }

                // 6. Timeline dot glide (jumps if > 1.6 yrs away or under reduced motion)
                if (timelineDotRef.current) {
                    const targetYear = evaluateTimelineTargetYear(sim.s);
                    if (reducedMotion || Math.abs(targetYear - sim.timelineYear) > 1.6) {
                        sim.timelineYear = targetYear;
                    } else {
                        sim.timelineYear += (targetYear - sim.timelineYear) * (1 - Math.exp(-14 * dt));
                    }
                    const pct = clamp(
                        ((sim.timelineYear - TIMELINE_MIN_YEAR) / TIMELINE_SPAN) * 100,
                        0,
                        100
                    );
                    timelineDotRef.current.style.left = `${pct.toFixed(3)}%`;
                }

                // 7. Scoped desktop pointer cursor smoothing
                if (cursorRef.current) {
                    const cur = cursorRef.current;
                    if (!sim.pointerInside || !sim.cursorInit) {
                        cur.style.opacity = '0';
                    } else {
                        cur.style.opacity = '1';
                        const cRate = reducedMotion ? 1 : 1 - Math.exp(-16 * dt);
                        sim.cursorX += (sim.mx - sim.cursorX) * cRate;
                        sim.cursorY += (sim.my - sim.cursorY) * cRate;
                        cur.style.transform = `translate3d(${sim.cursorX.toFixed(1)}px, ${sim.cursorY.toFixed(1)}px, 0) translate(-50%, -50%)`;
                        cur.classList.toggle('is-open', sim.cursorState === 'open');
                        cur.classList.toggle('is-spine', sim.cursorState === 'spine');
                        cur.classList.toggle('is-btn', sim.cursorState === 'btn');
                    }
                }
            } else if (cursorRef.current) {
                sim.pointerInside = false;
                cursorRef.current.style.opacity = '0';
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [reducedMotion]);

    // Horizontal trackpad wheel / Shift+Wheel scrubber (leaves plain vertical page wheel free!)
    const handleWheel = useCallback((e) => {
        const sim = simRef.current;
        if (sim.detailOpen) return;
        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);
        const horizontalIntent = absX > absY * 1.15 || e.shiftKey;
        if (!horizontalIntent) return;

        e.preventDefault();
        const delta = absX >= absY ? e.deltaX : e.deltaY;
        const pitch = sim.dims.ws + sim.dims.gap;
        sim.T += (delta / Math.max(24, pitch)) * 0.5;

        if (sim.wheelSnapTimer) clearTimeout(sim.wheelSnapTimer);
        sim.wheelSnapTimer = setTimeout(() => {
            sim.T = Math.round(sim.T);
        }, 160);
    }, []);

    const handleShelfPointerDown = useCallback((e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        const sim = simRef.current;
        if (sim.detailOpen) return;
        sim.dragging = true;
        sim.didDrag = false;
        sim.dragStartX = e.clientX;
        sim.dragStartY = e.clientY;
        sim.dragStartT = sim.T;
    }, []);

    const handleTapeClick = useCallback(
        (v) => {
            const sim = simRef.current;
            if (sim.didDrag || sim.detailOpen) return;
            const r = normalizeRelIndex(v, sim.s);
            if (Math.abs(r) <= 0.45) {
                openDetailSheet();
            } else {
                sim.T = Math.round(sim.T + r);
            }
        },
        [openDetailSheet]
    );

    const activeDetailMeta = useMemo(() => {
        if (!detailItem) return null;
        return itemStyles[detailItem.index] || null;
    }, [detailItem, itemStyles]);

    return (
        <section
            ref={sectionRef}
            tabIndex={0}
            className="home-vhs-section"
            aria-label="Interactive curved VHS build archive"
            onWheel={handleWheel}
        >
            {/* Tactile ambient analog grain tile */}
            <svg className="vhs-grain-defs" aria-hidden="true" width="0" height="0">
                <defs>
                    <filter id={grainFilterId}>
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.85"
                            numOctaves="3"
                            stitchTiles="stitch"
                        />
                        <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.88  0 0 0 0.14 0"
                        />
                    </filter>
                </defs>
            </svg>
            <div className="vhs-grain-overlay" style={{ filter: `url(#${grainFilterId})` }} aria-hidden="true" />

            {/* Giant Vertical Halftone Kanji Columns behind the Shelf */}
            <div className="vhs-kanji vhs-kanji-left" aria-hidden="true">
                技術
            </div>
            <div className="vhs-kanji vhs-kanji-right" aria-hidden="true">
                の軌跡
            </div>

            {/* Section Archival Header Strip (complements fixed portfolio Navbar without duplicating it) */}
            <header className="vhs-topbar">
                <div className="vhs-brand-group">
                    <span className="vhs-lbl vhs-accent">LIVE ARCHIVE STREAM</span>
                    <span className="vhs-brand-rule" aria-hidden="true" />
                    <span className="vhs-lbl">BUILD CATALOG 2022–2026</span>
                </div>

                <nav className="vhs-nav-group" aria-label="Archive quick routes">
                    <span className="vhs-box vhs-counter-pill" data-vhs-btn="true">
                        {String(activeModState + 1).padStart(2, '0')} / {ARCHIVE_ITEM_COUNT}
                    </span>
                    <Link to="/projects" className="vhs-lbl vhs-nav-link">
                        PROJECTS
                    </Link>
                    <Link to="/skills" className="vhs-lbl vhs-nav-link">
                        SKILLS
                    </Link>
                    <Link to="/resume" className="vhs-lbl vhs-nav-link">
                        RESUME
                    </Link>
                </nav>
            </header>

            {/* CSS probe holding --vhs-H for exact JS shelf geometry */}
            <div ref={probeRef} className="vhs-probe" aria-hidden="true" />

            {/* Soft Floor Shadow beneath 3D bowl */}
            <div className="vhs-floor-shadow" aria-hidden="true" />

            {/* 3D Perspective Shelf */}
            <div
                className="vhs-shelf"
                onPointerDown={handleShelfPointerDown}
                role="region"
                aria-label="3D VHS Cassette Carousel"
            >
                <div className="vhs-stage">
                    {Array.from({ length: ARCHIVE_TOTAL_TAPES }, (_, v) => {
                        const mod = v % ARCHIVE_ITEM_COUNT;
                        const { item, coverCrop, spineCrop } = itemStyles[mod];
                        return (
                            <div
                                key={v}
                                ref={(el) => {
                                    tapeRefs.current[v] = el;
                                }}
                                className="vhs-tape"
                                onPointerEnter={() => {
                                    simRef.current.hoveredTape = v;
                                }}
                                onPointerLeave={() => {
                                    if (simRef.current.hoveredTape === v) {
                                        simRef.current.hoveredTape = -1;
                                    }
                                }}
                                onClick={() => handleTapeClick(v)}
                                role="button"
                                tabIndex={-1}
                                aria-label={`Inspect ${item.title} (${item.displayYear})`}
                            >
                                <div
                                    className="vhs-face vhs-face-sp"
                                    style={{
                                        backgroundImage: atlasUrls.spinesUrl ? `url(${atlasUrls.spinesUrl})` : undefined,
                                        backgroundSize: spineCrop.backgroundSize,
                                        backgroundPosition: spineCrop.backgroundPosition,
                                    }}
                                >
                                    <div
                                        ref={(el) => {
                                            spineShadeRefs.current[v] = el;
                                        }}
                                        className="vhs-shade-layer"
                                    />
                                </div>
                                <div
                                    ref={(el) => {
                                        coverFaceRefs.current[v] = el;
                                    }}
                                    className="vhs-face vhs-face-cv"
                                    style={{
                                        backgroundImage: atlasUrls.coversUrl ? `url(${atlasUrls.coversUrl})` : undefined,
                                        backgroundSize: coverCrop.backgroundSize,
                                        backgroundPosition: coverCrop.backgroundPosition,
                                    }}
                                >
                                    <div
                                        ref={(el) => {
                                            coverShadeRefs.current[v] = el;
                                        }}
                                        className="vhs-shade-layer"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Play / Open Ring Anchored to Active Cover Corner */}
            <button
                ref={playRef}
                type="button"
                className="vhs-play-ring"
                onClick={openDetailSheet}
                aria-label="Open tape dossier"
            >
                <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
                    <polygon points="1,1 11,7 1,13" fill="currentColor" />
                </svg>
            </button>

            {/* Caption Under Active Cover + Side Navigation Arrows */}
            <div className="vhs-caption">
                <div ref={titleMaskRef} className="vhs-mask vhs-cap-title" />
                <div ref={subMaskRef} className="vhs-mask vhs-cap-sub" />
                <div className="vhs-cap-rule" aria-hidden="true" />
                <div ref={metaMaskRef} className="vhs-mask vhs-cap-meta" />
            </div>

            <button
                type="button"
                className="vhs-arrow vhs-arrow-prev"
                onClick={() => stepShelf(-1)}
                aria-label="Previous release tape"
            >
                <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true">
                    <path d="M6 1L1 6l5 5M1 6h23" stroke="currentColor" strokeWidth="1.2" />
                </svg>
            </button>

            <button
                type="button"
                className="vhs-arrow vhs-arrow-next"
                onClick={() => stepShelf(1)}
                aria-label="Next release tape"
            >
                <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true">
                    <path d="M18 1l5 5-5 5M23 6H0" stroke="currentColor" strokeWidth="1.2" />
                </svg>
            </button>

            {/* Interactive 2022–2026 Timeline Ruler */}
            <div
                ref={timelineRef}
                className="vhs-timeline"
                data-vhs-timeline="true"
                onClick={handleTimelineClick}
                role="slider"
                aria-label="Release year scrubber from 2022 to 2026"
                aria-valuemin={TIMELINE_MIN_YEAR}
                aria-valuemax={TIMELINE_MAX_YEAR}
                aria-valuenow={VHS_ARCHIVE_ITEMS[activeModState]?.displayYear || 2025}
                tabIndex={0}
            >
                <div className="vhs-tl-line" aria-hidden="true" />
                <div ref={timelineDotRef} className="vhs-tl-dot" aria-hidden="true" />
                {TIMELINE_TICKS.map((t, i) => (
                    <div
                        key={i}
                        className={`vhs-tl-tick${t.major ? ' is-major' : ''}${t.pct === 0 ? ' is-first' : ''}${t.pct === 100 ? ' is-last' : ''}`}
                        style={{ left: `${t.pct.toFixed(3)}%` }}
                        aria-hidden="true"
                    >
                        <i />
                        {t.label && <span>{t.label}</span>}
                    </div>
                ))}
            </div>

            {/* Bottom Editorial Micro-Row */}
            <footer className="vhs-bottom-strip">
                <span className="vhs-lbl">
                    DRAG SHELF OR CLICK A SPINE · PRESS ENTER TO OPEN
                </span>
                <span className="vhs-lbl vhs-bottom-right">
                    VIVASWAN SHETTY · {ARCHIVE_ITEM_COUNT} ARCHIVE VOLUMES
                </span>
            </footer>

            {/* Scoped Custom Cursor + Full-Screen Ink-Blot Detail Sheet Portaled cleanly above Navbar */}
            {typeof document !== 'undefined' &&
                createPortal(
                    <>
                        <div ref={cursorRef} className="vhs-cursor" aria-hidden="true">
                            <span className="vhs-cursor-ring" />
                            <span className="vhs-cursor-dot" />
                            <span className="vhs-cursor-label">
                                <b>OPEN</b>
                                <small>開く</small>
                            </span>
                        </div>

                        {detailOpen && detailItem && activeDetailMeta && (
                            <div
                                ref={detailRef}
                                className="vhs-detail"
                                role="dialog"
                                aria-modal="true"
                                aria-label={`${detailItem.title} Archive Dossier`}
                            >
                                <div
                                    className="vhs-grain-overlay is-detail"
                                    style={{ filter: `url(#${grainFilterId})` }}
                                    aria-hidden="true"
                                />

                                <button
                                    type="button"
                                    className="vhs-box vhs-detail-close"
                                    onClick={() => closeDetailSheet()}
                                >
                                    CLOSE / 閉じる
                                </button>

                                <div className="vhs-detail-brand" aria-hidden="true">
                                    <span className="vhs-lbl vhs-accent">VIVASWAN SHETTY</span>
                                    <span className="vhs-brand-rule" />
                                    <span className="vhs-lbl">BUILD ARCHIVE</span>
                                </div>

                                <div className="vhs-detail-grid">
                                    <div className="vhs-detail-copy">
                                        <div className="vhs-mask">
                                            <span
                                                ref={(el) => {
                                                    detailTextRefs.current[0] = el;
                                                }}
                                                className="vhs-detail-line vhs-lbl vhs-accent"
                                            >
                                                {detailItem.code} · {detailItem.romaji} / {detailItem.kanji}
                                            </span>
                                        </div>

                                        <div className="vhs-mask">
                                            <h2
                                                ref={(el) => {
                                                    detailTextRefs.current[1] = el;
                                                }}
                                                className="vhs-detail-line vhs-detail-title"
                                            >
                                                {detailItem.title}
                                            </h2>
                                        </div>

                                        <div className="vhs-mask">
                                            <p
                                                ref={(el) => {
                                                    detailTextRefs.current[2] = el;
                                                }}
                                                className="vhs-detail-line vhs-detail-meta"
                                            >
                                                {detailItem.displayYear} / {detailItem.category} / {detailItem.metric}
                                            </p>
                                        </div>

                                        <div className="vhs-mask">
                                            <p
                                                ref={(el) => {
                                                    detailTextRefs.current[3] = el;
                                                }}
                                                className="vhs-detail-line vhs-detail-synopsis"
                                            >
                                                {detailItem.synopsis}
                                            </p>
                                        </div>

                                        <div className="vhs-mask">
                                            <p
                                                ref={(el) => {
                                                    detailTextRefs.current[4] = el;
                                                }}
                                                className="vhs-detail-line vhs-detail-credit"
                                            >
                                                {detailItem.credit} {detailItem.creditJp}
                                            </p>
                                        </div>

                                        <div className="vhs-mask">
                                            <div
                                                ref={(el) => {
                                                    detailTextRefs.current[5] = el;
                                                }}
                                                className="vhs-detail-line vhs-detail-actions"
                                            >
                                                <button
                                                    type="button"
                                                    className="vhs-detail-cta"
                                                    onClick={() =>
                                                        closeDetailSheet(() => navigate(detailItem.route))
                                                    }
                                                >
                                                    INSPECT BUILD / 詳細を見る
                                                </button>
                                                {detailItem.externalUrl && (
                                                    <a
                                                        href={detailItem.externalUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="vhs-detail-ext"
                                                        aria-label={`Open ${detailItem.title} external deployment`}
                                                    >
                                                        <ExternalLink size={15} />
                                                        <span>LIVE LINK</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="vhs-detail-poster-wrap">
                                        <svg
                                            viewBox="0 0 474 900"
                                            className="vhs-detail-poster-svg"
                                            role="img"
                                            aria-label={`${detailItem.title} VHS collector cover`}
                                        >
                                            <defs>
                                                <filter id={inkFilterId} x="-30%" y="-30%" width="160%" height="160%">
                                                    <feTurbulence
                                                        type="fractalNoise"
                                                        baseFrequency="0.011"
                                                        numOctaves="3"
                                                        seed="7"
                                                        result="noise"
                                                    />
                                                    <feDisplacementMap
                                                        in="SourceGraphic"
                                                        in2="noise"
                                                        scale="120"
                                                        xChannelSelector="R"
                                                        yChannelSelector="G"
                                                    />
                                                </filter>
                                                <mask id={posterMaskId}>
                                                    <g filter={`url(#${inkFilterId})`}>
                                                        {INK_BLOT_CIRCLES.map((c, idx) => (
                                                            <circle
                                                                key={idx}
                                                                ref={(el) => {
                                                                    inkCircleRefs.current[idx] = el;
                                                                }}
                                                                cx={c.cx}
                                                                cy={c.cy}
                                                                r={reducedMotion ? 720 : 0}
                                                                fill="white"
                                                            />
                                                        ))}
                                                    </g>
                                                </mask>
                                            </defs>

                                            {atlasUrls.coversUrl && (
                                                <image
                                                    href={atlasUrls.coversUrl}
                                                    x={activeDetailMeta.svgPlacement.x}
                                                    y={activeDetailMeta.svgPlacement.y}
                                                    width={activeDetailMeta.svgPlacement.width}
                                                    height={activeDetailMeta.svgPlacement.height}
                                                    preserveAspectRatio="none"
                                                    mask={`url(#${posterMaskId})`}
                                                />
                                            )}
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>,
                    document.body
                )}
        </section>
    );
};

export default VhsArchiveSection;
