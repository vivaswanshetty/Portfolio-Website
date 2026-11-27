import assert from 'node:assert/strict';
import {
    computeStageImageWidth,
    computeStageBox,
    computeHeadlineLayout,
    computeTiltVideoTarget,
    kfOffset,
    buildHeroImageUrls,
} from '../src/utils/heroMetrics.js';

// Check checked viewport matrix from spec:
// 1440x900, 1536x686, 390x844, 360x640, 844x390, 768x1024
const viewports = [
    { w: 1440, h: 900, navBottom: 74, expectPortrait: false },
    { w: 1536, h: 686, navBottom: 74, expectPortrait: false },
    { w: 390, h: 844, navBottom: 65, expectPortrait: true },
    { w: 360, h: 640, navBottom: 65, expectPortrait: true },
    { w: 844, h: 390, navBottom: 60, expectPortrait: false },
    { w: 768, h: 1024, navBottom: 65, expectPortrait: true },
];

for (const vp of viewports) {
    const stage = computeStageBox(vp.w, vp.h);
    assert(stage.width >= vp.w, `stage width (${stage.width}) must cover viewport width (${vp.w})`);
    assert(stage.height >= stage.heroHeight, `stage height (${stage.height}) must cover hero height (${stage.heroHeight})`);
    assert.ok(Math.abs(stage.width / stage.height - 16 / 9) < 0.001, 'stage must maintain 16:9 aspect');

    const imgW = computeStageImageWidth(vp.w, vp.h, 1);
    assert.equal(imgW % 100, 0, 'image width on 1x should be rounded up to multiple of 100');
    assert.ok(imgW >= 800 && imgW <= 2000, `image width (${imgW}) out of bounds`);

    const layout = computeHeadlineLayout({
        viewportW: vp.w,
        viewportH: vp.h,
        navBottom: vp.navBottom,
        wordWidthAt100: 415,
    });

    assert.equal(layout.isPortrait, vp.expectPortrait, `portrait detection mismatch for ${vp.w}x${vp.h}`);
    assert.equal(layout.baselinePct, vp.expectPortrait ? 0.362 : 0.43);

    const renderedWordWidth = (layout.wordSize * 415) / 100;
    assert.ok(renderedWordWidth <= vp.w * 0.92 + 0.5, `word overflows 92% of viewport at ${vp.w}x${vp.h}`);
    assert.ok(renderedWordWidth <= stage.width * 0.625 + 0.5, `word overflows 62.5% of stage at ${vp.w}x${vp.h}`);

    const urls = buildHeroImageUrls(imgW);
    for (const url of Object.values(urls)) {
        assert.ok(url.includes(`w=${imgW}`), 'resizer URL must embed computed width');
        assert.ok(url.startsWith('https://images.higgs.ai/'), 'image URL must route through higgs resizer');
    }
}

// Check tilt video playback synchronization bounds
const pre = computeTiltVideoTarget({ elapsedMs: 1000, clipDuration: 5.04, currentVideoTime: 0 });
assert.equal(pre.active, false);
assert.equal(pre.ended, false);

const mid = computeTiltVideoTarget({ elapsedMs: 2050, clipDuration: 5.04, currentVideoTime: 2.52 });
assert.equal(mid.active, true);
assert.ok(Math.abs(mid.rate - 3.15) < 0.02, `expected base rate ~3.15, got ${mid.rate}`);

const driftBehind = computeTiltVideoTarget({ elapsedMs: 2050, clipDuration: 5.04, currentVideoTime: 0 });
assert.ok(driftBehind.rate <= 3.15 * 1.2 + 0.001, 'rate must clamp <= 1.2x base rate');

const post = computeTiltVideoTarget({ elapsedMs: 2900, clipDuration: 5.04, currentVideoTime: 5.0 });
assert.equal(post.ended, true);

// Keyframe offsets bounds check
assert.equal(kfOffset(0), 0);
assert.equal(kfOffset(7400), 1);
assert.ok(kfOffset(1130) > 0.15 && kfOffset(1130) < 0.16);

console.log('heroMetrics verification passed across all 6 viewports and timeline checks.');
