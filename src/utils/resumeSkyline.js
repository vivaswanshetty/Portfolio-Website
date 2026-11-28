// Pure scroll timeline math, cubic-bezier Newton solver, Fritsch-Carlson monotone spline,
// responsive layout geometry, and chroma-key pixel logic for /resume.

export const RESUME_SKYLINE_ASSETS = {
    heroPlateUrl:
        'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261119_114206_b326116b-1b08-4b0a-95c7-e0b20c6986ee.png&w=2048&q=85',
    roomPlateUrl:
        'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261119_114205_7235737c-137f-49d3-b967-ff0d65b5c4d3.png&w=2048&q=85',
    heroVideoUrl:
        'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261119_131845_acb065cd-9dea-4e18-8f20-1d2634228a92.mp4',
};

export const PLATE_W = 2048;
export const PLATE_H = 1360;
export const VIDEO_CROP_Y = 208;
export const VIDEO_CROP_H = 1152;
export const GLASS_CX = 1025;
export const GLASS_CY = 561.5;
export const GLASS_W = 1004;
export const GLASS_H = 773;
export const STEPS_BOTTOM_Y = 860;

// Pullback curve from zoomed window glass down to full room wall (T = 8.4 .. 10.6), leaving generous card dwell
export const PULLBACK_TIMES = [8.4, 8.65, 8.95, 9.25, 9.55, 9.85, 10.1, 10.3, 10.5, 10.65, 10.85];
export const PULLBACK_LN_S = [1.93, 1.749, 1.526, 1.253, 0.956, 0.642, 0.358, 0.166, 0.058, 0, 0];

export function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}

/**
 * Evaluates cubic-bezier(x1, y1, x2, y2) at input progress t in [0, 1] using Newton-Raphson iteration.
 */
export function cubicBezier(x1, y1, x2, y2, t) {
    const u = clamp(t, 0, 1);
    if (u <= 0) return 0;
    if (u >= 1) return 1;

    const sampleX = (s) => ((1 - 3 * x2 + 3 * x1) * s + (3 * x2 - 6 * x1)) * s * s + 3 * x1 * s;
    const sampleDX = (s) => 3 * (1 - 3 * x2 + 3 * x1) * s * s + 2 * (3 * x2 - 6 * x1) * s + 3 * x1;
    const sampleY = (s) => ((1 - 3 * y2 + 3 * y1) * s + (3 * y2 - 6 * y1)) * s * s + 3 * y1 * s;

    let s = u;
    for (let i = 0; i < 6; i++) {
        const err = sampleX(s) - u;
        if (Math.abs(err) < 1e-6) break;
        const d = sampleDX(s);
        if (Math.abs(d) < 1e-6) break;
        s = clamp(s - err / d, 0, 1);
    }
    return sampleY(s);
}

/**
 * Builds a monotone Fritsch-Carlson cubic Hermite evaluator for (xs, ys).
 */
export function createMonotoneSpline(xs, ys) {
    const n = xs.length;
    const dxs = new Float64Array(n - 1);
    const ms = new Float64Array(n - 1);
    const tangents = new Float64Array(n);

    for (let i = 0; i < n - 1; i++) {
        dxs[i] = xs[i + 1] - xs[i];
        ms[i] = (ys[i + 1] - ys[i]) / dxs[i];
    }

    tangents[0] = ms[0];
    tangents[n - 1] = ms[n - 2];
    for (let i = 1; i < n - 1; i++) {
        if (ms[i - 1] * ms[i] <= 0) {
            tangents[i] = 0;
        } else {
            const w1 = 2 * dxs[i] + dxs[i - 1];
            const w2 = dxs[i] + 2 * dxs[i - 1];
            tangents[i] = (w1 + w2) / (w1 / ms[i - 1] + w2 / ms[i]);
        }
    }

    for (let i = 0; i < n - 1; i++) {
        if (ms[i] === 0) {
            tangents[i] = 0;
            tangents[i + 1] = 0;
        } else {
            const a = tangents[i] / ms[i];
            const b = tangents[i + 1] / ms[i];
            const sq = a * a + b * b;
            if (sq > 9) {
                const factor = 3 / Math.sqrt(sq);
                tangents[i] = factor * a * ms[i];
                tangents[i + 1] = factor * b * ms[i];
            }
        }
    }

    return (x) => {
        if (x <= xs[0]) return ys[0];
        if (x >= xs[n - 1]) return ys[n - 1];

        let lo = 0;
        let hi = n - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (xs[mid] <= x) lo = mid;
            else hi = mid;
        }

        const h = dxs[lo];
        const t = (x - xs[lo]) / h;
        const t2 = t * t;
        const t3 = t2 * t;
        const h00 = 2 * t3 - 3 * t2 + 1;
        const h10 = t3 - 2 * t2 + t;
        const h01 = -2 * t3 + 3 * t2;
        const h11 = t3 - t2;
        return h00 * ys[lo] + h10 * h * tangents[lo] + h01 * ys[lo + 1] + h11 * h * tangents[lo + 1];
    };
}

