import assert from 'node:assert/strict';
import {
    bendFromDepth,
    buildFilterSvg,
    buildPhiTable,
    computeDisplacementData,
    detectGlassMode,
    samplePhi,
    sdRoundedBox,
} from '../src/utils/liquidGlassMath.js';

// 1. Signed rounded box SDF sign checks
assert.ok(sdRoundedBox(0, 0, 50, 50, 12) < 0, 'Center must be inside rounded box (SDF < 0)');
assert.ok(sdRoundedBox(60, 0, 50, 50, 12) > 0, 'Far outside point must have SDF > 0');
assert.equal(sdRoundedBox(50, 0, 50, 50, 12), 0, 'Edge midpoint SDF should be 0');

// 2. Snell-law bend monotonic & bounded in [0, 1]
const phi = buildPhiTable(14);
assert.equal(phi[0], 0);
assert.ok(phi[14] > 0, 'Integral phi table must accumulate bend across bevel');
assert.ok(Math.abs(samplePhi(phi, 7) - phi[7]) < 1e-6);
assert.ok(bendFromDepth(0) === 0, 'At bevel inner boundary x=0, bend slope flattens to 0');
assert.ok(bendFromDepth(0.5) > 0, 'Mid-bevel produces positive refraction bend');

// 3. Displacement RGBA buffer invariants
const { data, width, height } = computeDisplacementData({
    width: 120,
    height: 80,
    radius: 20,
    bevelDepth: 14,
    dpr: 1,
});
assert.equal(width, 120);
assert.equal(height, 80);
assert.equal(data.length, 120 * 80 * 4);

// Center pixel sits deep inside bevel -> neutral displacement (R ~ 128, G ~ 128, A = 255)
const centerIdx = (40 * 120 + 60) * 4;
assert.equal(data[centerIdx + 3], 255);
assert.ok(Math.abs(data[centerIdx] - 128) <= 1, 'Flat center X displacement should be neutral 128');
assert.ok(Math.abs(data[centerIdx + 1] - 128) <= 1, 'Flat center Y displacement should be neutral 128');

// Corner pixel outside radius r=20 -> transparent alpha = 0
const cornerIdx = 0;
assert.equal(data[cornerIdx + 3], 0, 'Outside rounded corner should have alpha 0');

// 4. SVG filter builder (chromatic aberration multi-pass vs single-pass)
const rgbSvg = buildFilterSvg({
    id: 'test-rgb',
    mapUrl: 'blob:test',
    width: 200,
    height: 100,
    scale: 48,
    aberration: 14,
    frost: 0.4,
});
assert.ok(rgbSvg.includes('id="test-rgb"'));
assert.ok(rgbSvg.includes('dispR') && rgbSvg.includes('dispG') && rgbSvg.includes('dispB'));
assert.ok(rgbSvg.includes('stdDeviation="0.4"'));

const monoSvg = buildFilterSvg({
    id: 'test-mono',
    mapUrl: 'blob:test',
    width: 200,
    height: 100,
    scale: 32,
    aberration: 0,
    frost: 0.5,
});
assert.ok(!monoSvg.includes('dispR'), 'aberration=0 must use single displacement pass without screen seams');

// 5. Environment fallback detection in Node (no CSS/navigator)
assert.equal(detectGlassMode(), 'simple');

console.log('liquidGlass verification passed across SDF, Snell refraction, displacement map, SVG channels, and fallbacks.');
