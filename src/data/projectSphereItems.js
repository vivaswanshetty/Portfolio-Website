import { portfolioData } from './portfolioData';
import { projectScreenshots } from './projectScreenshots';

// Index flagship project metadata once so sphere items inherit verified links, categories, and slugs.
const bySlug = Object.fromEntries(portfolioData.projects.map((p) => [p.slug, p]));

const makeProjectCoverItem = (slug, title, place, note) => {
    const project = bySlug[slug];
    return {
        id: `${slug}-cover`,
        slug,
        projectTitle: project.title,
        category: project.category,
        tech: project.tech.slice(0, 4),
        repo: project.repo,
        liveUrl: project.link,
        isFlagshipCover: true,
        tall: false,
        title,
        place,
        note,
        src: project.image,
    };
};

const makeScreenItem = (slug, screenIdx, placeOverride, tall = false) => {
    const project = bySlug[slug];
    const shot = projectScreenshots[slug][screenIdx];
    return {
        id: `${slug}-screen-${screenIdx}`,
        slug,
        projectTitle: project.title,
        category: project.category,
        tech: project.tech.slice(0, 4),
        repo: project.repo,
        liveUrl: project.link,
        isFlagshipCover: false,
        tall,
        title: shot.title,
        place: placeOverride || `${project.title} · ${shot.category}`,
        note: shot.description,
        src: shot.src,
    };
};

/**
 * Curated 21 showcase frames arranged across the 3D Fibonacci sphere.
 * Portrait mobile UI captures use `tall: true` so interfaces display cleanly without clipping.
 */
export const PROJECTS_SPHERE_ITEMS = [
    makeProjectCoverItem(
        'medfind',
        'MedFind — Emergency Medicine Radar',
        'Mobile Systems · React Native 0.88 & OpenStreetMap',
        'An Android-first discovery engine pairing an honest 4-tier stock freshness decay algorithm with privacy-preserving 1 km radius pharmacy lookups and an 87-country emergency dialer.'
    ),
    makeProjectCoverItem(
        'rv-tours-and-travels',
        'RV Tours & Travels Platform',
        'Full-Stack Web · Next.js 16, Turbopack & Edge API',
        'Editorial luxury transport platform pairing vintage aviation departure manifests, macOS liquid glass ergonomics, serverless manifest generation, and instant WhatsApp routing.'
    ),
    makeProjectCoverItem(
        'elevatex-web',
        'ElevateX Developer Ecosystem',
        'MERN Architecture · React 18, Socket.io & Gemini AI',
        'Full-stack gamified developer network turning bug hunts and code reviews into RPG bounties backed by real-time WebSocket lobbies and Cost-Guard LLM protection.'
    ),
    makeProjectCoverItem(
        'conquerone',
        'CONQUER ONE — Athlete OS',
        'Mobile Systems · React Native 0.81, Health Connect & AI',
        'Offline-first 6-day strength training protocol combining unilateral PR comparisons, multi-model Gemini AI coaching fallback, and Health Connect telemetry.'
    ),
    makeProjectCoverItem(
        'elevatex-mobile',
        'ElevateX Native Momentum Client',
        'Cross-Platform Mobile · Expo SDK 52, Bun & Zustand',
        '60 FPS mobile network with custom haptic surfaces, follow-locked chunked 200 MB media chat, and synchronized multiplayer 1v1 sprint duels.'
    ),
    makeProjectCoverItem(
        'portfolio',
        'Architectural 3D Portfolio',
        'Interactive Web · React 19, Vite & GPU 3D Rig',
        'Multi-layered spatial web showcase engineered around zero-jank compositor animations, dynamic perspective rigs, and high-contrast editorial typography.'
    ),
    // Landscape UI Architecture Captures
    makeScreenItem('elevatex-web', 0, 'ElevateX Web · Bounty Marketplace'),
    makeScreenItem('rv-tours-and-travels', 0, 'RV Travels · Split-Flap Boarding Pass UI'),
    makeScreenItem('elevatex-web', 2, 'ElevateX Web · Real-Time Resonance Chamber'),
    makeScreenItem('rv-tours-and-travels', 1, 'RV Travels · Executive Fleet Specs'),
    makeScreenItem('elevatex-web', 1, 'ElevateX Web · Global XP Ladders'),
    makeScreenItem('rv-tours-and-travels', 2, 'RV Travels · Manifest Booking Engine'),
    makeScreenItem('elevatex-web', 8, 'ElevateX Web · Escrow & Payout Wallet'),
    makeScreenItem('elevatex-web', 3, 'ElevateX Web · Skill Crafting Lab'),
    makeScreenItem('portfolio', 2, 'Portfolio · Featured Systems Matrix'),
    makeScreenItem('rv-tours-and-travels', 4, 'RV Travels · Chauffeur Dispatch Coverage'),
    makeScreenItem('elevatex-web', 5, 'ElevateX Web · Focus Sprint Analytics'),
    makeScreenItem('portfolio', 4, 'Portfolio · Kinetic Contact Terminal'),
    // Portrait Mobile Architecture Captures (preserved aspect ratio)
    makeScreenItem('medfind', 3, 'MedFind · 4-Tier Stock Decay Matrix', true),
    makeScreenItem('conquerone', 3, 'CONQUER ONE · Multi-Model Gemini Coach', true),
    makeScreenItem('elevatex-mobile', 5, 'ElevateX Mobile · Timed 1v1 Skill Duels', true),
];
