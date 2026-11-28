// Procedural 1744x2336 (3x3 grid) master artwork sheet + gradient textures + crisp museum labels
// for the 3D curved Skills & Capabilities Gallery. Zero external image dependencies or CORS bottlenecks.

import {
    SHEET_WIDTH,
    SHEET_HEIGHT,
    COL_RANGES,
    ROW_RANGES,
    GUTTER_INSET,
} from './skillsGallery';

function drawSeededStars(ctx, w, h, seed, color = 'rgba(248, 250, 252, 0.28)') {
    let s = seed >>> 0;
    const rand = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0xffffffff;
    };
    ctx.fillStyle = color;
    for (let i = 0; i < 42; i++) {
        const px = rand() * w;
        const py = rand() * h;
        const r = 0.8 + rand() * 1.4;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPosterFrame(ctx, w, h, { dark, accent, indexCode, kicker }) {
    // Subtle inner museum passe-partout frame
    ctx.strokeStyle = dark ? 'rgba(248, 250, 252, 0.14)' : 'rgba(15, 23, 42, 0.14)';
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, w - 44, h - 44);

    // Top-left exhibition index + top-right crimson datum bar
    ctx.fillStyle = dark ? 'rgba(248, 250, 252, 0.72)' : 'rgba(15, 23, 42, 0.78)';
    ctx.font = '600 18px "DM Mono", monospace';
    ctx.fillText(indexCode, 40, 56);

    ctx.fillStyle = accent;
    ctx.fillRect(w - 92, 42, 52, 6);

    // Bottom museum stamp inside artwork margin
    ctx.fillStyle = dark ? 'rgba(248, 250, 252, 0.48)' : 'rgba(15, 23, 42, 0.56)';
    ctx.font = '500 15px "DM Mono", monospace';
    ctx.fillText(kicker, 40, h - 42);
}