export const evaluatePullbackLnS = createMonotoneSpline(PULLBACK_TIMES, PULLBACK_LN_S);

/**
 * Pure per-pixel chroma green (#00FF00) alpha & spill suppressor for the room canvas.
 */
export function chromaKeyRgbaPixel(rByte, gByte, bByte, aByte) {
    if (aByte === 0) return [rByte, gByte, bByte, 0];
    const r = rByte / 255;
    const g = gByte / 255;
    const b = bByte / 255;
    const m = Math.max(r, b);
    const k = g - m;
    if (k <= 0.05) return [rByte, gByte, bByte, aByte];
    const alpha = 1 - smoothstep(0.1, 0.38, k);
    const nextG = Math.round(Math.min(g, m * 0.96) * 255);
    return [rByte, nextG, bByte, Math.round(aByte * alpha)];
}

/**
 * Computes responsive scale tokens, plate cover box, and window glass frame on screen.
 */
export function computeStageLayout(W, H, navBottom = 76) {
    const safeW = Math.max(320, W || 1440);
    const safeH = Math.max(320, H || 900);
    const phone = safeH > 1.15 * safeW;

    const s = phone
        ? Math.min(safeW / 390, safeH / 700, 1.9)
        : clamp(Math.min(safeW / 1440, safeH / 900), 0.62, 1.35);

    const sc = Math.max(safeW / PLATE_W, safeH / PLATE_H);
    const pw = PLATE_W * sc;
    const ph = PLATE_H * sc;
    const ox = (safeW - pw) / 2;
    const oy = (safeH - ph) / 2;

    const g = {
        x: ox + GLASS_CX * sc,
        y: oy + GLASS_CY * sc,
        w: GLASS_W * sc,
        h: GLASS_H * sc,
    };

    const sEnd = phone ? Math.min(1, (0.92 * safeW) / g.w) : 1;

    // Resolve card layout geometry (desktop 2x2 / landscape 1x4 / portrait 2x2)
    let cs = s;
    let phRatio = 1;
    let isLandscapeRow = false;
    let cardPositions = [];
    let cardWidthPx = 266 * cs;
    let gyEnd = g.y;

    if (phone) {
        const gap = 10 * s;
        cardWidthPx = Math.min(266 * s * 0.9, (safeW - 32 * s - gap) / 2);
        cs = cardWidthPx / 266;
        phRatio = 0.76;
        const estCardH = Math.max(150 * cs * phRatio + 86 * Math.max(cs, 0.7), 165);
        const gridTop = safeH - 16 * s - (estCardH * 2 + gap);
        const startX = (safeW - (cardWidthPx * 2 + gap)) / 2;

        cardPositions = [
            { x: startX, y: gridTop, side: 'left', bottomRow: false, width: cardWidthPx },
            { x: startX + cardWidthPx + gap, y: gridTop, side: 'right', bottomRow: false, width: cardWidthPx },
            { x: startX, y: gridTop + estCardH + gap, side: 'left', bottomRow: true, width: cardWidthPx },
            { x: startX + cardWidthPx + gap, y: gridTop + estCardH + gap, side: 'right', bottomRow: true, width: cardWidthPx },
        ];

        const minCenterForNav = navBottom + 44 * s + (g.h * sEnd) / 2;
        const maxCenterAboveCards = gridTop - 8 * s - (STEPS_BOTTOM_Y - GLASS_CY) * sc * sEnd;
        gyEnd = Math.max(minCenterForNav, Math.min(g.y, maxCenterAboveCards));
    } else {
        const topBound = Math.max(navBottom + 14 * s, 88);
        const bottomBound = safeH - 58 * s; // leaves clear bottom guide HUD lane
        const rowGap = 12 * s;
        const availH = Math.max(180, bottomBound - topBound - rowGap);

        const estimateCardH = (scale, pRatio) => {
            const imgH = 148 * scale * pRatio;
            const textBlockH = scale < 0.8 ? 88 : 74 * scale + 28 * scale;
            return imgH + textBlockH;
        };

        while (cs > 0.5 && estimateCardH(cs, phRatio) * 2 > availH) {
            cs = Math.max(0.5, cs - 0.04);
        }
        while (phRatio > 0.48 && estimateCardH(cs, phRatio) * 2 > availH) {
            phRatio = Math.max(0.48, phRatio - 0.05);
        }

        const estH = estimateCardH(cs, phRatio);
        cardWidthPx = Math.max(202, 266 * cs);

        if (estH * 2 + rowGap > availH || safeH < 515) {
            // Landscape phone 1x4 horizontal bottom dock
            isLandscapeRow = true;
            phRatio = 0.5;
            cardWidthPx = Math.min(266 * s, (safeW - 24 * s - 3 * 8 * s) / 4);
            cs = cardWidthPx / 266;
            const singleH = estimateCardH(cs, phRatio);
            const rowY = safeH - singleH - 12 * s;
            const totalW = cardWidthPx * 4 + 3 * 8 * s;
            const rowStartX = (safeW - totalW) / 2;
            const order = [0, 2, 1, 3];
            const posByCardIdx = new Array(4);
            order.forEach((cardIdx, visualPos) => {
                posByCardIdx[cardIdx] = {
                    x: rowStartX + visualPos * (cardWidthPx + 8 * s),
                    y: rowY,
                    side: visualPos < 2 ? 'left' : 'right',
                    bottomRow: visualPos === 1 || visualPos === 2,
                    width: cardWidthPx,
                };
            });
            cardPositions = posByCardIdx;
        } else {
            const topY = Math.min(Math.max(topBound, (safeH * 185) / 998), bottomBound - 2 * estH - rowGap);
            const botY = Math.max(Math.min(bottomBound - estH, (safeH * 552) / 998), topY + estH + rowGap);

            cardPositions = [
                { x: (safeW * 74) / 1418, y: topY, side: 'left', bottomRow: false, width: cardWidthPx },
                { x: (safeW * (1356 - 12)) / 1418 - cardWidthPx, y: topY, side: 'right', bottomRow: false, width: cardWidthPx },
                { x: (safeW * 182) / 1418, y: botY, side: 'left', bottomRow: true, width: cardWidthPx },
                { x: (safeW * (1248 - 12)) / 1418 - cardWidthPx, y: botY, side: 'right', bottomRow: true, width: cardWidthPx },
            ];
        }
    }

    return {
        W: safeW,
        H: safeH,
        phone,
        s,
        sc,
        pw,
        ph,
        ox,
        oy,
        g,
        sEnd,
        gyEnd,
        cs,
        phRatio,
        cardWidthPx,
        isLandscapeRow,
        cardPositions,
        travel: 2.6 * safeH,
    };
}

