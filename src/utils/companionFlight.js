// Pure route flight paths, perimeter exclusion arcs, easing, and 3D banking/wing-beat math
// for the persistent cross-page Cybernetic Night-Drone navigation companion.

export function easeCubicInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function lerpAngle(a, b, t) {
    const d = ((b - a + 540) % 360) - 180;
    return a + d * t;
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

/**
 * Keeps autonomous or scroll-driven targets out of the central headline/story card corridor
 * and top-center navbar while keeping waypoints inside visible non-clipped viewport gutters.
 */
export function enforcePerimeterExclusion(nx, ny, isMobile = false) {
    let x = clamp(nx, -0.84, 0.84);
    let y = clamp(ny, -0.72, 0.72);

    if (isMobile) {
        return { x, y };
    }

    // Avoid centered floating navbar at very top center
    if (Math.abs(x) < 0.52 && y > 0.64) {
        x = x >= 0 ? 0.62 : -0.62;
    }

    // Keep clear of central content cards / hero headlines (|x| < 0.73 && |y| < 0.54)
    const halfBoxX = 0.73;
    const halfBoxY = 0.54;
    if (Math.abs(x) < halfBoxX && Math.abs(y) < halfBoxY) {
        const pushRight = halfBoxX - Math.abs(x);
        const pushTop = halfBoxY - Math.abs(y);
        if (pushRight < pushTop * 1.2) {
            x = x >= 0 ? 0.78 : -0.78;
        } else {
            y = y >= 0 ? 0.60 : -0.60;
        }
    }

    return {
        x: clamp(x, -0.84, 0.84),
        y: clamp(y, -0.72, 0.72),
    };
}

// Desktop outer perimeter waypoints (diverse orbital corners per route, never slicing horizontally across text)
const DESKTOP_ROUTES = {
    '/': [
        { x: 0.78, y: 0.44, s: 0.90, yaw: 146, pitch: 5, roll: -5 },
        { x: 0.80, y: -0.34, s: 0.86, yaw: 132, pitch: 4, roll: -3 },
        { x: -0.78, y: 0.52, s: 0.84, yaw: 38, pitch: 7, roll: 5 },
    ],
    '/about': [
        { x: 0.78, y: 0.48, s: 0.86, yaw: 145, pitch: 6, roll: -4 },
        { x: 0.81, y: 0.56, s: 0.80, yaw: 136, pitch: 5, roll: -3 },
        { x: 0.80, y: -0.46, s: 0.82, yaw: 128, pitch: 4, roll: 2 },
        { x: -0.79, y: -0.52, s: 0.80, yaw: 38, pitch: 6, roll: 4 },
    ],
    '/projects': [
        { x: 0.80, y: 0.58, s: 0.68, yaw: 135, pitch: 4, roll: -4 },
        { x: 0.78, y: 0.48, s: 0.70, yaw: 120, pitch: 6, roll: 2 },
    ],
    '/skills': [
        { x: -0.79, y: 0.48, s: 0.84, yaw: 36, pitch: 6, roll: 5 },
        { x: 0.79, y: 0.52, s: 0.84, yaw: 144, pitch: 5, roll: -4 },
        { x: 0.80, y: -0.40, s: 0.80, yaw: 128, pitch: 4, roll: 0 },
    ],
    '/resume': [
        { x: 0.80, y: 0.50, s: 0.82, yaw: 145, pitch: 5, roll: -4 },
        { x: 0.81, y: -0.32, s: 0.80, yaw: 132, pitch: 5, roll: -2 },
        { x: -0.79, y: -0.44, s: 0.78, yaw: 38, pitch: 6, roll: 5 },
    ],
    '/contact': [
        { x: 0.79, y: 0.52, s: 0.84, yaw: 150, pitch: 6, roll: -5 },
        { x: 0.80, y: -0.42, s: 0.80, yaw: 128, pitch: 4, roll: -2 },
    ],
    projectDetail: [
        { x: -0.79, y: 0.52, s: 0.82, yaw: 42, pitch: 5, roll: 4 },
        { x: 0.80, y: 0.46, s: 0.80, yaw: 140, pitch: 6, roll: -4 },
        { x: 0.79, y: -0.42, s: 0.78, yaw: 126, pitch: 4, roll: 0 },
    ],
};

// Mobile / narrow screens (< 760px): compact, tucked cleanly into high/low edge gutters
const MOBILE_ROUTES = {
    '/': [
        { x: 0.72, y: 0.58, s: 0.60, yaw: 142, pitch: 6, roll: -4 },
        { x: 0.74, y: 0.50, s: 0.58, yaw: 125, pitch: 8, roll: 4 },
        { x: 0.68, y: -0.48, s: 0.56, yaw: 135, pitch: 4, roll: 0 },
    ],
    '/projects': [
        { x: 0.74, y: 0.64, s: 0.54, yaw: 138, pitch: 4, roll: -3 },
        { x: 0.72, y: 0.58, s: 0.54, yaw: 126, pitch: 5, roll: 0 },
    ],
    default: [
        { x: 0.72, y: 0.62, s: 0.56, yaw: 145, pitch: 5, roll: -4 },
        { x: 0.72, y: 0.54, s: 0.54, yaw: 122, pitch: 6, roll: 3 },
        { x: 0.70, y: -0.48, s: 0.54, yaw: 132, pitch: 4, roll: 0 },
    ],
};

export function resolveRouteKeyframes(pathname = '/', isMobile = false) {
    if (isMobile) {
        if (pathname === '/') return MOBILE_ROUTES['/'];
        if (pathname === '/projects') return MOBILE_ROUTES['/projects'];
        return MOBILE_ROUTES.default;
    }

    if (DESKTOP_ROUTES[pathname]) return DESKTOP_ROUTES[pathname];
    if (pathname.startsWith('/projects/')) return DESKTOP_ROUTES.projectDetail;
    return DESKTOP_ROUTES['/about'];
}

/**
 * Samples the drone's anchor pose along the current route perimeter keyframes for normalized scroll [0..1],
 * sweeping around the upper/lower outer rim whenever crossing screen sides so it never sits over center typography.
 */
export function computeRouteTargetPose(pathname, scrollProgress = 0, isMobile = false) {
    const keyframes = resolveRouteKeyframes(pathname, isMobile);
    if (keyframes.length <= 1) {
        return { ...keyframes[0], moving: 0 };
    }

    const safeP = Number.isFinite(scrollProgress) ? clamp(scrollProgress, 0, 1) : 0;
    const scaled = safeP * (keyframes.length - 1);
    const i = Math.min(keyframes.length - 2, Math.floor(scaled));
    const f = scaled - i;

    const t = easeCubicInOut(clamp((f - 0.08) / 0.84, 0, 1));
    const a = keyframes[i];
    const b = keyframes[i + 1];

    // Sweep along upper/outer perimeter arc if crossing horizontally across center
    const crossesCenter = Math.sign(a.x) !== Math.sign(b.x);
    const rawX = lerp(a.x, b.x, t);
    const arcY = crossesCenter ? Math.sin(t * Math.PI) * (a.y + b.y >= 0 ? 0.34 : -0.24) : Math.sin(t * Math.PI) * -0.06;
    const rawY = lerp(a.y, b.y, t) + arcY;

    const guarded = enforcePerimeterExclusion(rawX, rawY, isMobile);

    return {
        x: guarded.x,
        y: guarded.y,
        s: lerp(a.s, b.s, t) * (1 + Math.sin(t * Math.PI) * 0.10),
        yaw: lerpAngle(a.yaw, b.yaw, t),
        pitch: lerp(a.pitch, b.pitch, t),
        roll: lerp(a.roll, b.roll, t),
        moving: Math.sin(t * Math.PI),
    };
}

/**
 * Evaluates normalized document scroll [0..1] safely across short and tall pages.
 */
export function computeDocumentScrollProgress(scrollY, scrollHeight, innerHeight) {
    const maxScroll = Math.max(0, scrollHeight - innerHeight);
    if (maxScroll < 16) return 0;
    return clamp(scrollY / maxScroll, 0, 1);
}
