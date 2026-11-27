import assert from 'node:assert/strict';
import {
    mulberry32,
    computeValleyUnit,
    getValleyCenterX,
    getValleyTerrainY,
    createValleyPathPoints,
    wrapPathT,
} from '../src/utils/nightValleyMath.js';

// 1. Unit scale matches --u spec across desktop and mobile
assert.equal(computeValleyUnit(1600, 900), 1);
assert.equal(computeValleyUnit(3200, 1800), 2);
assert.equal(computeValleyUnit(820, 900), 1);
assert.equal(computeValleyUnit(390, 844), 1);

// 2. Deterministic PRNG sequence repeatability
const r1 = mulberry32(42);
const r2 = mulberry32(42);
for (let i = 0; i < 8; i++) {
    assert.equal(r1(), r2(), `PRNG diverged at index ${i}`);
}

// 3. Valley terrain stays lower along canyon floor than hillside banks
for (const z of [0, -30, -90, -140]) {
    const cx = getValleyCenterX(z);
    const centerY = getValleyTerrainY(cx, z);
    const hillLeftY = getValleyTerrainY(cx - 18, z);
    const hillRightY = getValleyTerrainY(cx + 18, z);
    assert.ok(hillLeftY > centerY + 3, `expected left ridge above canyon floor at z=${z}`);
    assert.ok(hillRightY > centerY + 3, `expected right ridge above canyon floor at z=${z}`);
}

// 4. Camera spline points sit above terrain elevation along canyon center
const pts = createValleyPathPoints(180, 16);
assert.equal(pts.length, 16);
for (const pt of pts) {
    const floor = getValleyTerrainY(pt.x, pt.z);
    assert.ok(pt.y > floor + 1.5, 'camera waypoint must remain above canyon terrain');
}

// 5. Continuous spline wrapping handles negative & overflow deltas cleanly
assert.ok(Math.abs(wrapPathT(-0.25) - 0.75) < 1e-9);
assert.ok(Math.abs(wrapPathT(1.35) - 0.35) < 1e-9);

console.log('nightValley math verification passed across unit scale, terrain canyon, spline, and wrapping.');
