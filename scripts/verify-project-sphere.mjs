import assert from 'node:assert/strict';
import {
    buildSpherePoints,
    computeSphereLayout,
    computeCardDepthStyle,
    computeScrollDolly,
} from '../src/utils/projectSphere.js';

// 1. Fibonacci sphere uniform unit distribution check (N=21)
const points = buildSpherePoints(21);
assert.equal(points.length, 21);
assert.ok(Math.abs(points[0].y - 1) < 1e-9, 'first point sits at north pole y=1');
assert.ok(Math.abs(points[20].y + 1) < 1e-9, 'last point sits at south pole y=-1');
for (const p of points) {
    const norm = Math.hypot(p.x, p.y, p.z);
    assert.ok(Math.abs(norm - 1) < 1e-6, `unit norm expected 1, got ${norm}`);
}

// 2. Breakpoint sphere & headline width geometry across spec screen sizes
const specs = [
    { w: 1440, h: 900, persp: 1150, decode: 760 },
    { w: 900, h: 900, persp: 920, decode: 640 },
    { w: 640, h: 800, persp: 760, decode: 520 },
    { w: 380, h: 660, persp: 620, decode: 420 },
];

for (const s of specs) {
    const m = computeSphereLayout(s.w, s.h);
    assert.equal(m.persp, s.persp);
    assert.equal(m.cardDecodeMax, s.decode);
    assert.ok(m.cw >= 72, `cw ${m.cw} below min 72`);
    assert.ok(m.R <= 480, `radius ${m.R} exceeded 480 cap`);
    assert.ok(Math.abs(m.cardHeightLandscape - m.cw / 1.5) < 0.01);
    assert.ok(Math.abs(m.cardHeightTall - m.cw * 1.25) < 0.01);
}

// 3. Depth wash & near-plane fade boundaries
const front = computeCardDepthStyle({
    unitVec: { x: 0, y: 0, z: 1 },
    sxDeg: 0,
    syDeg: 0,
    R: 350,
    camZ: 0,
    perspective: 1150,
    scrollP: 0,
    isFocused: false,
    hasLit: false,
});
assert.equal(front.dim, 0, 'front-most card at rest should have 0 black wash');
assert.equal(front.opacity, 1);

const back = computeCardDepthStyle({
    unitVec: { x: 0, y: 0, z: -1 },
    sxDeg: 0,
    syDeg: 0,
    R: 350,
    camZ: 0,
    perspective: 1150,
    scrollP: 0,
    isFocused: false,
    hasLit: false,
});
assert.ok(back.dim > 0.8 && back.dim <= 0.86, `expected deep wash on back card, got ${back.dim}`);

const litFocused = computeCardDepthStyle({
    unitVec: { x: 0, y: 0, z: 1 },
    sxDeg: 0,
    syDeg: 0,
    R: 350,
    camZ: 0,
    perspective: 1150,
    scrollP: 0,
    isFocused: true,
    hasLit: true,
});
assert.equal(litFocused.opacity, 0, 'focused card fades out when replaced by lightbox plate');

// 4. Scroll dolly zoom clamp along 110vh track (1.1 * vh = 990px at 900vh)
const midScroll = computeScrollDolly(495, 900, 400);
assert.ok(Math.abs(midScroll.p - 0.5) < 0.01);
const overScroll = computeScrollDolly(1200, 900, 400);
assert.equal(overScroll.p, 1);
assert.equal(overScroll.camZTarget, 340);

// 5. Initial landing portal clearance (spin=255, tilt=22) keeps front cards clear of headline band
{
    const sy = 255;
    const sx = 22;
    const radY = (sy * Math.PI) / 180;
    const radX = (sx * Math.PI) / 180;
    const m = computeSphereLayout(1440, 900);
    const hlHalfW = m.headlineWidth / 2;
    const hlHalfH = 26;
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const py = -p.y;
        const z1 = py * Math.sin(radX) + p.z * Math.cos(radX);
        const y1 = py * Math.cos(radX) - p.z * Math.sin(radX);
        const x2 = p.x * Math.cos(radY) + z1 * Math.sin(radY);
        const z2 = -p.x * Math.sin(radY) + z1 * Math.cos(radY);
        if (z2 > -0.15) {
            const s = m.persp / (m.persp - z2 * m.R);
            const cx = x2 * m.R * s;
            const cy = y1 * m.R * s;
            const hw = (m.cw / 2) * s;
            const hh = ((i >= 18 ? m.cw * 1.25 : m.cw / 1.5) / 2) * s;
            const overlapsX = Math.abs(cx) < hlHalfW + hw;
            const overlapsY = Math.abs(cy) < hlHalfH + hh;
            assert.ok(!(overlapsX && overlapsY), `card ${i} overlaps resting headline box`);
        }
    }
}

console.log('projectSphere verification passed across lattice, breakpoints, depth, dolly zoom, and landing clearance.');
