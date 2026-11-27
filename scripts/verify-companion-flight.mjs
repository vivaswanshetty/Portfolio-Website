import assert from 'node:assert/strict';
import {
    easeCubicInOut,
    lerpAngle,
    computeRouteTargetPose,
    computeDocumentScrollProgress,
} from '../src/utils/companionFlight.js';

// 1. Easing & shortest-angle wrap verification
assert.equal(easeCubicInOut(0), 0);
assert.equal(easeCubicInOut(0.5), 0.5);
assert.equal(easeCubicInOut(1), 1);

const wrappedYaw = lerpAngle(350, 10, 0.5);
assert.ok(Math.abs(wrappedYaw - 360) < 1e-6 || Math.abs(wrappedYaw) < 1e-6, `shortest path across 0/360 expected ~360, got ${wrappedYaw}`);

// 2. All route waypoints stay safely inside non-clipped edge gutters [-0.85, 0.85]
const routes = ['/', '/about', '/projects', '/projects/medfind', '/skills', '/resume', '/contact'];
for (const route of routes) {
    for (const isMobile of [false, true]) {
        for (const p of [0, 0.25, 0.5, 0.75, 1]) {
            const pose = computeRouteTargetPose(route, p, isMobile);
            assert.ok(pose.x >= -0.85 && pose.x <= 0.85, `x out of safe margin for ${route} mobile=${isMobile}: ${pose.x}`);
            assert.ok(pose.y >= -0.75 && pose.y <= 0.75, `y out of safe margin for ${route} mobile=${isMobile}: ${pose.y}`);
            assert.ok(pose.s >= 0.4 && pose.s <= 1.2, `scale out of bounds: ${pose.s}`);
            assert.ok(pose.moving >= 0 && pose.moving <= 1.001, `moving envelope invalid: ${pose.moving}`);
        }
    }
}

// 3. Home mobile should stay compact; /projects stays clear of bottom bio & colophon
const projMobile = computeRouteTargetPose('/projects', 0, true);
assert.ok(projMobile.y > 0.5, 'mobile projects perch must stay in top corner clear of center sphere & bottom bio');

// 4. Document scroll normalization
assert.equal(computeDocumentScrollProgress(0, 900, 900), 0);
assert.equal(computeDocumentScrollProgress(450, 1800, 900), 0.5);
assert.equal(computeDocumentScrollProgress(9999, 1800, 900), 1);

console.log('companionFlight verification passed across all routes, wrap-around yaw, and scroll bounds.');
