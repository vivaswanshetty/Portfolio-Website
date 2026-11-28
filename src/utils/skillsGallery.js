// Pure corridor geometry, 3x3 sheet crop math, pose easing, and responsive layout helpers
// for the 3D curved Skills & Capabilities Gallery on /skills.

export const SHEET_WIDTH = 1744;
export const SHEET_HEIGHT = 2336;
export const GUTTER_INSET = 6;

export const COL_RANGES = [
    [0, 575],
    [585, 1158],
    [1168, 1743],
];

export const ROW_RANGES = [
    [0, 769],
    [779, 1545],
    [1555, 2335],
];

export const SMALL_SCREEN_MEDIA_QUERY =
    '(max-width: 819px), ((orientation: portrait) and (max-width: 1100px)), ((orientation: landscape) and (max-height: 500px))';

export const ROOM = {
    R: 18,
    RIN: 12.2,
    H: 6.2,
    PW: 1.36,
    PH: (1.36 * 763) / 567,
    PY: 1.95,
    OUTER_COUNT: 36,
    INNER_COUNT: 24,
    STEP: (Math.PI * 2) / 36,
    OUTER_FRAME_R: 17.98,
    INNER_FRAME_R: 12.22,
};

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function easeOutQuad(t) {
    const x = clamp(t, 0, 1);
    return 1 - Math.pow(1 - x, 2);
}

export function easeOutCubic(t) {
    const x = clamp(t, 0, 1);
    return 1 - Math.pow(1 - x, 3);
}

export function easeOutQuart(t) {
    const x = clamp(t, 0, 1);
    return 1 - Math.pow(1 - x, 4);
}

