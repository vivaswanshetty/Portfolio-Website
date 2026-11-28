import assert from 'node:assert/strict';
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
    VHS_ARCHIVE_ITEMS,
    arcLengthF,
    buildXScreenTable,
    computeDetailClipInset,
    computeSheetCropBackground,
    computeSvgPosterPlacement,
    computeTapeDimensions,
    computeTapePose,
    evaluateTimelineTargetYear,
    lookupXScreen,
    normalizeRelIndex,
    resolveShortestTapeTarget,
    smoothstep01,
} from '../src/utils/vhsArchiveMath.js';

// 1. Verify catalog, 4x3 covers sheet, and 12x1 spines sheet boundaries
assert.equal(VHS_ARCHIVE_ITEMS.length, 12);
assert.equal(ARCHIVE_TOTAL_TAPES, 36);
assert.equal(COVER_CELL_BOXES.length, 12);
assert.equal(SPINE_CELL_BOXES.length, 12);
assert.equal(INK_BLOT_CIRCLES.length, 7);

for (const b of COVER_CELL_BOXES) {
    assert(b.x >= 0 && b.y >= 0);
    assert(b.x + b.w <= COVERS_SHEET_W);
    assert(b.y + b.h <= COVERS_SHEET_H);
}
for (const b of SPINE_CELL_BOXES) {
    assert(b.x >= 0 && b.y >= 0);
    assert(b.x + b.w <= SPINES_SHEET_W);
    assert(b.y + b.h <= SPINES_SHEET_H);
}

// Check chronological ordering 2022 -> 2026
for (let i = 1; i < VHS_ARCHIVE_ITEMS.length; i++) {
    assert(
        VHS_ARCHIVE_ITEMS[i].year >= VHS_ARCHIVE_ITEMS[i - 1].year,
        `Items must stay chronological at index ${i}`
    );
}

// 2. Verify sheet CSS crop & SVG poster placement math
const cropBg = computeSheetCropBackground(COVERS_SHEET_W, COVERS_SHEET_H, COVER_CELL_BOXES[5]);
assert(cropBg.backgroundSize.includes('%'));
assert(cropBg.backgroundPosition.includes('%'));

const svgPlace = computeSvgPosterPlacement(COVERS_SHEET_W, COVERS_SHEET_H, COVER_CELL_BOXES[5]);
assert(svgPlace.x < 0 && svgPlace.y < 0);
assert(svgPlace.width > 474 && svgPlace.height > 900);

// 3. Verify circular relative wrapping into [-18, 18)
for (let v = 0; v < ARCHIVE_TOTAL_TAPES; v++) {
    const r = normalizeRelIndex(v, INITIAL_SCROLL_SLOT);
    assert(r >= -18 && r < 18, `Relative index out of range: ${r}`);
}
assert.equal(normalizeRelIndex(17, 17), 0);
assert.equal(normalizeRelIndex(35, 0), -1);
assert.equal(normalizeRelIndex(0, 35), 1);

// 4. Verify curved arc bowl depth, shading & center 90-degree cover pose across viewports
const viewports = [
    [1920, 1080],
    [1440, 900],
    [1280, 720],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [375, 667],
    [320, 568],
];

for (const [W, H] of viewports) {
    const isPhone = W <= 767;
    const tapeH = isPhone ? Math.min(0.62 * W, 0.35 * H) : Math.max(220, Math.min(0.42 * H, 0.3 * W, 396));
    const dims = computeTapeDimensions(tapeH, W);
    const xTable = buildXScreenTable(dims.U);

    // Monotonicity of integrated screen X
    let prevX = -Infinity;
    for (let u = -dims.U; u <= dims.U; u += 40) {
        const curX = lookupXScreen(u, xTable);
        assert(curX >= prevX, `xsc(${u}) must increase monotonically`);
        prevX = curX;
    }

    // Center active tape (r = 0)
    const center = computeTapePose(0, 0, 2, -4, dims, xTable);
    assert.equal(center.visible, true);
    assert.equal(center.o, 1);
    assert(center.z > 0, 'Active front cover pushes forward in +Z');
    assert(Math.abs(center.rotY - -94) < 1e-6, 'Center cover turns ~-90 deg + tiltY');
    assert(center.coverShade < 0.01, 'Active cover unshaded');
    assert(center.zIndex > 3000);

    // Side spines recede into -Z, turn inward, darken, and sit lower
    const left3 = computeTapePose(-3, 0, 0, 0, dims, xTable);
    const right3 = computeTapePose(3, 0, 0, 0, dims, xTable);
    assert(left3.visible && right3.visible);
    assert(left3.z < 0 && right3.z < 0, 'Flanking spines recede into depth');
    assert(left3.x < 0 && right3.x > 0, 'Flanking spines sit symmetrically left/right');
    assert(left3.y > center.y && right3.y > center.y, 'Bowl curve drops far spines vertically');
    assert(left3.spineShade > 0.1 && left3.spineShade <= 0.6);
    assert(Math.abs(arcLengthF(-3, dims) + arcLengthF(3, dims)) < 1e-6);

    // Hover lift raises non-active spine upward (smaller y)
    const liftedRight3 = computeTapePose(3, 1, 0, 0, dims, xTable);
    assert(liftedRight3.y < right3.y, 'Hovered spine must lift upward');

    // Out-of-arc cull boundary
    const farAway = computeTapePose(16, 0, 0, 0, dims, xTable);
    assert.equal(farAway.visible, false);
}

// 5. Verify timeline interpolation & wrap-boundary jump + shortest target resolution
assert(Math.abs(evaluateTimelineTargetYear(0) - VHS_ARCHIVE_ITEMS[0].year) < 1e-6);
const wrapBeforeHalf = evaluateTimelineTargetYear(11.3);
const wrapAfterHalf = evaluateTimelineTargetYear(11.7);
assert.equal(wrapBeforeHalf, VHS_ARCHIVE_ITEMS[11].year);
assert.equal(wrapAfterHalf, VHS_ARCHIVE_ITEMS[0].year);

assert.equal(Math.abs(resolveShortestTapeTarget(17, 11) - 17), 6);
assert.equal(resolveShortestTapeTarget(12, 11), 11);
assert.equal(resolveShortestTapeTarget(23, 0), 24);
assert.equal(ARCHIVE_ITEM_COUNT, 12);

// 6. Verify detail clip inset string & smoothstep bounds
assert.equal(smoothstep01(-1), 0);
assert.equal(smoothstep01(0.5), 0.5);
assert.equal(smoothstep01(2), 1);

const inset = computeDetailClipInset({ left: 100, right: 300, top: 200, bottom: 600 }, 1440, 900);
assert.equal(inset, 'inset(200.0px 1140.0px 300.0px 100.0px round 4px)');

console.log(
    `vhsArchive verification passed across ${viewports.length} viewports, 3x3/12x1 crop boxes, 36 curved tapes, timeline wrap, and detail clip math.`
);
