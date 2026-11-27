// Pure math helpers for the 3D Night Flower Valley terrain, spline camera path, and responsive --u scale.

export const VALLEY_LOOP_LENGTH = 180;
const BASE_K = (Math.PI * 2) / VALLEY_LOOP_LENGTH;

export function mulberry32(seed = 1337) {
    let a = seed >>> 0;
    return function next() {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Matches the valley hero unit: min(vw / 1600, vh / 900), clamping cleanly to 1 on <= 820px viewports.
 */
export function computeValleyUnit(vw = 1600, vh = 900) {
    if (vw <= 820) return 1;
    const safeW = Math.max(1, vw);
    const safeH = Math.max(1, vh);
    return Math.min(safeW / 1600, safeH / 900);
}

/**
 * Center-line X meander for the winding night canyon valley (strictly periodic every 180 units).
 */
export function getValleyCenterX(z) {
    return Math.sin(z * 2 * BASE_K) * 8.5 + Math.cos(z * BASE_K) * 4.2;
}

/**
 * Terrain elevation at world (x, z): flat walkable canyon floor near the center path,
 * rising into rolling hillside ridges on both sides so flowers frame the flight corridor.
 */
export function getValleyTerrainY(x, z) {
    const center = getValleyCenterX(z);
    const distFromCenter = Math.abs(x - center);
    const canyonRise = Math.pow(Math.max(0, distFromCenter - 2.2) * 0.14, 1.55);
    const undulation =
        Math.sin(x * 0.16 + z * 3 * BASE_K) * 0.85 +
        Math.cos(z * 2 * BASE_K - x * 0.09) * 0.65 +
        Math.sin(x * 0.35 + z * 6 * BASE_K) * 0.25;
    return -3.2 + Math.min(18, canyonRise * 3.1) + undulation;
}

/**
 * Generates seamless closed-loop 3D control points descending through the valley path.
 */
export function createValleyPathPoints(loopLength = VALLEY_LOOP_LENGTH, segments = 16) {
    const points = [];
    for (let i = 0; i < segments; i++) {
        const z = -(i / segments) * loopLength;
        const cx = getValleyCenterX(z);
        const floorY = getValleyTerrainY(cx, z);
        const glideY = floorY + 2.85 + Math.sin((i / segments) * Math.PI * 4) * 0.55;
        points.push({ x: cx, y: glideY, z });
    }
    return points;
}

/**
 * Wraps normalized spline parameter t cleanly into [0, 1).
 */
export function wrapPathT(t) {
    const wrapped = t % 1;
    return wrapped < 0 ? wrapped + 1 : wrapped;
}
