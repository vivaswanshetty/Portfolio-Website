// Pure layout geometry, media URL builders, and animation timing constants
// for the 3D rainy-harbour penthouse hero sequence.

const HIGGS_BASE = 'https://images.higgs.ai/?default=1&output=webp&url=';
const CF_ROOT = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P';

const RAW_IMAGES = {
    doors: `${CF_ROOT}/hf_20261117_063048_97fd9a70-adbe-46bd-bfce-ec1004f6c7d8.png`,
    aerial: `${CF_ROOT}/hf_20261117_063055_ee1debcd-d200-484f-b94f-fad6dcffd4eb.png`,
    back: `${CF_ROOT}/hf_20261117_063251_24fbd7cc-00df-49ec-8fbf-d8a0349b1e98.png`,
    mid: `${CF_ROOT}/hf_20261117_063252_b9f2fecf-9be0-485f-842f-3aa6bbc251f2.png`,
    front: `${CF_ROOT}/hf_20261117_063151_7804d758-a2eb-4499-9b56-8f493edbb206.png`,
};

export const HERO_VIDEOS = {
    tilt: `${CF_ROOT}/hf_20261117_063355_a600befc-45d6-4a32-9db6-9d6565a89609.mp4`,
    rain: `${CF_ROOT}/hf_20261117_063703_04e54df7-2236-4dff-b95b-a9a34c1f78ec.mp4`,
};

export const HERO_COPY = {
    kicker: 'Building High-Impact',
    word: 'Vivaswan',
    ariaLabel: 'Building High-Impact Vivaswan',
};

export const INTRO_DURATION_MS = 7400;
export const FAILSAFE_START_MS = 5000;
export const PRE_START_SETTLE_MS = 120;
export const RAIN_LOOP_DURATION_SEC = 3.6;
export const RAIN_CROSSFADE_TRIGGER_SEC = 3.6 - 0.75; // 2.85s

/**
 * Computes the optimal images.higgs.ai `w=` parameter rounded up to the next 100.
 */
export function computeStageImageWidth(viewportW, viewportH, dpr = 1) {
    const safeH = Math.max(viewportH, 520);
    const stageWidth = Math.max(viewportW, (safeH * 16) / 9);
    const scale = dpr > 1 ? Math.min(dpr, 1.35) : 1;
    const rounded = Math.ceil((stageWidth * scale) / 100) * 100;
    return Math.min(2000, Math.max(800, rounded));
}

export function buildHeroImageUrls(width = 2000) {
    const build = (raw) => `${HIGGS_BASE}${encodeURIComponent(raw)}&w=${width}&q=85`;
    return {
        doors: build(RAW_IMAGES.doors),
        aerial: build(RAW_IMAGES.aerial),
        back: build(RAW_IMAGES.back),
        mid: build(RAW_IMAGES.mid),
        front: build(RAW_IMAGES.front),
    };
}

/**
 * Computes the 16:9 cover stage dimensions centered inside the hero container.
 */
export function computeStageBox(viewportW, viewportH) {
    const heroH = Math.max(viewportH, 520);
    const width = Math.max(viewportW, (heroH * 16) / 9);
    const height = (width * 9) / 16;
    return { width, height, heroHeight: heroH };
}

/**
 * Computes responsive headline size, baseline %, kicker size, and offsets.
 * Enforces width fit against stage (62.5%), viewport (92%), and vertical nav gap (/ 0.88).
 */
export function computeHeadlineLayout({
    viewportW,
    viewportH,
    navBottom = 72,
    wordWidthAt100 = 415,
}) {
    const { width: stageW, height: stageH, heroHeight } = computeStageBox(viewportW, viewportH);
    const isPortrait = viewportH > 1.2 * viewportW;
    const baselinePct = isPortrait ? 0.362 : 0.43;

    // Stage vertical offset inside hero (negative when stage taller than hero)
    const stageTopInHero = (heroHeight - stageH) / 2;
    const baselineInHero = stageTopInHero + baselinePct * stageH;

    const wordWidthPerEm = Math.max(wordWidthAt100 / 100, 1);

    const sizeFromStage = (0.625 * stageW) / wordWidthPerEm;
    const sizeFromViewport = (0.92 * viewportW) / wordWidthPerEm;

    const minTopInHero = navBottom + 0.035 * Math.min(viewportH, heroHeight);
    const availableGap = Math.max(48, baselineInHero - minTopInHero);
    const sizeFromGap = availableGap / 0.88;

    const wordSize = Math.max(44, Math.min(sizeFromStage, sizeFromViewport, sizeFromGap));
    const kickerSize = Math.max(11, 0.118 * wordSize);

    // Kicker rests cleanly above x-height lowercase letters ('ivaswan'), shifted right to clear capital 'V'
    const kickerBottomFromBaseline = 0.61 * wordSize;
    const kickerShiftX = 0.22 * wordSize;

    return {
        stageW,
        stageH,
        heroHeight,
        isPortrait,
        baselinePct,
        wordSize,
        kickerSize,
        kickerBottomFromBaseline,
        kickerShiftX,
    };
}

/**
 * Calculates damped playback rate nudged toward the linear target frame during 1.25s -> 2.85s.
 */
export function computeTiltVideoTarget({ elapsedMs, clipDuration = 5.04, currentVideoTime = 0 }) {
    const startMs = 1250;
    const endMs = 2850;
    const windowSec = (endMs - startMs) / 1000;
    const baseRate = clipDuration / windowSec;

    if (elapsedMs < startMs) {
        return { active: false, ended: false, targetTime: 0, rate: baseRate };
    }
    if (elapsedMs >= endMs) {
        return { active: false, ended: true, targetTime: clipDuration, rate: baseRate };
    }

    const progress = (elapsedMs - startMs) / (endMs - startMs);
    const targetTime = progress * clipDuration;
    const drift = targetTime - currentVideoTime;
    const nudgedRate = Math.min(
        baseRate * 1.2,
        Math.max(baseRate * 0.85, baseRate + drift * 2.5)
    );

    return { active: true, ended: false, targetTime, rate: nudgedRate };
}

/**
 * Converts a timestamp in ms to normalized Web Animations API keyframe offset [0, 1].
 */
export const kfOffset = (ms) => Math.min(1, Math.max(0, ms / INTRO_DURATION_MS));
