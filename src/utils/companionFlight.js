// Pure route flight paths, easing, and 3D banking/wing-beat math
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

// Desktop waypoints (viewport half-axes: x, y in [-1, 1]; yaw 0 = facing right, 180 = left)
const DESKTOP_ROUTES = {
    '/': [
        { x: 0.72, y: 0.38, s: 0.94, yaw: 148, pitch: 5, roll: -5 },
        { x: -0.78, y: 0.14, s: 0.88, yaw: 34, pitch: 8, roll: 6 },
        { x: 0.76, y: -0.22, s: 0.84, yaw: 132, pitch: 4, roll: 0 },
    ],
    '/about': [
        { x: 0.72, y: 0.44, s: 0.88, yaw: 145, pitch: 6, roll: -4 },
        { x: -0.78, y: 0.08, s: 0.84, yaw: 38, pitch: 7, roll: 6 },
        { x: 0.76, y: -0.34, s: 0.82, yaw: 130, pitch: 4, roll: -2 },
    ],
    '/projects': [
        // Pushed neatly into top-right open margin outside the 3D Fibonacci sphere and bio/colophon
        { x: 0.80, y: 0.58, s: 0.68, yaw: 135, pitch: 4, roll: -4 },
        { x: 0.78, y: 0.48, s: 0.70, yaw: 120, pitch: 6, roll: 2 },
    ],
    '/skills': [
        { x: 0.74, y: 0.46, s: 0.88, yaw: 150, pitch: 6, roll: -5 },
        { x: -0.78, y: -0.04, s: 0.84, yaw: 35, pitch: 8, roll: 5 },
        { x: 0.76, y: -0.32, s: 0.82, yaw: 125, pitch: 4, roll: 0 },
    ],
    '/resume': [
        { x: 0.74, y: 0.48, s: 0.86, yaw: 145, pitch: 5, roll: -4 },
        { x: -0.78, y: 0.12, s: 0.82, yaw: 36, pitch: 7, roll: 6 },
        { x: 0.76, y: -0.36, s: 0.80, yaw: 130, pitch: 4, roll: 0 },
    ],
    '/contact': [
        { x: 0.74, y: 0.48, s: 0.86, yaw: 152, pitch: 6, roll: -5 },
        { x: 0.78, y: -0.30, s: 0.82, yaw: 128, pitch: 4, roll: -2 },
    ],
    projectDetail: [
        { x: 0.76, y: 0.46, s: 0.84, yaw: 144, pitch: 5, roll: -4 },
        { x: -0.78, y: 0.08, s: 0.80, yaw: 40, pitch: 7, roll: 5 },
        { x: 0.76, y: -0.34, s: 0.78, yaw: 124, pitch: 4, roll: 0 },
    ],
};

// Mobile / narrow screens (< 760px): compact, tucked cleanly into high/low edge gutters
const MOBILE_ROUTES = {
    '/': [
        { x: 0.70, y: 0.56, s: 0.62, yaw: 142, pitch: 6, roll: -4 },
        { x: 0.72, y: 0.48, s: 0.60, yaw: 125, pitch: 8, roll: 4 },
        { x: 0.68, y: -0.44, s: 0.58, yaw: 135, pitch: 4, roll: 0 },
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
 * Samples the drone's target pose along the current route keyframes for normalized scroll [0..1],
 * holding steady at section rest points and sweeping cleanly with a mid-flight dip in between.
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

    const t = easeCubicInOut(clamp((f - 0.1) / 0.8, 0, 1));
    const dive = Math.sin(t * Math.PI) * -0.14;

    const a = keyframes[i];
    const b = keyframes[i + 1];

    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t) + dive,
        s: lerp(a.s, b.s, t) * (1 + Math.sin(t * Math.PI) * 0.12),
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