export function easeOutExpo(t) {
    const x = clamp(t, 0, 1);
    return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

/**
 * Returns source-pixel & normalized UV crop coordinates for item i (0..8) in the 3x3 sheet.
 */
export function getSheetCellCrop(index) {
    const i = ((index % 9) + 9) % 9;
    const col = i % 3;
    const row = Math.floor(i / 3);
    const [colStart, colEnd] = COL_RANGES[col];
    const [rowStart, rowEnd] = ROW_RANGES[row];

    const x = colStart + GUTTER_INSET;
    const y = rowStart + GUTTER_INSET;
    const w = colEnd - colStart - GUTTER_INSET * 2;
    const h = rowEnd - rowStart - GUTTER_INSET * 2;

    return {
        index: i,
        col,
        row,
        x,
        y,
        w,
        h,
        repeatX: w / SHEET_WIDTH,
        repeatY: h / SHEET_HEIGHT,
        offsetX: x / SHEET_WIDTH,
        offsetY: 1 - (y + h) / SHEET_HEIGHT,
    };
}

/**
 * Computes CSS background-size & background-position strings matching an exact sheet crop
 * for a DOM box of size targetW x targetH.
 */
export function computeDomCropStyle(crop, targetW, targetH) {
    const safeW = Math.max(1, targetW);
    const safeH = Math.max(1, targetH);
    const sx = safeW / crop.w;
    const sy = safeH / crop.h;
    const bgW = SHEET_WIDTH * sx;
    const bgH = SHEET_HEIGHT * sy;
    const posX = -crop.x * sx;
    const posY = -crop.y * sy;

    return {
        sx,
        sy,
        bgW,
        bgH,
        posX,
        posY,
        backgroundSize: `${bgW.toFixed(2)}px ${bgH.toFixed(2)}px`,
        backgroundPosition: `${posX.toFixed(2)}px ${posY.toFixed(2)}px`,
        backgroundRepeat: 'no-repeat',
    };
}

/**
 * Builds the 60 static corridor frame placements (36 outer right wall, 24 inner left wall).
 */
export function buildCorridorFramePlacements() {
    const placements = [];

    for (let s = 0; s < ROOM.OUTER_COUNT; s++) {
        placements.push({
            slotId: `outer-${s}`,
            wall: 'outer',
            slotIndex: s,
            skillIdx: s % 9,
            angle: s * ROOM.STEP,
            radius: ROOM.OUTER_FRAME_R,
        });
    }

    for (let k = 0; k < ROOM.INNER_COUNT; k++) {
        placements.push({
            slotId: `inner-${k}`,
            wall: 'inner',
            slotIndex: k,
            skillIdx: (k + 4) % 9,
            angle: ((k + 0.5) * Math.PI * 2) / ROOM.INNER_COUNT,
            radius: ROOM.INNER_FRAME_R,
        });
    }

    return placements;
}

export function getWalkOffset(isPortraitSmall = false) {
    return isPortraitSmall ? 0.14 + 0.9 * ROOM.STEP : 0.14;
}

export function getWalkPose(th, isPortraitSmall = false) {
    if (isPortraitSmall) {
        return {
            th,
            r: 15.4,
            yaw: -0.42,
            y: 1.9,
            pitch: -0.1,
        };
    }

    return {
        th,
        r: 15.6,
        yaw: -0.3,
        y: 1.92,
        pitch: -0.12,
    };
}

/**
 * Picks the periodic copy of baseAngle within +/- PI of currentTh so the camera turns the short way round.
 */
export function resolveShortestAngle(baseAngle, currentTh) {
    const twoPi = Math.PI * 2;
    const turns = Math.round((currentTh - baseAngle) / twoPi);
    return baseAngle + turns * twoPi;
}

export function getFocusPose(wall, baseAngle, currentTh, isPortraitSmall = false) {
    const th = resolveShortestAngle(baseAngle, currentTh);
    const isOuter = wall === 'outer';
    const focusDist = isPortraitSmall ? 5.2 : 4.26;
    const yOffset = isPortraitSmall ? 1.05 : 0.52;

    return {
        th,
        r: isOuter ? ROOM.R - focusDist : ROOM.RIN + focusDist,
        yaw: isOuter ? Math.PI / 2 : -Math.PI / 2,
        y: ROOM.PY - yOffset,
        pitch: 0,
    };
}

/**
 * Interpolates between two poses using separate component easings so camera travel leads and turn lags.
 */
export function interpolateFocusPose(from, to, t) {
    const tTh = easeOutQuart(t);
    const tYaw = easeOutQuad(t);
    const tBody = easeOutCubic(t);

    return {
        th: lerp(from.th, to.th, tTh),
        r: lerp(from.r, to.r, tBody),
        yaw: lerp(from.yaw, to.yaw, tYaw),
        y: lerp(from.y, to.y, tBody),
        pitch: lerp(from.pitch, to.pitch, tBody),
    };
}

/**
 * Converts pose (th, r, yaw, y, pitch) into 3D camera position and look-at target.
 * Forward tangent is (sin th, 0, -cos th), so decreasing th walks forward with the ring center on the left.
 */
export function poseToCameraVectors(pose) {
    const cosTh = Math.cos(pose.th);
    const sinTh = Math.sin(pose.th);
    const pos = [pose.r * cosTh, pose.y, pose.r * sinTh];

    const tx = sinTh;
    const tz = -cosTh;
    const nx = cosTh;
    const nz = sinTh;

    const cosYaw = Math.cos(pose.yaw);
    const sinYaw = Math.sin(pose.yaw);

    const dx = cosYaw * tx + sinYaw * nx;
    const dz = cosYaw * tz + sinYaw * nz;

    return {
        pos,
        dir: [dx, 0, dz],
        lookAt: [pos[0] + dx, pos[1] + pose.pitch, pos[2] + dz],
    };
}

export function stepWalkSlot(currentTarget, D, direction) {
    return (Math.round((currentTarget - D) / ROOM.STEP) - direction) * ROOM.STEP + D;
}

/**
 * Finds the outer-wall placement of skillIdx closest to currentTh when returning from Spec Sheet / List.
 */
export function findNearestOuterPlacement(placements, skillIdx, currentTh) {
    let bestPlacement = null;
    let bestAngle = currentTh;
    let bestDist = Infinity;

    for (const placement of placements) {
        if (placement.wall !== 'outer' || placement.skillIdx !== skillIdx) continue;
        const candidateAngle = resolveShortestAngle(placement.angle, currentTh);
        const dist = Math.abs(candidateAngle - currentTh);
        if (dist < bestDist) {
            bestDist = dist;
            bestPlacement = placement;
            bestAngle = candidateAngle;
        }
    }

    return { placement: bestPlacement, targetAngle: bestAngle };
}

export function getSkillGalleryUnits(vw, vh, isSmallScreen = false) {
    if (isSmallScreen) {
        return { u: 1, w: 1 };
    }
    const safeVw = Math.max(320, vw || 1440);
    const safeVh = Math.max(320, vh || 900);
    return {
        u: Math.min(safeVw / 1440, safeVh / 900),
        w: safeVw / 1440,
    };
}
