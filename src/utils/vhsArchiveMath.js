// Pure 3D curved VHS arc math, sprite sheet crop equations, spring/timeline evaluators,
// and Ink-Blot detail sheet geometry for the Home Curved VHS Build Archive.

export const ARCHIVE_COPIES = 3;
export const ARCHIVE_ITEM_COUNT = 12;
export const ARCHIVE_TOTAL_TAPES = ARCHIVE_COPIES * ARCHIVE_ITEM_COUNT; // 36
export const INITIAL_TAPE_INDEX = 5; // Opens centered on ElevateX Mobile (middle of timeline)
export const INITIAL_SCROLL_SLOT = ARCHIVE_ITEM_COUNT + INITIAL_TAPE_INDEX; // 17

export const PERSPECTIVE_PX = 1400;
export const TIMELINE_MIN_YEAR = 2022;
export const TIMELINE_MAX_YEAR = 2026;
export const TIMELINE_SPAN = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR; // 4 years

export const COVERS_SHEET_W = 1744;
export const COVERS_SHEET_H = 2336;
export const SPINES_SHEET_W = 2688;
export const SPINES_SHEET_H = 1152;

// 4 x 3 cover boxes in covers sheet pixels (x, y, w, h) mirroring ~1:1.94 tape cover aspect
export const COVER_CELL_BOXES = [
    { x: 74, y: 72, w: 344, h: 668 },
    { x: 497, y: 72, w: 344, h: 668 },
    { x: 914, y: 72, w: 344, h: 668 },
    { x: 1331, y: 72, w: 344, h: 668 },
    { x: 74, y: 814, w: 344, h: 676 },
    { x: 497, y: 814, w: 344, h: 676 },
    { x: 914, y: 814, w: 344, h: 676 },
    { x: 1331, y: 814, w: 344, h: 676 },
    { x: 74, y: 1574, w: 344, h: 678 },
    { x: 497, y: 1574, w: 344, h: 678 },
    { x: 914, y: 1574, w: 344, h: 678 },
    { x: 1331, y: 1574, w: 344, h: 678 },
];

// 12 x 1 spine boxes across spines strip (x, y, w, h) matching 142:840 ratio (~1:5.9)
export const SPINE_CELL_BOXES = Array.from({ length: ARCHIVE_ITEM_COUNT }, (_, idx) => ({
    x: 42 + idx * 220,
    y: 31,
    w: 188,
    h: 1089,
}));

export const INK_BLOT_CIRCLES = [
    { cx: 150, cy: 330, delayMs: 0 },
    { cx: 340, cy: 600, delayMs: 120 },
    { cx: 250, cy: 120, delayMs: 220 },
    { cx: 90, cy: 760, delayMs: 300 },
    { cx: 400, cy: 250, delayMs: 360 },
    { cx: 260, cy: 860, delayMs: 420 },
    { cx: 230, cy: 470, delayMs: 180 },
];