function renderCellArtwork(ctx, idx, w, h) {
    ctx.save();
    const cx = w / 2;
    const cy = h / 2 - 12;

    if (idx === 0) {
        // 01: React & React Native — Orbital Fiber Rings + Native Core
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#0B1020');
        bg.addColorStop(0.55, '#131C35');
        bg.addColorStop(1, '#090D18');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        drawSeededStars(ctx, w, h, 101);

        // Soft glowing core halo
        const glow = ctx.createRadialGradient(cx, cy, 12, cx, cy, 210);
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.34)');
        glow.addColorStop(0.55, 'rgba(239, 68, 68, 0.12)');
        glow.addColorStop(1, 'rgba(11, 16, 32, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 210, 0, Math.PI * 2);
        ctx.fill();

        // Three inclined atomic orbital ellipses
        for (let r = 0; r < 3; r++) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((r * Math.PI) / 3);
            ctx.strokeStyle = r === 1 ? '#EF4444' : 'rgba(248, 250, 252, 0.85)';
            ctx.lineWidth = r === 1 ? 5 : 3.2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 178, 64, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Precision center nucleus
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();

        drawPosterFrame(ctx, w, h, { dark: true, accent: '#EF4444', indexCode: '01 · UI', kicker: 'REACT · EXPO SDK' });
    } else if (idx === 1) {
        // 02: TypeScript & JS — Swiss Archival Light Poster (High contrast break!)
        const bg = ctx.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, '#F6F0E6');
        bg.addColorStop(1, '#EADFD0');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Subtle architectural grid lines
        ctx.strokeStyle = 'rgba(20, 25, 38, 0.08)';
        ctx.lineWidth = 1.5;
        for (let gx = 64; gx < w; gx += 72) {
            ctx.beginPath();
            ctx.moveTo(gx, 70);
            ctx.lineTo(gx, h - 70);
            ctx.stroke();
        }
        for (let gy = 84; gy < h - 60; gy += 72) {
            ctx.beginPath();
            ctx.moveTo(44, gy);
            ctx.lineTo(w - 44, gy);
            ctx.stroke();
        }

        // Bold structural Bauhaus blocks & strict type bracket
        ctx.fillStyle = '#111622';
        ctx.fillRect(88, 185, 190, 260);
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(348, 315, 95, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F6F0E6';
        ctx.font = '700 108px "Oswald", sans-serif';
        ctx.fillText('TS', 118, 360);

        ctx.fillStyle = '#111622';
        ctx.fillRect(88, 480, w - 176, 8);
        ctx.fillRect(88, 510, (w - 176) * 0.68, 8);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(88, 540, (w - 176) * 0.42, 8);

        drawPosterFrame(ctx, w, h, { dark: false, accent: '#EF4444', indexCode: '02 · STRICT', kicker: 'TYPESCRIPT · ESM' });
    } else if (idx === 2) {
        // 03: Node.js & Real-Time — Bidirectional Socket Waveform + Constellation
        ctx.fillStyle = '#090D14';
        ctx.fillRect(0, 0, w, h);
        drawSeededStars(ctx, w, h, 203, 'rgba(52, 211, 153, 0.3)');

        // Three harmonic Socket waves
        const colors = ['rgba(52, 211, 153, 0.85)', 'rgba(248, 250, 252, 0.75)', '#EF4444'];
        for (let wv = 0; wv < 3; wv++) {
            ctx.strokeStyle = colors[wv];
            ctx.lineWidth = wv === 2 ? 4.5 : 2.8;
            ctx.beginPath();
            for (let px = 60; px <= w - 60; px += 6) {
                const t = (px - 60) / (w - 120);
                const env = Math.sin(t * Math.PI);
                const py =
                    cy -
                    40 +
                    wv * 54 +
                    Math.sin(t * Math.PI * (3 + wv * 1.5) + wv * 1.1) * (88 * env);
                if (px === 60) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        // Socket edge nodes
        const nodes = [
            [115, 220],
            [w - 115, 220],
            [cx, 540],
        ];
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.22)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(nodes[0][0], nodes[0][1]);
        ctx.lineTo(nodes[1][0], nodes[1][1]);
        ctx.lineTo(nodes[2][0], nodes[2][1]);
        ctx.closePath();
        ctx.stroke();

        nodes.forEach(([nx, ny], i) => {
            ctx.fillStyle = i === 2 ? '#EF4444' : '#34D399';
            ctx.beginPath();
            ctx.arc(nx, ny, 14, 0, Math.PI * 2);
            ctx.fill();
        });

        drawPosterFrame(ctx, w, h, { dark: true, accent: '#34D399', indexCode: '03 · SOCKET', kicker: 'NODE · EXPRESS · BUN' });
    } else if (idx === 3) {
        // 04: MongoDB & Firestore — Layered Isometric Sharded Data Tiers
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#0D1722');
        bg.addColorStop(1, '#080D14');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        for (let tier = 0; tier < 4; tier++) {
            const yTop = 195 + tier * 96;
            ctx.beginPath();
            ctx.moveTo(cx, yTop);
            ctx.lineTo(cx + 150, yTop + 56);
            ctx.lineTo(cx, yTop + 112);
            ctx.lineTo(cx - 150, yTop + 56);
            ctx.closePath();

            if (tier === 0) {
                ctx.fillStyle = '#EF4444';
                ctx.fill();
            } else {
                ctx.fillStyle = tier % 2 === 1 ? 'rgba(56, 189, 248, 0.24)' : 'rgba(248, 250, 252, 0.14)';
                ctx.fill();
            }
            ctx.strokeStyle = tier === 0 ? '#FCA5A5' : 'rgba(248, 250, 252, 0.65)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Sync beam up center
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, 150);
        ctx.lineTo(cx, 620);
        ctx.stroke();
        ctx.setLineDash([]);

        drawPosterFrame(ctx, w, h, { dark: true, accent: '#38BDF8', indexCode: '04 · DATA', kicker: 'FIRESTORE · MONGO' });
    } else if (idx === 4) {
        // 05: Gemini AI Systems — Neural Prism & Spectral Cascade Beams
        const bg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 380);
        bg.addColorStop(0, '#231128');
        bg.addColorStop(0.6, '#120C1A');
        bg.addColorStop(1, '#07060C');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Spectral beams fanning right from prism
        const beams = [
            ['rgba(239, 68, 68, 0.72)', -86],
            ['rgba(245, 158, 11, 0.62)', -16],
            ['rgba(56, 189, 248, 0.68)', 54],
            ['rgba(248, 250, 252, 0.50)', 118],
        ];
        beams.forEach(([col, dy]) => {
            ctx.strokeStyle = col;
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(w - 54, cy + dy);
            ctx.stroke();
        });

        // Incoming prompt beam
        ctx.strokeStyle = '#F8FAFC';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(46, cy + 28);
        ctx.lineTo(cx - 24, cy);
        ctx.stroke();

        // Glass triangle prism
        ctx.beginPath();
        ctx.moveTo(cx, cy - 135);
        ctx.lineTo(cx + 125, cy + 95);
        ctx.lineTo(cx - 125, cy + 95);
        ctx.closePath();
        ctx.fillStyle = 'rgba(248, 250, 252, 0.14)';
        ctx.fill();
        ctx.strokeStyle = '#F8FAFC';
        ctx.lineWidth = 5;
        ctx.stroke();

        drawPosterFrame(ctx, w, h, { dark: true, accent: '#EF4444', indexCode: '05 · GEMINI', kicker: 'MULTI-MODEL AI' });
    } else if (idx === 5) {
        // 06: Three.js & 60FPS UI — Architectural Alabaster Perspective Corridor
        ctx.fillStyle = '#F3ECE0';
        ctx.fillRect(0, 0, w, h);

        const vx = cx;
        const vy = cy - 18;
        ctx.strokeStyle = 'rgba(17, 22, 34, 0.85)';
        ctx.lineWidth = 2.5;
        for (let k = 0; k < 6; k++) {
            const insetX = 64 + k * 34;
            const insetY = 120 + k * 42;
            ctx.strokeRect(insetX, insetY, w - insetX * 2, h - insetY * 2 - 20);
        }

        // Vanishing rays
        ctx.strokeStyle = 'rgba(17, 22, 34, 0.25)';
        ctx.lineWidth = 1.8;
        const corners = [
            [64, 120],
            [w - 64, 120],
            [64, h - 140],
            [w - 64, h - 140],
        ];
        corners.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(vx, vy);
            ctx.stroke();
        });

        // Crimson focal sphere inside corridor
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(vx, vy, 46, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111622';
        ctx.lineWidth = 3;
        ctx.stroke();

        drawPosterFrame(ctx, w, h, { dark: false, accent: '#EF4444', indexCode: '06 · WEBGL', kicker: 'THREE.JS · GLSL' });
    } else if (idx === 6) {
        // 07: Mobile Bridges & Native — Health Pulse + Geo Hex Radar
        ctx.fillStyle = '#120C12';
        ctx.fillRect(0, 0, w, h);

        // Radar concentric circles
        for (let r = 68; r <= 204; r += 45) {
            ctx.strokeStyle = 'rgba(248, 250, 252, 0.16)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy - 10, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Rounded mobile frame silhouette
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cx - 108, cy - 190, 216, 365, 34);
        ctx.stroke();

        // Biometric crimson heartbeat waveform
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(64, cy);
        ctx.lineTo(cx - 72, cy);
        ctx.lineTo(cx - 42, cy - 76);
        ctx.lineTo(cx - 10, cy + 88);
        ctx.lineTo(cx + 26, cy - 52);
        ctx.lineTo(cx + 52, cy);
        ctx.lineTo(w - 64, cy);
        ctx.stroke();

        drawPosterFrame(ctx, w, h, { dark: true, accent: '#EF4444', indexCode: '07 · NATIVE', kicker: 'HEALTH · OSM · OTA' });
    } else if (idx === 7) {
        // 08: Systems, DSA & Linux — Deterministic Binary Block Lattice + RHCA Crimson Bar
        ctx.fillStyle = '#0D1017';
        ctx.fillRect(0, 0, w, h);

        const cols = 5;
        const rows = 7;
        const cell = 64;
        const gap = 14;
        const startX = (w - (cols * cell + (cols - 1) * gap)) / 2;
        const startY = 128;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const bx = startX + c * (cell + gap);
                const by = startY + r * (cell + gap);
                const isDiag = r === c + 1 || (r === 2 && c >= 1 && c <= 3);
                ctx.fillStyle = isDiag
                    ? '#EF4444'
                    : (r + c) % 3 === 0
                      ? 'rgba(248, 250, 252, 0.24)'
                      : 'rgba(248, 250, 252, 0.08)';
                ctx.fillRect(bx, by, cell, cell);
            }
        }

        drawPosterFrame(ctx, w, h, { dark: true, accent: '#EF4444', indexCode: '08 · CORE', kicker: 'C++ · DSA · RHCA' });
    } else {
        // 09: Cloud, UI/UX & Tooling — Warm Stone Bauhaus Bezier + Edge Vector Composition
        ctx.fillStyle = '#EAE2D3';
        ctx.fillRect(0, 0, w, h);

        // Large slate anchor quadrant
        ctx.fillStyle = '#182032';
        ctx.beginPath();
        ctx.arc(cx - 30, cy - 40, 155, Math.PI * 0.5, Math.PI * 1.5);
        ctx.fill();

        // Bold Crimson Sun Disc
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(cx + 55, cy - 40, 108, 0, Math.PI * 2);
        ctx.fill();

        // Crisp Figma vector bezier curve + anchor handles
        ctx.strokeStyle = '#111622';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(86, cy + 165);
        ctx.bezierCurveTo(180, cy + 30, w - 180, cy + 250, w - 86, cy + 95);
        ctx.stroke();

        // Anchor squares
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#111622';
        ctx.lineWidth = 3;
        [
            [86, cy + 165],
            [cx, cy + 128],
            [w - 86, cy + 95],
        ].forEach(([hx, hy]) => {
            ctx.fillRect(hx - 9, hy - 9, 18, 18);
            ctx.strokeRect(hx - 9, hy - 9, 18, 18);
        });

        drawPosterFrame(ctx, w, h, { dark: false, accent: '#EF4444', indexCode: '09 · CLOUD', kicker: 'FIGMA · VERCEL · EDGE' });
    }

    ctx.restore();
}

