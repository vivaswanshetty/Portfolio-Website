// -----------------------------------------------------------------------------
// PORTFOLIO DATA FILE
// -----------------------------------------------------------------------------
// Update this file with your references to change the website content.
// No coding updates are required in the components.
// -----------------------------------------------------------------------------
import elevatexImg from '../assets/elevatex.png';
import elevatexMobileCoverImg from '../assets/elevatex-mobile-cover.png';
import conqueroneImg from '../assets/conquerone.png';
import portfolioCoverImg from '../assets/portfolio-cover.png';

// Project Logos
import elevatexLogo from '../assets/logos/elevatex-logo.png';
import elevatexBolt from '../assets/logos/elevatex-bolt.png';
import conqueroneLogo from '../assets/logos/conquerone-logo.png';
import portfolioLogo from '../assets/logos/portfolio-logo.svg';

export const portfolioData = {
    // ----------------------------------------------------
    // HERO SECTION
    // ----------------------------------------------------
    hero: {
        name: "Vivaswan Shetty",
        role: "Future Engineering Leader",
        tagline: "Building the future through code, leadership, and entrepreneurship.",
        description: "Engineering undergraduate passionate about solving complex problems and creating high-impact solutions.",
        image: "https://images.unsplash.com/photo-1639892664217-c6ba12b63f11?w=800",
        actions: [
            { label: "View Resume", href: "#resume", primary: true },
            { label: "Connect", href: "#contact", primary: false }
        ]
    },

    // ----------------------------------------------------
    // ABOUT SECTION
    // ----------------------------------------------------
    about: {
        title: "About Me",
        tagline: "Visionary. Builder. Leader.",
        description: "I am currently pursuing my B.E degree in Computer Science & Engineering from BMS College of Engineering, Bengaluru - 560019, with a focus on blending technical depth with entrepreneurial vision. My journey is defined by a relentless drive to innovate and lead teams towards impactful technology solutions. I believe in the power of code to solve real-world problems and creating sustainable business models around them.",
        highlights: [
            "Aspiring Tech Entrepreneur",
            "Full Stack Developer",
            "Community Leader",
            "Problem Solver"
        ],
        stats: [
            { label: "Lines of Code", value: "60k+", numeric: 60000 },
            { label: "Biryani Consumed", value: "50kg+", numeric: 0 },
            { label: "Bugs Squashed", value: "800+", numeric: 800 },
            { label: "Hours in Flow", value: "1500+", numeric: 1500 }
        ]
    },

    // ----------------------------------------------------
    // RESUME SECTION
    // ----------------------------------------------------
    resume: {
        education: [
            {
                degree: "Bachelor of Engineering in Computer Science & Engineering",
                institution: "BMS College of Engineering, Bengaluru",
                duration: "2024 - 2028",
                description: "Focused on core Computer Science, Data Structures & Algorithms, System Design, and building scalable full-stack applications with strong leadership and entrepreneurial initiatives."
            },
            {
                degree: "Pre-University (PCMC)",
                institution: "Shree Swaminarayan Gurukul International School",
                duration: "2022 - 2024",
                description: "State Board Top Ranker with a score of 398/400 (99.5%). Ranked ~5000 in KCET (Top 2% state-wide)."
            }
        ],
        experience: [
            {
                role: "Creator & Lead Developer",
                company: "ConquerONE (AI Fitness Mobile App)",
                duration: "2026 - Present",
                description: "Engineered an offline-first 6-day split gym training application with React Native 0.81 & Expo SDK 54. Features unilateral set tracking, automatic PR detection, streak freeze protections, and Google Gemini AI 2.5 Flash coaching with multi-model fallback. Integrated Android Health Connect for active energy/steps and Expo EAS OTA release channels.",
                highlights: ["React Native 0.81", "Expo SDK 54", "Cloud Firestore", "Gemini 2.5 Flash", "Health Connect", "AsyncStorage"]
            },
            {
                role: "Founder & Lead Developer",
                company: "ElevateX (Gamified Developer Marketplace)",
                duration: "2025 - Present",
                description: "Architected a full-stack monorepo gamified marketplace and developer network serving web (React 18 + Vite) and mobile (React Native + Expo SDK 52 + Bun). Features real-time Socket.io chat with follow-locked DMs and read receipts, Elev AI draggable co-pilot, multiplayer 1v1 productivity duels, and LLM Cost-Guard rate limiting.",
                highlights: ["MERN Stack", "React Native", "Socket.io", "TypeScript", "Bun", "Gemini API", "Cloudinary"]
            }
        ],
        achievements: [
            "CGPA of 8.67/10 at BMS College of Engineering",
            "Grade of 398/400 in Pre-University Board Exams (Top Ranker)",
            "KCET rank ~5000 (Top 2% of state-level applicants)",
            "Created and deployed high-performance full-stack web and mobile apps"
        ],
        certifications: [
            { name: "Red Hat Certified Architect (RHCA)", issuer: "Red Hat", year: "2025", link: "https://www.credly.com/badges/25f8c763-54ed-48b7-96da-a59564f5cc37" },
            { name: "Google UX Design Professional Certificate", issuer: "Coursera (Offered by Google)", year: "2024", link: "https://www.coursera.org/account/accomplishments/verify/P2YULGTZLCKQ" },
            { name: "Generative AI Certification", issuer: "Google for Education", year: "2026", link: "https://simpli.app.link/uwziGhZTW2b" },
            { name: "Responsive Web Design Certification", issuer: "Infosys Springboard", year: "2025", link: "https://media.licdn.com/dms/image/v2/D562DAQG_kGnbVXMHcQ/profile-treasury-document-images_1920/B56Z4C.WYrIkAk-/1/1778166361059?e=1779321600&v=beta&t=OhK9tuxj_LOQ5c0WhbVXRZntY1-WnkRQl4_C1bhkYBI" },
            { name: "C Programming Certification", issuer: "Great Learning", year: "2024", link: "https://www.mygreatlearning.com/certificate/KPDLYXCV" }
        ]
    },

    // ----------------------------------------------------
    // PROJECTS SECTION
    // ----------------------------------------------------
    projects: [
        {
            slug: "elevatex-web",
            title: "ElevateX Web Platform",
            category: "Full-Stack Web",
            tagline: "Gamified Developer Marketplace, Community & AI Co-Pilot",
            logo: elevatexBolt,
            image: elevatexImg,
            problem: "ElevateX transforms mundane coding reviews, bug hunts, and freelance micro-tasks into engaging RPG quests that earn experience points (XP) and virtual gold. Structured as a full-stack monorepo (React 18 + Vite + Tailwind frontend and Node.js + Express + Socket.io + MongoDB backend), it features a community social feed with engagement ranking, private chat lobbies, real-time duels, and Elev AI—a draggable Gemini-powered floating co-pilot.",
            tech: [
                "React 18 (Vite)",
                "Tailwind CSS",
                "Node.js & Express",
                "MongoDB & Mongoose",
                "Socket.io WebSockets",
                "Gemini AI API",
                "Cloudinary CDN",
                "Nodemailer SMTP",
                "Framer Motion"
            ],
            impact: "Reimagines developer productivity and freelance collaboration with zero-friction micro-tasks, live multiplayer sprint duels, and cost-guard rate-limited AI assistance.",
            link: "https://elevatex-one.vercel.app",
            repo: "https://github.com/vivaswanshetty/ElevateX",
            metrics: [
                { label: "Architecture", val: "Full-Stack Monorepo" },
                { label: "Real-Time Sync", val: "Socket.io <50ms" },
                { label: "AI Assistant", val: "Elev AI (Draggable)" },
                { label: "Rate Limiting", val: "Cost-Guard Active" }
            ],
            architecture: "Full-Stack Monorepo architecture pairing a React + Vite + Tailwind frontend on Vercel with an Express.js backend on Railway. Features MongoDB Atlas schemas for users, tasks, posts, and AI chats, linked via a bidirectional Socket.io WebSocket cluster for live room state syncing.",
            challenges: [
                "Draggable Floating Elev AI Widget: Custom viewport boundary clamping, relative drag calculations, line-level quotation parsing, and in-memory session isolation before DB commit.",
                "Real-Time Productivity Duels: Bidirectional WebSocket synchronization ensuring clock-drift resilience during concurrent 1v1 developer sprint sessions.",
                "LLM Cost-Guard Protection: Implemented express-rate-limit middleware capping chatbot traffic at 20 requests per 5 minutes per IP to safeguard API budgets.",
                "Dynamic Trending Feed Algorithm: Real-time engagement ranking computed via dynamic weighted formula (likes + comments) with user discovery search."
            ]
        },
        {
            slug: "elevatex-mobile",
            title: "ElevateX Mobile App",
            category: "Mobile Apps",
            tagline: "High-Performance Gamified Momentum Network & Mobile Client",
            logo: elevatexLogo,
            image: elevatexMobileCoverImg,
            problem: "ElevateX Mobile is a high-performance cross-platform Expo client built with React Native 0.76, Expo SDK 52, TypeScript, and Bun. Features dark glassmorphism styling, native haptic feedback, Google OAuth & guest logins, Instagram-style real-time messaging with 200MB rich media uploads, 1v1 multiplayer skill duels, and a live task marketplace synchronized with the shared backend.",
            tech: [
                "React Native 0.76",
                "Expo SDK 52",
                "TypeScript (Strict)",
                "Bun Package Manager",
                "Expo Router",
                "TanStack React Query",
                "Zustand + AsyncStorage",
                "Socket.io Client",
                "Expo EAS Cloud Builds"
            ],
            impact: "Delivers a 60 FPS mobile client with custom HapticPressables, follow-locked messaging to eliminate spam, and seamless cross-platform synchronization with the ElevateX web ecosystem.",
            link: "https://github.com/vivaswanshetty/ElevateX-Mobile",
            repo: "https://github.com/vivaswanshetty/ElevateX-Mobile",
            metrics: [
                { label: "Runtime", val: "Expo SDK 52 + Bun" },
                { label: "Navigation", val: "Expo Router" },
                { label: "Messaging", val: "200MB Rich Media" },
                { label: "Performance", val: "60 FPS Haptics" }
            ],
            architecture: "Expo Router file-based architecture in apps/mobile/, leveraging TanStack React Query for cached server state, Zustand with AsyncStorage persistence for auth and user mutes, socket.io-client for real-time channels, and EAS Cloud Build profiles.",
            challenges: [
                "Instagram-Style Real-time Messaging: Built follow-locked DMs, double-tick read receipts, and asynchronous chunked 200MB photo/video upload streams with inline progress monitors.",
                "Suggested for You Discovery Carousel: Created interactive horizontal card sliders with Zustand-powered persistent user muting filters.",
                "Responsive Floating Tab Bar: Engineered keyboard listeners that automatically tuck the floating glass navigation bar away when typing.",
                "Multiplayer Duels Engine: Synchronized countdown timers and duel outcome verification over WebSocket events."
            ]
        },
        {
            slug: "conquerone",
            title: "CONQUER ONE",
            category: "Mobile Apps",
            tagline: "Elite Gym Training Protocol & Health Connect Engine",
            logo: conqueroneLogo,
            image: conqueroneImg,
            problem: "CONQUER ONE is an offline-first 6-day gym workout split training application built with React Native 0.81 and Expo SDK 54. Tailored for athletes who demand maximum performance, it combines a tactical dark mode and crimson aesthetic with Google Health Connect biometric integration, intelligent rest overlays, auto PR detection, CSV exports, and custom Gemini AI coaching with automated multi-model fallback.",
            tech: [
                "React Native 0.81",
                "Expo SDK 54",
                "React Navigation v7",
                "Firebase Auth v12",
                "Cloud Firestore",
                "AsyncStorage",
                "Google Gemini 2.5 Flash",
                "Health Connect Native Bridge",
                "Expo EAS OTA Updates"
            ],
            impact: "Provides distraction-free, structured 6-day split workouts with automated rest timers, bilateral unilateral tracking, voice cues, and cloud synchronization without subscriptions or intrusive ads.",
            link: "https://github.com/vivaswanshetty/ConquerONE",
            repo: "https://github.com/vivaswanshetty/ConquerONE",
            metrics: [
                { label: "Training Split", val: "6-Day Split" },
                { label: "AI Engine", val: "Gemini 2.5 Flash" },
                { label: "Biometrics", val: "Health Connect" },
                { label: "Offline Mode", val: "100% Local DB" }
            ],
            architecture: "Offline-first React Native architecture with local SQLite-backed AsyncStorage cache linked to an auto-sync background daemon that hydrates and pushes data to Cloud Firestore upon authentication. Integrated with Android Health Connect for biometric steps and MET calorie reads.",
            challenges: [
                "Gemini AI Multi-Model Fallback: Designed a resilient fallback cascade (Gemini 2.5 Flash -> Pro -> Flash 8b) to guarantee 99.9% uptime during rate limits.",
                "Offline-First Auto-Sync Daemon: Engineered conflict-resolution algorithms that merge local set logs with Cloud Firestore when transitioning between offline and online states.",
                "Unilateral Side-Isolated Tracking: Built independent left/right rep and weight logging with live previous-session record comparisons on active set cards.",
                "Biometric Device Integration: Interfaced with Android Health Connect API for background permission handling, step ingestion, and MET calorie calculations."
            ]
        },
        {
            slug: "portfolio",
            title: "Developer Portfolio",
            category: "Full-Stack Web",
            tagline: "High-Performance Cosmic Multi-Chromatic Portfolio System",
            logo: portfolioLogo,
            image: portfolioCoverImg,
            problem: "Engineered as an ultra-modern developer portfolio showcasing systems architecture, interactive screenshot galleries with device frames, command palette (⌘K), hardware-accelerated starfield canvas, and privacy-first cookie management.",
            tech: [
                "React 19 (Vite)",
                "Framer Motion",
                "Vanilla CSS Tokens",
                "Vercel Analytics",
                "lucide-react",
                "JSON-LD Schema"
            ],
            impact: "Delivers sub-second load times, smooth 60fps canvas starfield animations, accessible command palette search (⌘K), and recruiter-grade case studies.",
            link: "/",
            repo: "https://github.com/vivaswanshetty/Portfolio-Website",
            metrics: [
                { label: "Build Speed", val: "<1s Compilation" },
                { label: "Lighthouse", val: "98+ Performance" },
                { label: "Navigation", val: "⌘K Command Palette" },
                { label: "Analytics", val: "Vercel Live Edge" }
            ],
            architecture: "Single Page Application powered by Vite and React 19, custom CSS design token cascade, hardware-accelerated canvas background, and client-side routing with clean 404 fallbacks.",
            challenges: [
                "Crafting a hardware-accelerated 60fps Starfield particle engine with zero GPU jank.",
                "Implementing accessible keyboard navigation with hotkey interceptors for the Command Palette.",
                "GDPR/CCPA-compliant client-side cookie consent banner with zero external tracker leaks."
            ]
        }
    ],

    // ----------------------------------------------------
    // SKILLS SECTION
    // ----------------------------------------------------
    skills: {
        technical: [
            { name: "React & React Native (Expo)", level: 95 },
            { name: "JavaScript / TypeScript", level: 95 },
            { name: "Node.js & Express.js", level: 90 },
            { name: "MongoDB & Cloud Firestore", level: 92 },
            { name: "Firebase (Auth, DB, Storage)", level: 88 },
            { name: "C / C++", level: 85 },
            { name: "Python & Gemini AI SDK", level: 82 }
        ],
        domain: [
            "System Design & Architecture",
            "Mobile App Development (iOS & Android)",
            "UI/UX Design & User Research",
            "Full-Stack Web Engineering",
            "Real-Time Systems (Socket.io WebSockets)",
            "Product Strategy & Management",
            "DevOps & EAS Cloud Distribution"
        ],
        tools: [
            "VS Code",
            "Android Studio",
            "Expo EAS Builds",
            "Bun & npm",
            "Git & GitHub",
            "Figma",
            "Vercel & Railway",
            "MongoDB Atlas",
            "Postman",
            "Notion"
        ]
    },

    // ----------------------------------------------------
    // TESTIMONIALS SECTION
    // ----------------------------------------------------
    testimonials: [
        {
            quote: "Vivaswan demonstrates remarkable technical proficiency and architectural maturity. His ability to lead development on complex full-stack and mobile applications while solving deep systems challenges is exceptional.",
            author: "Academic Mentor",
            role: "Department of Computer Science & Engineering",
            company: "BMS College of Engineering"
        },
        {
            quote: "Working with Vivaswan on ElevateX was inspiring. He has an acute sense of UI/UX aesthetics combined with rock-solid full-stack engineering principles. He delivers production-grade code rapidly and thoughtfully.",
            author: "Engineering Collaborator",
            role: "Core Developer",
            company: "ElevateX Team"
        },
        {
            quote: "ConquerONE stands out as a masterclass in offline-first mobile engineering. The seamless background synchronization, Gemini AI fallback integration, and clean haptic flows showcase his high engineering standards.",
            author: "Peer Reviewer",
            role: "Mobile Systems Reviewer",
            company: "Developer Community"
        }
    ],

    // ----------------------------------------------------
    // CONTACT SECTION
    // ----------------------------------------------------
    contact: {
        email: "vivaswanprofessional@gmail.com",
        phone: "+91 9741634863",
        location: "Bengaluru, India",
        linkedin: "https://www.linkedin.com/in/vivaswanshetty",
        github: "https://github.com/vivaswanshetty",
        instagram: "https://instagram.com/vivaswan.shetty",
        x: "https://x.com/vivaswanshetty",
        tagline: "Always open to collaborating on high-impact projects, tech startups, and visionary engineering challenges."
    }
};