export const VHS_ARCHIVE_ITEMS = [
    {
        id: 'sys-kernel',
        index: 0,
        code: 'VS-01',
        title: 'C/C++ Systems Core',
        spineLabel: 'SYSTEMS KERNEL',
        romaji: 'KIBAN KOCHIKU',
        kanji: '基盤構築',
        year: 2022.25,
        displayYear: 2022,
        category: 'SYSTEMS',
        metric: '800+ DSA SOLVES',
        route: '/skills',
        externalUrl: 'https://github.com/vivaswanshetty',
        synopsis:
            'Low-level algorithmic foundations built in C/C++, Python, and POSIX Linux tooling—mastering memory layout, graph traversal, and deterministic state machines before scaling to full-stack products.',
        credit: 'Core engineering foundation — Vivaswan Shetty.',
        creditJp: '開発記録',
        palette: { paper: '#ece8e0', dark: '#0b0e17', accent: '#ef4444', cobalt: '#2563eb' },
        motif: 'matrix',
        shotKey: null,
    },
    {
        id: 'gurukul-merit',
        index: 1,
        code: 'VS-02',
        title: 'PCMC Rank Protocol',
        spineLabel: 'PCMC PROTOCOL',
        romaji: 'SHUSEKI KIROKU',
        kanji: '首席記録',
        year: 2023.4,
        displayYear: 2023,
        category: 'ALGORITHMS',
        metric: '398 / 400 (99.5%)',
        route: '/resume',
        externalUrl: null,
        synopsis:
            'Pre-University Science, Mathematics & Computer Science mastery achieving 398/400 in state board examinations and Top 2% state rank in KCET prior to Computer Science & Engineering at BMSCE.',
        credit: 'Academic milestone — BMSCE Bengaluru trajectory.',
        creditJp: '学術軌跡',
        palette: { paper: '#f2ece1', dark: '#0e1424', accent: '#dc2626', cobalt: '#1d4ed8' },
        motif: 'orbit',
        shotKey: null,
    },
    {
        id: 'portfolio-arch',
        index: 2,
        code: 'VS-03',
        title: 'Cosmic SPA Engine',
        spineLabel: 'PORTFOLIO ARCH',
        romaji: 'UCHU KOZO',
        kanji: '宇宙構造',
        year: 2024.15,
        displayYear: 2024,
        category: 'FULL-STACK WEB',
        metric: '98+ LIGHTHOUSE',
        route: '/projects/portfolio',
        externalUrl: 'https://github.com/vivaswanshetty/Portfolio-Website',
        synopsis:
            'First production React + Vite portfolio engine unifying a 60 FPS GPU particle starfield, keyboard Command Palette (⌘K), strict accessibility guards, and modular project case studies.',
        credit: 'Architected & shipped by Vivaswan Shetty.',
        creditJp: '設計作品',
        palette: { paper: '#ebe6dc', dark: '#090c14', accent: '#ef4444', cobalt: '#3b82f6' },
        motif: 'horizon',
        shotKey: 'portfolio',
    },
    {
        id: 'elev-ai',
        index: 3,
        code: 'VS-04',
        title: 'Elev AI Copilot',
        spineLabel: 'ELEV AI CORE',
        romaji: 'SEISEI CHINO',
        kanji: '生成知能',
        year: 2024.7,
        displayYear: 2024,
        category: 'AI ORCHESTRATION',
        metric: 'COST-GUARD 20/5M',
        route: '/projects/elevatex-web',
        externalUrl: 'https://elevatex-one.vercel.app',
        synopsis:
            'Draggable floating Gemini AI assistant with viewport boundary clamping, line-level quotation parsing, ephemeral session isolation before persistence, and Express IP Cost-Guard rate limiting.',
        credit: 'Architected & shipped by Vivaswan Shetty.',
        creditJp: '人工知能',
        palette: { paper: '#f0ece3', dark: '#0c1020', accent: '#f43f5e', cobalt: '#2563eb' },
        motif: 'prism',
        shotKey: 'elevatex-web',
    },
    {
        id: 'elevatex-web',
        index: 4,
        code: 'VS-05',
        title: 'ElevateX Market',
        spineLabel: 'ELEVATEX WEB',
        romaji: 'KAIHATSU ICHIBA',
        kanji: '開発市場',
        year: 2025.05,
        displayYear: 2025,
        category: 'MERN MONOREPO',
        metric: '<50ms SOCKET.IO',
        route: '/projects/elevatex-web',
        externalUrl: 'https://elevatex-one.vercel.app',
        synopsis:
            'Full-stack gamified developer marketplace transforming code reviews and freelance micro-tasks into XP quests, multiplayer 1v1 sprint duels, resonance lobbies, and Razorpay milestone escrow.',
        credit: 'Founded & engineered by Vivaswan Shetty.',
        creditJp: '開発基盤',
        palette: { paper: '#ede8df', dark: '#0a0e19', accent: '#ef4444', cobalt: '#1e40af' },
        motif: 'wave',
        shotKey: 'elevatex-web',
    },
    {
        id: 'elevatex-mobile',
        index: 5,
        code: 'VS-06',
        title: 'ElevateX Mobile',
        spineLabel: 'ELEVATEX NATIVE',
        romaji: 'KEITAI TANMATSU',
        kanji: '携帯端末',
        year: 2025.35,
        displayYear: 2025,
        category: 'REACT NATIVE',
        metric: 'EXPO SDK 52 · BUN',
        route: '/projects/elevatex-mobile',
        externalUrl: 'https://github.com/vivaswanshetty/ElevateX-Mobile',
        synopsis:
            'High-framerate Expo SDK 52 native client with follow-locked real-time messaging, double-tick receipts, chunked 200 MB rich-media uploads, Zustand persistent state, and haptic sprint duels.',
        credit: 'Architected & shipped by Vivaswan Shetty.',
        creditJp: '携帯アプリ',
        palette: { paper: '#f3efe6', dark: '#0b0f1b', accent: '#ef4444', cobalt: '#1d4ed8' },
        motif: 'monolith',
        shotKey: 'elevatex-mobile',
    },
    {
        id: 'rhca-cloud',
        index: 6,
        code: 'VS-07',
        title: 'Red Hat Architect',
        spineLabel: 'RED HAT RHCA',
        romaji: 'UNYO SEIGYO',
        kanji: '運用制御',
        year: 2025.7,
        displayYear: 2025,
        category: 'CLOUD & LINUX',
        metric: 'RED HAT CERTIFIED',
        route: '/resume',
        externalUrl: 'https://www.credly.com/badges/25f8c763-54ed-48b7-96da-a59564f5cc37',
        synopsis:
            'Certified enterprise systems architecture covering hardened Linux automation, distributed routing, container orchestration, Vercel Edge handlers, and zero-downtime Railway deployments.',
        credit: 'Credly verified certification — Red Hat RHCA.',
        creditJp: '認証構築',
        palette: { paper: '#eeeae0', dark: '#100c14', accent: '#dc2626', cobalt: '#1e3a8a' },
        motif: 'layers',
        shotKey: null,
    },
    {
        id: 'conquerone',
        index: 7,
        code: 'VS-08',
        title: 'CONQUER ONE',
        spineLabel: 'CONQUER ONE',
        romaji: 'KINRYOKU KIROKU',
        kanji: '筋力記録',
        year: 2026.05,
        displayYear: 2026,
        category: 'FITNESS AI',
        metric: 'GEMINI 2.5 FLASH',
        route: '/projects/conquerone',
        externalUrl: 'https://github.com/vivaswanshetty/ConquerONE',
        synopsis:
            'Offline-first 6-day strength training client built with React Native 0.81 and Expo SDK 54—unilateral set logging, automatic PR detection, Health Connect biometrics, and multi-model AI fallback.',
        credit: 'Created & engineered by Vivaswan Shetty.',
        creditJp: '健康解析',
        palette: { paper: '#ece8e0', dark: '#0d090c', accent: '#ef4444', cobalt: '#1e3a8a' },
        motif: 'pulse',
        shotKey: 'conquerone',
    },
    {
        id: 'rv-tours',
        index: 8,
        code: 'VS-09',
        title: 'RV Tours & Travels',
        spineLabel: 'RV TOURS BOARD',
        romaji: 'TABI NO KIROKU',
        kanji: '旅の記録',
        year: 2026.25,
        displayYear: 2026,
        category: 'NEXT.JS 16 EDGE',
        metric: '100 SEO SCORE',
        route: '/projects/rv-tours-and-travels',
        externalUrl: 'https://rvtravelsudupi.com',
        synopsis:
            'Bespoke vintage departure-manifest booking platform powered by Next.js 16 Turbopack, React 19, Tailwind CSS v4, liquid glass navigation, and WhatsApp dispatch codes (RV-YYYYMMDD-XXXX).',
        credit: 'Production client build — Udupi, Karnataka.',
        creditJp: '旅程設計',
        palette: { paper: '#f4f0e8', dark: '#090e18', accent: '#ef4444', cobalt: '#1d4ed8' },
        motif: 'ticket',
        shotKey: 'rv-tours',
    },
    {
        id: 'medfind',
        index: 9,
        code: 'VS-10',
        title: 'MedFind Care Radar',
        spineLabel: 'MEDFIND RADAR',
        romaji: 'IRYO TANSAKU',
        kanji: '医療探索',
        year: 2026.48,
        displayYear: 2026,
        category: 'HEALTHCARE',
        metric: '87 COUNTRIES SOS',
        route: '/projects/medfind',
        externalUrl: 'https://github.com/vivaswanshetty/MedFind',
        synopsis:
            'Android-first emergency medicine locator featuring a transparent 4-tier stock decay engine, ~1km truncated OpenStreetMap Overpass queries, 87-country SOS dialer, and offline expiry push alerts.',
        credit: 'Lead Mobile Architect — Vivaswan Shetty.',
        creditJp: '緊急医療',
        palette: { paper: '#eeeae2', dark: '#081018', accent: '#ef4444', cobalt: '#2563eb' },
        motif: 'radar',
        shotKey: 'medfind',
    },
    {
        id: 'night-valley',
        index: 10,
        code: 'VS-11',
        title: 'Night Valley 3D',
        spineLabel: 'NIGHT VALLEY',
        romaji: 'YAKEI KEIKOKU',
        kanji: '夜景渓谷',
        year: 2026.68,
        displayYear: 2026,
        category: 'WEBGL SHADERS',
        metric: '60 FPS CANYON',
        route: '/about',
        externalUrl: null,
        synopsis:
            'Custom Three.js dusk canyon terrain and orbital drone pathfinding driving the interactive /about experience—procedural heightfield shaders, specular water reflection, and spline navigation.',
        credit: 'Spatial WebGL environment — Vivaswan Shetty.',
        creditJp: '立体地形',
        palette: { paper: '#ece8e0', dark: '#070a14', accent: '#ef4444', cobalt: '#3b82f6' },
        motif: 'canyon',
        shotKey: null,
    },
    {
        id: 'skills-corridor',
        index: 11,
        code: 'VS-12',
        title: 'Spatial Ring Gallery',
        spineLabel: 'RING GALLERY',
        romaji: 'GIJUTSU KAIRO',
        kanji: '技術回廊',
        year: 2026.88,
        displayYear: 2026,
        category: 'SPATIAL UX',
        metric: '60 PLATES · GLSL',
        route: '/skills',
        externalUrl: null,
        synopsis:
            'First-person 3D cylindrical museum corridor uniting procedural texture atlases, Snell-law refractive Liquid Glass optics, sticky blueprint spec sheets, and shortest-arc camera focus kinematics.',
        credit: 'Spatial portfolio edition — Vivaswan Shetty.',
        creditJp: '空間展示',
        palette: { paper: '#f2eee6', dark: '#080a12', accent: '#ef4444', cobalt: '#2563eb' },
        motif: 'ring',
        shotKey: 'portfolio',
    },
];

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function smoothstep01(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
}

