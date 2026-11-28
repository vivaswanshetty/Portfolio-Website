import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SKILLS_GALLERY_ITEMS } from '../src/data/skillsGalleryData.js';
import {
    ROOM,
    SHEET_HEIGHT,
    SHEET_WIDTH,
    buildCorridorFramePlacements,
    computeDomCropStyle,
    easeOutCubic,
    easeOutExpo,
    easeOutQuad,
    easeOutQuart,
    findNearestOuterPlacement,
    getFocusPose,
    getSheetCellCrop,
    getSkillGalleryUnits,
    getWalkOffset,
    getWalkPose,
    interpolateFocusPose,
    poseToCameraVectors,
    resolveShortestAngle,
    stepWalkSlot,
} from '../src/utils/skillsGallery.js';

// 1. Validate 9 skill capabilities & valid project slug cross-references
assert.equal(SKILLS_GALLERY_ITEMS.length, 9, 'Expected 9 skill gallery plates for 3x3 grid');
const portfolioSource = fs.readFileSync(new URL('../src/data/portfolioData.js', import.meta.url), 'utf8');
const validProjectSlugs = new Set(
    [...portfolioSource.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
);
for (let i = 0; i < 9; i++) {
    const item = SKILLS_GALLERY_ITEMS[i];
    assert.equal(item.index, i, `Skill ${item.id} index mismatch`);
    assert.ok(item.proficiency >= 50 && item.proficiency <= 100, `Invalid proficiency on ${item.id}`);
    assert.equal(item.layers.length, 3, `${item.id} must have 3 focus layers`);
    assert.equal(item.scaleTiers.length, 4, `${item.id} must have 4 scale tiers`);
    assert.equal(item.verificationModes.length, 2, `${item.id} must have 2 verification modes`);
    assert.equal(item.accordions.length, 3, `${item.id} must have 3 accordion sections`);
    for (const proj of item.relatedProjects) {
        assert.ok(validProjectSlugs.has(proj.slug), `Invalid project slug ${proj.slug} on ${item.id}`);
    }
}

// 2. Validate 3x3 master sheet cell crops & DOM background scaling math
for (let i = 0; i < 9; i++) {
    const crop = getSheetCellCrop(i);
    assert.ok(crop.x >= 6 && crop.y >= 6, `Crop origin must respect 6px gutter for i=${i}`);
    assert.ok(crop.w > 550 && crop.w < 570, `Unexpected crop width ${crop.w}`);
    assert.ok(crop.h > 750 && crop.h < 775, `Unexpected crop height ${crop.h}`);
    assert.ok(crop.repeatX > 0 && crop.repeatX < 0.34);
    assert.ok(crop.repeatY > 0 && crop.repeatY < 0.34);
    assert.ok(crop.offsetX >= 0 && crop.offsetX < 1);
    assert.ok(crop.offsetY >= 0 && crop.offsetY < 1);

    const domCrop = computeDomCropStyle(crop, 360, 484);
    assert.equal(domCrop.backgroundRepeat, 'no-repeat');
    assert.ok(domCrop.bgW > 1000 && domCrop.bgH > 1300);
    assert.equal(Math.round(domCrop.bgW - SHEET_WIDTH * domCrop.sx), 0);
    assert.equal(Math.round(domCrop.bgH - SHEET_HEIGHT * domCrop.sy), 0);
}

// 3. Corridor geometry & 60 frame placements (36 outer, 24 inner)
const placements = buildCorridorFramePlacements();
assert.equal(placements.length, 60);
const outer = placements.filter((p) => p.wall === 'outer');
const inner = placements.filter((p) => p.wall === 'inner');
assert.equal(outer.length, 36);
assert.equal(inner.length, 24);
assert.equal(outer[0].skillIdx, 0);
assert.equal(inner[0].skillIdx, 4);
assert.ok(Math.abs(ROOM.PW * 763 - ROOM.PH * 567) < 1e-6, 'Print aspect ratio mismatch');

// 4. Camera forward tangent & facing normals (center of ring stays on left, walking decreases th)
const walkVec = poseToCameraVectors(getWalkPose(0, false));
assert.ok(walkVec.dir[2] < 0, 'At th=0, walk view must point forward along -Z so center is on the left');

const focusOuterVec = poseToCameraVectors(getFocusPose('outer', 0, 0, false));
assert.ok(focusOuterVec.dir[0] > 0.99, 'Focus on outer wall at th=0 must look outward (+X)');
const focusInnerVec = poseToCameraVectors(getFocusPose('inner', 0, 0, false));
assert.ok(focusInnerVec.dir[0] < -0.99, 'Focus on inner wall at th=0 must look inward (-X)');

// 5. Shortest angle wrap across multiple corridor laps & staggered focus interpolation
const lapTh = Math.PI * 6 + 0.1;
const shortAng = resolveShortestAngle(0.05, lapTh);
assert.ok(Math.abs(shortAng - lapTh) <= Math.PI + 1e-9, `Must pick closest copy within +-PI, got diff ${shortAng - lapTh}`);

assert.ok(easeOutQuart(0.5) > easeOutQuad(0.5), 'Travel (quart) must lead turn (quad)');
assert.equal(easeOutCubic(1), 1);
assert.equal(easeOutExpo(1), 1);

const focusFrom = getWalkPose(0.5, false);
const focusTo = getFocusPose('outer', 0.0, 0.5, false);
const mid = interpolateFocusPose(focusFrom, focusTo, 0.5);
const quartMid = focusFrom.th + (focusTo.th - focusFrom.th) * easeOutQuart(0.5);
assert.ok(Math.abs(mid.th - quartMid) < 1e-9);

// 6. Discrete slot stepping & returning to nearest outer print
const D = getWalkOffset(false);
const nextTarget = stepWalkSlot(D, D, 1);
assert.ok(nextTarget < D, 'Next step forward must decrease target angle');
const { placement } = findNearestOuterPlacement(placements, 2, -0.1);
assert.equal(placement.skillIdx, 2);
assert.equal(placement.wall, 'outer');

// 7. Unit system checks
const deskUnits = getSkillGalleryUnits(1440, 900, false);
assert.equal(deskUnits.u, 1);
assert.equal(deskUnits.w, 1);
const ultraWide = getSkillGalleryUnits(2560, 1080, false);
assert.ok(ultraWide.u < ultraWide.w, 'Ultrawide u stays height-bounded while w scales by width');
const mobileUnits = getSkillGalleryUnits(375, 812, true);
assert.deepEqual(mobileUnits, { u: 1, w: 1 });

console.log('skillsGallery verification passed across 3x3 crops, 60 frames, corridor camera math, easing, and units.');