/**
 * Evaluates Timeline 1 (Snappy 2.8s Intro choreography so skyline, typography & CTA reveal promptly).
 */
export function evaluateIntroTimeline(I, H, s, reducedMotion = false) {
    if (reducedMotion || I >= 2.8) {
        return {
            panY: 0,
            panScale: 1,
            skyOffsetH: 0,
            headlineOffsetY: 0,
            scriptOffsetY: 0,
            metaOpacity: 1,
            metaOffsetY: 0,
        };
    }

    const panP = cubicBezier(0.22, 0.72, 0.36, 1, I / 1.35);
    const panY = lerp(0.18 * H, 0, panP);
    const panScale = lerp(1.08, 1, panP);

    let skyOffsetH = 0.22;
    if (I >= 0.25 && I < 1.05) {
        const t1 = cubicBezier(0.1, 0.88, 0.38, 1, (I - 0.25) / 0.8);
        skyOffsetH = lerp(0.22, -0.04, t1);
    } else if (I >= 1.05 && I < 1.85) {
        const t2 = cubicBezier(0.42, 0, 0.58, 1, (I - 1.05) / 0.8);
        skyOffsetH = lerp(-0.04, 0, t2);
    } else if (I >= 1.85) {
        skyOffsetH = 0;
    }

    const headP = cubicBezier(0.22, 0.75, 0.2, 1, (I - 0.45) / 1.3);
    const scriptP = cubicBezier(0.22, 0.75, 0.2, 1, (I - 0.6) / 1.35);
    const metaP = cubicBezier(0.2, 0.8, 0.25, 1, (I - 1.45) / 1.15);

    return {
        panY,
        panScale,
        skyOffsetH,
        headlineOffsetY: lerp(0.32 * H, 0, headP) + panY * 0.5,
        scriptOffsetY: lerp(0.32 * H, 0, scriptP) + panY * 0.5,
        metaOpacity: metaP,
        metaOffsetY: lerp(14 * s, 0, metaP),
    };
}