/**
 * Renders ONE 1744x2336 master 3x3 sheet canvas separated by crisp thin dark/neutral gutters,
 * used by both WebGL textures (UV crop) and DOM elements (CSS background crop).
 */
export function buildSkillsMasterSheet() {
    const canvas = document.createElement('canvas');
    canvas.width = SHEET_WIDTH;
    canvas.height = SHEET_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { canvas, dataUrl: '' };

    ctx.fillStyle = '#10141F';
    ctx.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);

    for (let i = 0; i < 9; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const [x0, x1] = COL_RANGES[col];
        const [y0, y1] = ROW_RANGES[row];
        const x = x0 + GUTTER_INSET;
        const y = y0 + GUTTER_INSET;
        const w = x1 - x0 - GUTTER_INSET * 2;
        const h = y1 - y0 - GUTTER_INSET * 2;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.translate(x, y);
        renderCellArtwork(ctx, i, w, h);
        ctx.restore();
    }

    let dataUrl = '';
    try {
        dataUrl = canvas.toDataURL('image/webp', 0.92);
    } catch {
        dataUrl = canvas.toDataURL('image/png');
    }

    return { canvas, dataUrl };
}

export function createOuterWallCanvas() {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 256;
    const ctx = c.getContext('2d');
    if (!ctx) return c;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#070A10');
    g.addColorStop(0.2, '#131A29');
    g.addColorStop(0.6, '#1B2337');
    g.addColorStop(0.86, '#141B2B');
    g.addColorStop(1, '#090C14');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
    return c;
}

