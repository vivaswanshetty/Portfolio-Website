// Curated 9 Core Engineering Capabilities mapped into the 3D Curved Gallery Passage & Spec Inspector.

export const SKILLS_GALLERY_ITEMS = [
    {
        id: 'react-native-ecosystem',
        index: 0,
        code: '01 / 09',
        title: 'React & React Native',
        subtitle: 'Frontend & Mobile UI Systems',
        domainTag: 'Core Runtime',
        years: '2023–2026',
        proficiency: 95,
        proficiencyLabel: '95% · Production Core',
        summary:
            'Production UI architecture across React 19, Next.js 16 App Router, React Native 0.88, and Expo SDK 58.',
        description:
            'Architected offline-first mobile apps and sub-second SSR web platforms combining strict component isolation, Reanimated 60 FPS gestures, haptic feedback loops, and zero-jank GPU layout transitions across iOS, Android, and modern browsers.',
        layers: ['UI Components', 'Expo Native', 'SSR & Edge'],
        scaleTiers: ['MVP Build', 'Production Scale', 'Offline-First', 'Cross-Platform'],
        verificationModes: ['Benchmarked 60 FPS', 'Production Shipped'],
        relatedProjects: [
            { label: 'MedFind Android Client', slug: 'medfind' },
            { label: 'RV Tours & Travels', slug: 'rv-tours-and-travels' },
            { label: 'CONQUER ONE', slug: 'conquerone' },
        ],
        accordions: [
            {
                title: 'Production Evidence & Shipped Builds',
                body: 'Powers MedFind (React Native 0.88, Expo SDK 58), RV Tours & Travels (Next.js 16 + React 19 Turbopack achieving 100 SEO/Performance), ElevateX Web (React 18 + Vite), ElevateX Mobile (Expo SDK 52), and CONQUER ONE (Expo SDK 54).',
            },
            {
                title: 'Architectural Patterns & State',
                body: 'Pairs Expo Router and React Query caching with Zustand persistence, strict unidirectional data flow, accessible ARIA primitives, and custom frame-budget animation hooks.',
            },
            {
                title: 'Performance & Quality Standards',
                body: 'Every surface is verified at 60 FPS with reduced-motion fallbacks, clean React 19 effect teardown in StrictMode, and mobile-first responsive density.',
            },
        ],
    },
    {
        id: 'typescript-contracts',
        index: 1,
        code: '02 / 09',
        title: 'TypeScript & JS',
        subtitle: 'Strict Typed Engineering',
        domainTag: 'Language Craft',
        years: '2023–2026',
        proficiency: 95,
        proficiencyLabel: '95% · Strict Mode',
        summary:
            'End-to-end strict TypeScript contracts, shared monorepo schemas, and resilient ES modules.',
        description:
            'Eliminates runtime surprises across complex API payloads, 4-tier freshness algorithms, booking manifest dispatchers, and client state machines using discriminated unions, strict type guards, and framework-agnostic math utilities.',
        layers: ['Strict Contracts', 'Monorepo Shared', 'Pure Math Modules'],
        scaleTiers: ['Shared Types', 'Strict Mode', 'API Validation', 'Zero-Any Core'],
        verificationModes: ['Static Type Checked', 'Assertion Verified'],
        relatedProjects: [
            { label: 'MedFind Pharmacy Radar', slug: 'medfind' },
            { label: 'RV Tours & Travels', slug: 'rv-tours-and-travels' },
            { label: 'ElevateX Mobile', slug: 'elevatex-mobile' },
        ],
        accordions: [
            {
                title: 'Production Evidence & Shipped Builds',
                body: 'Enforces API request validation in RV Tours (/api/contact manifest generator), formulation isolation in MedFind dosage filtering, and strict typed stores in ElevateX Mobile.',
            },
            {
                title: 'Architectural Patterns & Tooling',
                body: 'Separates pure deterministic calculation modules (like sphere math, canyon physics, and decay evaluators) from UI layers so Node assert verification scripts test logic independently.',
            },
            {
                title: 'Reliability & DX Standards',
                body: 'Clean ESLint zero-warning configurations, predictable error boundaries, and defensive input parsing at every network and local-storage boundary.',
            },
        ],
    },
    {
        id: 'realtime-node-sockets',
        index: 2,
        code: '03 / 09',
        title: 'Node.js & Real-Time',
        subtitle: 'Express, Bun & Socket.io',
        domainTag: 'Backend & Sockets',
        years: '2024–2026',
        proficiency: 90,
        proficiencyLabel: '90% · <50ms Sync',
        summary:
            'Bidirectional WebSocket clusters, Express REST APIs, rate limiters, and high-throughput Bun tooling.',
        description:
            'Engineered live multiplayer sprint duels, follow-locked instant messaging with read receipts, chunked 200 MB media uploads, and Cost-Guard API rate-limiting middleware running across Vercel serverless handlers and Railway Node clusters.',
        layers: ['Express REST', 'Socket.io Rooms', 'Bun Runtime'],
        scaleTiers: ['REST Gateway', 'WebSocket Mesh', 'Rate-Limited Edge', 'Multiplayer Sync'],
        verificationModes: ['Clock-Drift Hardened', 'Production Deployed'],
        relatedProjects: [
            { label: 'ElevateX Web Platform', slug: 'elevatex-web' },
            { label: 'ElevateX Mobile Client', slug: 'elevatex-mobile' },
        ],
        accordions: [
            {
                title: 'Production Evidence & Shipped Builds',
                body: 'Drives ElevateX’s monorepo backend on Railway with <50 ms bidirectional Socket.io rooms, real-time 1v1 coding sprint duel state machines, and live XP feed ranking.',
            },
            {
                title: 'Security & Abuse Prevention',
                body: 'Protects endpoints with express-rate-limit Cost-Guard windows (capping LLM traffic per IP), follow-locked DM authorization checks, and sanitized payload validation.',
            },
            {
                title: 'Delivery & Resilience',
                body: 'Designed for flaky mobile networks with automatic Socket reconnection handling, chunked async transfer progress indicators, and deterministic server timestamps.',
            },
        ],
    },
    {
        id: 'distributed-offline-data',
        index: 3,
        code: '04 / 09',
        title: 'MongoDB & Firestore',
        subtitle: 'Offline Sync & Persistence',
        domainTag: 'Data Architecture',
        years: '2024–2026',
        proficiency: 92,
        proficiencyLabel: '92% · Offline-First',
        summary:
            'Cloud Firestore sync daemons, MongoDB Atlas aggregations, Supabase PostgreSQL, and AsyncStorage caches.',
        description:
            'Designs persistence layers where offline mobile state always works instantaneously first, then reconciles cleanly with cloud databases via timestamp freshness tiers, deterministic conflict resolution, and capped local storage caches.',
        layers: ['Cloud Firestore', 'MongoDB Atlas', 'Supabase + Local'],
        scaleTiers: ['Local Cache', 'Hybrid Sync', 'Multi-Tenant DB', 'Audit Logging'],
        verificationModes: ['Offline Verified', 'Conflict-Safe'],
        relatedProjects: [
            { label: 'CONQUER ONE', slug: 'conquerone' },
            { label: 'MedFind', slug: 'medfind' },
            { label: 'ElevateX Web', slug: 'elevatex-web' },
        ],
        accordions: [
            {
                title: 'Production Evidence & Shipped Builds',
                body: 'Powers CONQUER ONE’s offline workout logger with Firestore hydration/push sync, MedFind’s 4-tier timestamp decay engine + 24h OSM cache on Supabase, and ElevateX’s MongoDB Atlas schemas.',
            },
            {
                title: 'Data Integrity & Privacy Rules',
                body: 'Caps local Medicine Box caches at 30 entries for device safety, rounds user GPS coordinates down to 2 decimals before Overpass queries, and enforces strict schema indexing.',
            },
            {
                title: 'Backup, Export & Portability',
                body: 'Supports CSV workout ledger exports, deterministic AsyncStorage hydration keys, and instant local fallbacks when cellular connectivity drops inside gyms or clinics.',
            },
        ],
    },
    {
        id: 'gemini-ai-systems',
        index: 4,
        code: '05 / 09',
        title: 'Gemini AI Systems',
        subtitle: 'Multi-Model Orchestration',
        domainTag: 'Applied AI',
        years: '2025–2026',
        proficiency: 85,
        proficiencyLabel: '85% · 99.9% Fallback',
        summary:
            'Google Gemini 2.5 Flash integrations with automated multi-model fallback cascades and Cost-Guard quotas.',
        description:
            'Builds AI assistants that behave like dependable infrastructure rather than fragile demos—combining structured context assembly, Flash -> Pro -> Flash-8b automatic failover, draggable in-app co-pilots, and strict IP budget protection.',
        layers: ['Gemini 2.5 Flash', 'Fallback Cascade', 'Cost-Guard'],
        scaleTiers: ['Prompt Pipeline', 'Context Injection', 'Failover Cluster', 'Rate-Capped API'],
        verificationModes: ['Cascade Tested', 'Cost-Guarded'],
        relatedProjects: [
            { label: 'CONQUER ONE AI Coach', slug: 'conquerone' },
            { label: 'ElevateX Co-Pilot', slug: 'elevatex-web' },
        ],
        accordions: [
            {
                title: 'Production Evidence & Shipped Builds',
                body: 'Drives CONQUER ONE’s adaptive progressive-overload coach (Gemini 2.5 Flash -> Pro -> 8b automatic fallback) and ElevateX’s draggable floating Elev AI assistant.',
            },
            {
                title: 'Cost & Quota Discipline',
                body: 'Pairs per-IP express-rate-limit windows with session-isolated memory buffers before DB writes, keeping inference latency fast while shielding API spend.',
            },
            {
                title: 'Human-Centered Interaction',
                body: 'Supports viewport-clamped draggable co-pilot windows, line-level quote citations, and graceful degradation when API keys or connectivity are constrained.',
            },
        ],
    },
    {
        id: 'webgl-spatial-ui',
        index: 5,
        code: '06 / 09',
        title: 'Three.js & 60FPS UI',
        subtitle: 'WebGL Shaders & Spatial UX',
        domainTag: 'Spatial Engineering',
        years: '2024–2026',
        proficiency: 88,
        proficiencyLabel: '88% · GPU Composited',
        summary:
            'Custom Three.js worlds, GLSL fragment/vertex shaders, Fibonacci 3D spheres, and FLIP GPU transitions.',
        description:
            'Crafts interactive spatial interfaces from first principles—from this curved 3D corridor and the 21-frame Fibonacci globe to full-360 GLSL procedural flower valleys—while maintaining strict frame budgets and clean resource disposal.',
        layers: ['Three.js WebGL', 'GLSL Shaders', 'FLIP & WAAPI'],
        scaleTiers: ['Canvas Textures', 'Custom Shaders', 'Bloom Post-FX', 'FLIP Motion'],
        verificationModes: ['Zero-Jank 60 FPS', 'Strict Disposal'],
        relatedProjects: [
            { label: 'Architectural 3D Portfolio', slug: 'portfolio' },
            { label: 'RV Tours Liquid Glass', slug: 'rv-tours-and-travels' },
        ],
        accordions: [
            {
                title: 'Production Evidence & Shipped Builds',
                body: 'Powers the Portfolio’s WebGL Cosmic Starfield, 3D Night Flower Valley with UnrealBloomPass, 3D Stealth Navigator Drone, Fibonacci Project Sphere, and this 3D Curved Gallery.',
            },
            {
                title: 'Graphics Math & Optimization',
                body: 'Uses SRGB color pipelines, max anisotropy texture sampling, capped devicePixelRatio <= 2, exponential camera damping, and imperative ref animation loops avoiding React re-renders.',
            },
            {
                title: 'Accessibility & Motion Safety',
                body: 'Honors prefers-reduced-motion with instant 0 ms transitions, semantic aria labels, keyboard arrow controls, and Escape exit paths on every 3D stage.',
            },
        ],
    },
    {
        id: 'mobile-native-bridges',
        index: 6,
        code: '07 / 09',
        title: 'Mobile Bridges & Native',
        subtitle: 'Health Connect, GPS & OTA',
        domainTag: 'Device Integrations',
        years: '2025–2026',
        proficiency: 89,
        proficiencyLabel: '89% · On-Device',
        summary:
            'Android Health Connect telemetry, privacy-truncated OpenStreetMap radar, native dialers, and EAS OTA builds.',
        description:
            'Bridges React Native apps directly to hardware sensors, background notification schedulers, system dialer intents across 87 countries, tactile haptic motors, and Expo EAS continuous delivery tracks without store review bottlenecks.',
        layers: ['Health Connect', 'OSM & Geolocation', 'Haptics & Local Push'],
        scaleTiers: ['Native Intents', 'Background Push', 'Sensor Telemetry', 'EAS OTA Tracks'],
        verificationModes: ['Device Tested', 'Privacy First'],
        relatedProjects: [
            { label: 'MedFind Emergency Radar', slug: 'medfind' },
            { label: 'CONQUER ONE Biometrics', slug: 'conquerone' },
        ],
        accordions: [
            {
                title: 'Production Evidence & Shipped Builds',
                body: 'Combines Android Health Connect step/calorie ingestion in CONQUER ONE with MedFind’s 87-country emergency dialer intents, OpenStreetMap Overpass mirrors, and 30-day expiry notifications.',
            },
            {
                title: 'Location & Biometric Privacy',
                body: 'Truncates coordinates to 2 decimal places (~1 km radius) before external facility lookups and keeps emergency datasets locally cached for offline access.',
            },
            {
                title: 'Release Engineering',
                body: 'Configured Expo EAS Cloud build profiles (development, preview APK, production) with OTA update channels for rapid field iteration.',
            },
        ],
    },
    {
        id: 'systems-cpp-rhca',
        index: 7,
        code: '08 / 09',
        title: 'Systems, DSA & Linux',
        subtitle: 'C/C++, Python & RHCA Foundations',
        domainTag: 'Core CS & Infra',
        years: '2022–2026',
        proficiency: 85,
        proficiencyLabel: '85% · Systems Core',
        summary:
            'Algorithmic problem solving in C/C++ and Python grounded by Red Hat Certified Architect (RHCA) credentials.',
        description:
            'Applies computer science fundamentals—complexity bounds, data structures, manual memory intuition, Linux systems administration, and deterministic state verification—to build software that holds up under real production constraints.',
        layers: ['C / C++ & DSA', 'Python Tooling', 'RHCA Linux'],
        scaleTiers: ['Data Structures', 'Memory Safety', 'Linux Systems', 'Automated Checks'],
        verificationModes: ['RHCA Certified', '8.67 CGPA · BMSCE'],
        relatedProjects: [
            { label: 'MedFind Decay Algorithm', slug: 'medfind' },
            { label: 'Developer Portfolio Engine', slug: 'portfolio' },
        ],
        accordions: [
            {
                title: 'Credentials & Academic Grounding',
                body: 'Red Hat Certified Architect (RHCA, 2025), 8.67/10 CGPA in B.E. Computer Science at BMS College of Engineering, 398/400 (99.5%) PU State Top Ranker, and Top 2% KCET rank.',
            },
            {
                title: 'Algorithmic & Verification Habits',
                body: 'Maintains standalone Node verification scripts (verify-hero-metrics, verify-project-sphere, verify-night-valley, verify-skills-gallery) asserting geometric and mathematical invariants.',
            },
            {
                title: 'Systems Mindset',
                body: 'Focuses on latency discipline, bounded resource footprints, predictable offline queues, and clean modularity without speculative boilerplate.',
            },
        ],
    },
    {
        id: 'cloud-figma-devops',
        index: 8,
        code: '09 / 09',
        title: 'Cloud, UI/UX & Tooling',
        subtitle: 'Figma, Tailwind, Vercel & Railway',
        domainTag: 'Design & Delivery',
        years: '2024–2026',
        proficiency: 90,
        proficiencyLabel: '90% · Full Lifecycle',
        summary:
            'End-to-end delivery from Google-certified UX wireframes and Tailwind tokens to Vercel Edge & GitHub workflows.',
        description:
            'Bridges editorial visual design and zero-friction deployment—pairing Figma typography systems and liquid glass aesthetics with Tailwind CSS v4, Cloudinary media pipelines, Vercel Edge deployments, Postman API suites, and Git CI discipline.',
        layers: ['Figma & UX Design', 'Tailwind CSS v4', 'Vercel & Railway'],
        scaleTiers: ['Design Tokens', 'Edge Hosting', 'Media CDN', 'API Testing'],
        verificationModes: ['Google UX Certified', '100 Lighthouse'],
        relatedProjects: [
            { label: 'RV Tours & Travels', slug: 'rv-tours-and-travels' },
            { label: 'Developer Portfolio', slug: 'portfolio' },
            { label: 'ElevateX Web', slug: 'elevatex-web' },
        ],
        accordions: [
            {
                title: 'Design System & UX Credentials',
                body: 'Google UX Design Professional Certificate (2024) + Responsive Web Design Certification (2025). Authored the macOS liquid glass header and vintage manifest aesthetic on RV Tours.',
            },
            {
                title: 'Toolchain Mastery',
                body: 'Daily workflow across VS Code, Android Studio, Expo EAS, Bun & npm, Git & GitHub, Figma, Vercel, Railway, MongoDB Atlas, Postman, and Notion.',
            },
            {
                title: 'SEO, Accessibility & Telemetry',
                body: 'Implements skip-to-content navigation, semantic dialogs, JSON-LD Schema.org structured graphs, OpenGraph assets, and Vercel Edge Analytics.',
            },
        ],
    },
];

export const SKILLS_FRAME_STYLES = [
    {
        id: 'unframed',
        label: 'Unframed Blueprint',
        shortLabel: 'Blueprint',
        borderColor: 'transparent',
        borderWidthW: 0,
        matColor: '#141824',
    },
    {
        id: 'titanium',
        label: 'Titanium Studio',
        shortLabel: 'Titanium',
        borderColor: '#94A3B8',
        borderWidthW: 6,
        matColor: '#F2ECE1',
    },
    {
        id: 'crimson',
        label: 'Crimson Exhibition',
        shortLabel: 'Crimson',
        borderColor: '#EF4444',
        borderWidthW: 6,
        matColor: '#0A0D16',
    },
];