/**
 * Evaluates Timeline 2 (Scroll choreography mapped onto reel seconds T in [6.8, 13.4]).
 * Pullback completes cleanly by T=10.85, all 4 cards settle by T=12.0, leaving a steady dwell plateau (12.0..13.4).
 */
export function evaluateScrollTimeline(pCur, layout, reducedMotion = false) {
    const { W, H, s, ox, oy, g, sEnd, gyEnd } = layout;

    if (reducedMotion) {
        const settled = pCur >= 0.45;
        const gy = settled ? gyEnd : g.y;
        const R = settled
            ? {
                  left: clamp(g.x - (g.w * sEnd) / 2, 0, W),
                  top: clamp(gy - (g.h * sEnd) / 2, 0, H),
                  right: clamp(g.x + (g.w * sEnd) / 2, 0, W),
                  bottom: clamp(gy + (g.h * sEnd) / 2, 0, H),
              }
            : { left: 0, top: 0, right: W, bottom: H };
        const rw = Math.max(1, R.right - R.left);
        const rh = Math.max(1, R.bottom - R.top);
        return {
            T: settled ? 13.4 : 6.8,
            q: settled ? 1 : 0,
            S: sEnd,
            gy,
            roomVisible: settled,
            scriptOutOpacity: settled ? 0 : 1,
            scriptOutY: 0,
            headOutOpacity: settled ? 0 : 1,
            headOutY: 0,
            metaOutOpacity: settled ? 0 : 1,
            metaOutY: 0,
            push: 1,
            kc: Math.max(rw / W, rh / H),
            rcx: (R.left + R.right) / 2,
            rcy: (R.top + R.bottom) / 2,
            rBottom: R.bottom,
            roomTx: g.x - g.x * sEnd + ox * sEnd,
            roomTy: gy - g.y * sEnd + oy * sEnd,
            cardProgress: [settled ? 1 : 0, settled ? 1 : 0, settled ? 1 : 0, settled ? 1 : 0],
        };
    }

    const T = 6.8 + pCur * 6.6;

    const scriptOutP = cubicBezier(0.5, 0, 0.75, 0.4, (T - 6.82) / 0.55);
    const headOutP = cubicBezier(0.5, 0, 0.75, 0.4, (T - 6.95) / 0.6);
    const metaOutP = cubicBezier(0.5, 0, 0.75, 0.4, (T - 6.85) / 0.55);

    const pushInP = cubicBezier(0.45, 0, 0.55, 1, (T - 7.3) / 0.95);
    const lnS = T <= 8.4 ? 1.93 : evaluatePullbackLnS(T);
    const q = clamp(1 - lnS / 1.93, 0, 1);
    const S = Math.exp(lnS) * Math.pow(sEnd, q);
    const gy = lerp(g.y, gyEnd, q);

    const pushPeak = 1 + 0.28 * pushInP;
    const push = lerp(pushPeak, 1, q);

    const halfGW = (g.w * S) / 2;
    const halfGH = (g.h * S) / 2;
    const rx0 = clamp(g.x - halfGW, 0, W);
    const ry0 = clamp(gy - halfGH, 0, H);
    const rx1 = clamp(g.x + halfGW, 0, W);
    const ry1 = clamp(gy + halfGH, 0, H);
    const rw = Math.max(1, rx1 - rx0);
    const rh = Math.max(1, ry1 - ry0);
    const kc = T < 8.38 ? 1 : Math.max(rw / W, rh / H);
    const rcx = T < 8.38 ? W / 2 : (rx0 + rx1) / 2;
    const rcy = T < 8.38 ? H / 2 : (ry0 + ry1) / 2;
    const rBottom = T < 8.38 ? H : ry1;

    // Cards enter cleanly as pullback settles (T = 10.6..12.0), leaving 12.0..13.4 steady plateau
    const topCardP = cubicBezier(0.22, 0.8, 0.2, 1, (T - 10.6) / 1.15);
    const botCardP = cubicBezier(0.22, 0.8, 0.2, 1, (T - 10.85) / 1.15);

    return {
        T,
        q,
        S,
        gy,
        roomVisible: T >= 8.38,
        scriptOutOpacity: 1 - scriptOutP,
        scriptOutY: 25 * s * scriptOutP,
        headOutOpacity: 1 - headOutP,
        headOutY: 25 * s * headOutP,
        metaOutOpacity: 1 - metaOutP,
        metaOutY: 25 * s * metaOutP,
        push,
        kc,
        rcx,
        rcy,
        rBottom,
        cardProgress: [topCardP, topCardP, botCardP, botCardP],
    };
}
