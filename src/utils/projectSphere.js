// Pure math & responsive layout helpers for the 3D Fibonacci project sphere archive.

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Generates N uniformly distributed unit vectors + spherical Euler angles
 * using a Fibonacci lattice so cards wrap evenly without polar clumping.
 */
export function buildSpherePoints(count = 21) {
    const points = [];
    for (let i = 0; i < count; i++) {
        const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
        const rad = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = i * GOLDEN_ANGLE;
        const x = Math.cos(theta) * rad;
        const z = Math.sin(theta) * rad;
        const lat = (Math.asin(y) * 180) / Math.PI;
        const lon = (Math.atan2(x, z) * 180) / Math.PI;
        points.push({ x, y, z, lat, lon });
    }
    return points;
}

/**
 * Computes responsive sphere radius R, card width cw, CSS perspective,
 * headline box width --hw, and canvas downscale cap for each breakpoint.
 */
export function computeSphereLayout(vw, vh) {
    const hr = vw <= 380 ? 0.38 : vw <= 640 ? 0.42 : 0.46;
    const wr = vw <= 380 ? 0.48 : vw <= 640 ? 0.52 : 0.58;
    const floor = vw <= 380 ? 108 : vw <= 640 ? 120 : 155;

    const R = Math.max(floor, Math.min(480, vh * hr, vw * wr));
    const scale = vw <= 380 ? 0.44 : vw <= 640 ? 0.46 : 0.47;
    const cw = Math.round(Math.max(72, R * scale));

    const persp =
        vw <= 380 ? 620 : vw <= 640 ? 760 : vw <= 900 ? 920 : 1150;

    const cardDecodeMax =
        vw <= 380 ? 420 : vw <= 640 ? 520 : vw <= 900 ? 640 : 760;

    const headlineWidth =
        vw <= 380
            ? Math.min(vw * 0.88, 320)
            : vw <= 640
            ? Math.min(vw * 0.84, 360)
            : Math.min(vw * 0.56, 640);

    return {
        R,
        cw,
        cardHeightLandscape: cw / 1.5,
        cardHeightTall: cw * 1.25,
        persp,
        cardDecodeMax,
        headlineWidth,
    };
}

/**
 * Evaluates normalized world-space depth zf in [-1, 1], diffuse dark wash --d,
 * and near-plane fade opacity matching `rotateY(sy deg) rotateX(sx deg)`.
 */
export function computeCardDepthStyle({
    unitVec,
    sxDeg,
    syDeg,
    R,
    camZ,
    perspective,
    scrollP,
    isFocused = false,
    hasLit = false,
}) {
    const radX = (sxDeg * Math.PI) / 180;
    const radY = (syDeg * Math.PI) / 180;

    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    // Note: card position uses -y * R in CSS screen coordinates
    const py = -unitVec.y;
    const z1 = py * sinX + unitVec.z * cosX;
    const zf = -unitVec.x * sinY + z1 * cosY;

    const clampedT = Math.max(0, Math.min(1, (zf + 1) / 2));
    const base = 0.14 + 0.86 * Math.pow(clampedT, 0.85);
    const shade = 1 - Math.min(1, scrollP * 1.6);
    let dim = shade * (1 - base);

    const absZ = zf * R + camZ;
    const near = perspective * 0.66;
    let fade = absZ > near ? Math.max(0, 1 - (absZ - near) / 190) : 1;

    if (hasLit) {
        dim = Math.min(1, dim + 0.78);
        if (isFocused) {
            fade = 0;
        }
    }

    return {
        zf,
        dim: Number(dim.toFixed(3)),
        opacity: Number(fade.toFixed(3)),
    };
}

/**
 * Computes scroll progress [0..1] along the 16vh zoom track and target dolly camZ.
 */
export function computeScrollDolly(scrollY, vh, R) {
    const maxScroll = Math.max(1, vh * 0.16);
    const p = Math.max(0, Math.min(1, scrollY / maxScroll));
    const camZTarget = p * Math.min(64, R * 0.12);
    return { p, maxScroll, camZTarget };
}
