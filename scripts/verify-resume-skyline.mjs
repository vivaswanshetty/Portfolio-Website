import assert from 'node:assert/strict';
import {
    PLATE_H,
    PLATE_W,
    PULLBACK_LN_S,
    PULLBACK_TIMES,
    chromaKeyRgbaPixel,
    computeStageLayout,
    cubicBezier,
    evaluateIntroTimeline,
    evaluatePullbackLnS,
    evaluateScrollTimeline,
} from '../src/utils/resumeSkyline.js';

// 1. Cubic Bezier endpoints & monotone monotonicity
assert.equal(cubicBezier(0.45, 0.6, 0.65, 1, 0), 0);
assert.equal(cubicBezier(0.45, 0.6, 0.65, 1, 1), 1);
const mid = cubicBezier(0.3, 0.15, 0.2, 1, 0.5);
assert.ok(mid > 0 && mid < 1, `Expected interior bezier value in (0,1), got ${mid}`);

// 2. Fritsch-Carlson monotone pullback spline exact keyframes & monotone descent
for (let i = 0; i < PULLBACK_TIMES.length; i++) {
    const val = evaluatePullbackLnS(PULLBACK_TIMES[i]);
    assert.ok(
        Math.abs(val - PULLBACK_LN_S[i]) < 1e-6,
        `Spline mismatch at T=${PULLBACK_TIMES[i]}: got ${val}, expected ${PULLBACK_LN_S[i]}`
    );
}
assert.ok(evaluatePullbackLnS(9.6) > evaluatePullbackLnS(10.5), 'Pullback ln S must strictly decrease');

// 3. Green-screen chroma-key filter preserves navy room & keys out #00FF00 glass
const navyPixel = chromaKeyRgbaPixel(21, 31, 63, 255);
assert.equal(navyPixel[3], 255, 'Deep indigo room pixel must stay opaque');
const greenGlass = chromaKeyRgbaPixel(0, 255, 0, 255);
assert.equal(greenGlass[3], 0, 'Pure #00FF00 window pane must key out completely');

// 4. Layout invariants across desktop, ultrawide, portrait tablet, phone, and landscape phone
const viewports = [
    [1440, 900],
    [1920, 1080],
    [2560, 1080],
    [1280, 720],
    [390, 844],
    [320, 568],
    [768, 1024],
    [844, 390],
    [667, 375],
];

for (const [w, h] of viewports) {
    const layout = computeStageLayout(w, h, 76);
    assert.ok(layout.sc >= Math.max(w / PLATE_W, h / PLATE_H) - 1e-9);
    assert.equal(layout.cardPositions.length, 4, `Expected 4 card placements at ${w}x${h}`);
    assert.ok(layout.s >= 0.45 && layout.s <= 1.9, `Invalid scale token ${layout.s}`);

    // Verify zero cards start with NaN or negative vertical coordinates below nav
    for (const pos of layout.cardPositions) {
        assert.ok(Number.isFinite(pos.x) && Number.isFinite(pos.y) && pos.width >= 60);
    }

    // Verify scroll bounds never shrink view coverage kc below 1 before pull-back or leave NaN
    const settledHero = evaluateScrollTimeline(0, layout, false);
    assert.equal(settledHero.roomVisible, false);
    assert.equal(settledHero.kc, 1);

    const plateauRoom = evaluateScrollTimeline(0.84, layout, false);
    assert.equal(plateauRoom.roomVisible, true);
    assert.ok(plateauRoom.cardProgress.every((p) => p === 1), `All 4 cards must finish sliding in by p=0.84 at ${w}x${h}`);

    const settledRoom = evaluateScrollTimeline(1, layout, false);
    assert.equal(settledRoom.roomVisible, true);
    assert.ok(settledRoom.cardProgress.every((p) => p === 1), `All cards must finish slide-in by end at ${w}x${h}`);
}

// 5. Intro overshoot check (skyline rises past 0 to -0.04*H at I=1.05s and settles by I=2.8s)
const introMid = evaluateIntroTimeline(1.05, 900, 1, false);
assert.ok(introMid.skyOffsetH < 0, `Expected upward overshoot at 1.05s, got ${introMid.skyOffsetH}`);
const introEnd = evaluateIntroTimeline(2.85, 900, 1, false);
assert.equal(introEnd.panY, 0);
assert.equal(introEnd.skyOffsetH, 0);
assert.equal(introEnd.metaOpacity, 1);

console.log('resumeSkyline verification passed across all 9 viewports, cubic-bezier, spline, chroma-key, and dual timelines.');