/**
 * Wraps virtual tape index `v` relative to scroll slot `s` cleanly into [-18, 18).
 */
export function normalizeRelIndex(v, s, total = ARCHIVE_TOTAL_TAPES) {
    const half = total / 2;
    return (((v - s) % total) + total + half) % total - half;
}

/**
 * Smooth spacing easing function B(r) pushing neighbours smoothly apart around the open 90-degree front cover.
 */
export function bumpB(r) {
    if (Math.abs(r) < 1) {
        return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
    }
    return r > 0 ? 0.5 : -0.5;
}

export function computeTapeDimensions(H, viewportWidth) {
    const safeH = Math.max(120, H);
    const ws = safeH * (142 / 840);
    const d = safeH * (474 / 900);
    const gap = safeH * 0.035;
    const isPhone = viewportWidth < 768;
    const U = isPhone ? safeH * 1.05 : safeH * 1.3;

    return {
        H: safeH,
        ws,
        d,
        gap,
        U,
        P: PERSPECTIVE_PX,
        isPhone,
    };
}

/**
 * Arc length along the curved shelf from center tape (`r = 0`).
 */
export function arcLengthF(r, dims) {
    return r * (dims.ws + dims.gap) + (dims.d - dims.ws + 1.4 * dims.gap) * bumpB(r);
}