export function createInnerPillarCanvas() {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 256;
    const ctx = c.getContext('2d');
    if (!ctx) return c;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#090D16');
    g.addColorStop(0.3, '#1C253A');
    g.addColorStop(0.8, '#171F32');
    g.addColorStop(1, '#0A0E17');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
    return c;
}

export function createFloorCanvas() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext('2d');
    if (!ctx) return c;
    const innerR = (512 * 12.2) / 18;
    const g = ctx.createRadialGradient(512, 512, innerR, 512, 512, 512);
    g.addColorStop(0, '#090D16');
    g.addColorStop(0.55, '#192134');
    g.addColorStop(1, '#0E131F');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle concentric walkway score rings for spatial curve clarity
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.038)';
    ctx.lineWidth = 1.5;
    for (let r = innerR + 18; r < 508; r += 36) {
        ctx.beginPath();
        ctx.arc(512, 512, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    return c;
}

export function createHaloCanvas() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    if (!ctx) return c;
    const g = ctx.createRadialGradient(128, 128, 44, 128, 128, 128);
    g.addColorStop(0, 'rgba(248, 250, 252, 0.22)');
    g.addColorStop(0.38, 'rgba(239, 68, 68, 0.08)');
    g.addColorStop(1, 'rgba(248, 250, 252, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return c;
}

export function createShadowCanvas() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    if (!ctx) return c;
    const g = ctx.createRadialGradient(128, 128, 32, 128, 128, 128);
    g.addColorStop(0, 'rgba(2, 4, 10, 0.72)');
    g.addColorStop(0.35, 'rgba(2, 4, 10, 0.50)');
    g.addColorStop(1, 'rgba(2, 4, 10, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return c;
}

/**
 * Draws the 640x260 museum plaque under a gallery frame after document.fonts.ready.
 */
export function createPlaqueCanvas(skill) {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 260;
    const ctx = c.getContext('2d');
    if (!ctx) return c;

    ctx.clearRect(0, 0, 640, 260);

    // Subtle crisp hairline anchor for readability over corridor gradient
    ctx.fillStyle = 'rgba(8, 11, 18, 0.72)';
    ctx.beginPath();
    ctx.roundRect(10, 26, 616, 212, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.14)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Accent bar on left edge of museum plaque
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(10, 50, 5, 164);

    // Domain subtitle
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 44px "Newsreader", Georgia, serif';
    ctx.fillText(skill.subtitle, 34, 88);

    // Skill Title (italic serif)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 400 48px "Newsreader", Georgia, serif';
    ctx.fillText(skill.title, 34, 152);

    // Meta line in DM Mono
    ctx.fillStyle = 'rgba(248, 113, 113, 0.92)';
    ctx.font = '400 28px "DM Mono", monospace';
    ctx.fillText(`${skill.years}  ·  ${skill.proficiency}% CORE`, 34, 212);

    return c;
}