/**
 * Perspective recession scale factor `scl(u)` -> needles pack narrower and recede deeper at outer arc edges.
 */
export function scaleAtArc(u, U) {
    return 1 / (1 + Math.pow(Math.abs(u) / Math.max(1, U), 1.6));
}

/**
 * Precomputes integral of `scl(u)` at 2px resolution up to `3 * U` so outer spines pack tighter horizontally.
 */
export function buildXScreenTable(U) {
    const maxU = Math.max(60, Math.ceil(U * 3));
    const steps = Math.ceil(maxU / 2) + 2;
    const table = new Float64Array(steps);
    let acc = 0;
    for (let i = 1; i < steps; i++) {
        const u = (i - 0.5) * 2;
        acc += 2 * scaleAtArc(u, U);
        table[i] = acc;
    }
    return table;
}

export function lookupXScreen(u, table) {
    if (!u || !table || table.length === 0) return 0;
    const absU = Math.abs(u);
    const idxFloat = absU * 0.5;
    const lo = Math.min(table.length - 1, Math.floor(idxFloat));
    const hi = Math.min(table.length - 1, lo + 1);
    const frac = idxFloat - lo;
    const mag = table[lo] + (table[hi] - table[lo]) * frac;
    return u < 0 ? -mag : mag;
}

/**
 * Evaluates full 3D CSS transform parameters, visibility, z-index, and face shading for one tape slot.
 */
export function computeTapePose(r, lift, tiltX, tiltY, dims, xTable) {
    const o = smoothstep01(Math.max(0, 1 - Math.abs(r)));
    const u = arcLengthF(r, dims);

    if (Math.abs(u) > dims.U * 1.95) {
        return {
            visible: false,
            o,
            u,
            sc: 0,
            x: 0,
            y: 0,
            z: -4000,
            rotX: 0,
            rotY: 0,
            zIndex: 0,
            spineShade: 0.6,
            coverShade: 0.82,
        };
    }

    const sc = scaleAtArc(u, dims.U);
    const k = 1 / sc;
    const z = dims.P * (1 - k) + o * dims.H * 0.1;
    const x = lookupXScreen(u, xTable) * k;
    const y = (dims.H * 0.5 * (1 - sc) * 0.42 + o * dims.H * 0.012 - lift * dims.H * 0.05) * k;

    const absFrac = Math.min(1, Math.abs(u) / Math.max(1, dims.U));
    const rotY = Math.sign(u || 0) * absFrac * 26 * (1 - o) - 90 * o + tiltY * o;
    const rotX = tiltX * o;

    return {
        visible: true,
        o,
        u,
        sc,
        x,
        y,
        z,
        rotX,
        rotY,
        zIndex: Math.round(3000 + z),
        spineShade: Math.min(0.6, o * 0.55 + (1 - sc) * 0.32),
        coverShade: (1 - o) * 0.82,
    };
}

/**
 * Exact CSS background-size and background-position percentages from sheet pixel box.
 */
export function computeSheetCropBackground(sheetW, sheetH, box) {
    const denomX = Math.max(1, sheetW - box.w);
    const denomY = Math.max(1, sheetH - box.h);
    return {
        backgroundSize: `${((sheetW / box.w) * 100).toFixed(4)}% ${((sheetH / box.h) * 100).toFixed(4)}%`,
        backgroundPosition: `${((box.x / denomX) * 100).toFixed(4)}% ${((box.y / denomY) * 100).toFixed(4)}%`,
    };
}

/**
 * Exact SVG <image> attributes inside `viewBox="0 0 474 900"` matching the prompt's formula.
 */
export function computeSvgPosterPlacement(sheetW, sheetH, box) {
    return {
        x: (-box.x * 474) / box.w,
        y: (-box.y * 900) / box.h,
        width: (sheetW * 474) / box.w,
        height: (sheetH * 900) / box.h,
    };
}

/**
 * Evaluates fractional release year at scroll position `s`, jumping cleanly on the wrap boundary.
 */
export function evaluateTimelineTargetYear(s, items = VHS_ARCHIVE_ITEMS) {
    const count = items.length;
    const floorIdx = Math.floor(s);
    const frac = s - floorIdx;
    const aIdx = ((floorIdx % count) + count) % count;
    const bIdx = (aIdx + 1) % count;
    const yearA = items[aIdx].year;
    const yearB = items[bIdx].year;

    // Handle 2026 -> 2022 wrap seam with a sharp halfway switch
    if (yearB < yearA) {
        return frac < 0.5 ? yearA : yearB;
    }
    return yearA + (yearB - yearA) * frac;
}

/**
 * Computes shortest circular delta from `currentT` to target catalog index `targetIdx`.
 */
export function resolveShortestTapeTarget(currentT, targetIdx, count = ARCHIVE_ITEM_COUNT) {
    const currentMod = ((Math.round(currentT) % count) + count) % count;
    let diff = targetIdx - currentMod;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return Math.round(currentT) + diff;
}

/**
 * Computes fixed viewport `clip-path: inset(...)` matching a DOM bounding rect.
 */
export function computeDetailClipInset(rect, viewportW, viewportH) {
    if (!rect || viewportW <= 0 || viewportH <= 0) {
        return 'inset(42% 42% 42% 42% round 4px)';
    }
    const top = Math.max(0, rect.top).toFixed(1);
    const right = Math.max(0, viewportW - rect.right).toFixed(1);
    const bottom = Math.max(0, viewportH - rect.bottom).toFixed(1);
    const left = Math.max(0, rect.left).toFixed(1);
    return `inset(${top}px ${right}px ${bottom}px ${left}px round 4px)`;
}
