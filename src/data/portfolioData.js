// -----------------------------------------------------------------------------
// PORTFOLIO DATA FILE
// -----------------------------------------------------------------------------
// Update this file with your references to change the website content.
// No coding updates are required in the components.
// -----------------------------------------------------------------------------
import elevatexImg from '../assets/elevatex.png';
import conqueroneImg from '../assets/conquerone.png';
import portfolioMockupImg from '../assets/portfolio_mockup.png';


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
            { label: "Lines of Code", value: "60k+", link: "/projects" },
            { label: "Caffeine Intake", value: "0 L", link: "/about" },
            { label: "Bugs Squashed", value: "800+", link: "/projects" },
            { label: "Hours in Flow", value: "1500+", link: "/skills" }
        ]
    },

    // ----------------------------------------------------
    // RESUME SECTION
    // ----------------------------------------------------
    resume: {
        title: "Resume & CV",
        pdfLink: "/resume.pdf",
        education: [
            {
                degree: "Bachelor of Engineering (B.E) in Computer Science",
                institution: "BMS College of Engineering, Bengaluru",
                year: "2024 - 2028 (Expected)",
                location: "Bengaluru, India",
                desc: "CGPA: 8.67. Coursework: Data Structures, Database Management Systems, Analysis & Design of Algorithms, Operating Systems."
            },
            {
                degree: "Pre-University (PCMC)",
                institution: "Poornaprajna PU College, Udupi",
                year: "2022 - 2024",
                location: "Udupi, India",
                desc: "Grade: 398/400 (99.5%)."
            }
        ],
        experience: [
            {
                role: "Creator & Lead Developer",
                company: "ConquerONE (AI Fitness Mobile App)",
                duration: "2026 - Present",
                description: "Built a production-ready fitness app featuring a 6-day dumbbell-only program with automated set tracking, streak system, and rank progression. Integrated Gemini AI coaching with automatic multi-model fallback across 6 models. Implemented Google Health Connect integration and OTA updates via Expo EAS.",
                highlights: ["React Native", "Expo", "Firebase", "Gemini AI", "Health Connect"]
            },
            {
                role: "Founder & Lead Developer",
                company: "ElevateX (Gamified Skill Marketplace)",
                duration: "2025 - Present",
                description: "Engineered a full-stack gamified marketplace serving both web and mobile, featuring JWT authentication, XP progression, leaderboard and Razorpay subscription. Built real-time chat with Socket.io supporting WhatsApp-style read receipts, reactions, and media. Developed social feed with follow system, likes, and comments using Express.js and MongoDB.",
                highlights: ["MERN Stack", "React Native", "Socket.io", "TypeScript", "MongoDB"]
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
            tagline: "Full-Stack Gamified Skill Marketplace & Micro-Earnings Platform",
            image: elevatexImg,
            problem: "Traditional freelance platforms have high commission barriers, slow payment settlement, and lack engaging collaboration workflows for urgent technical micro-tasks. ElevateX solves this by gamifying skill exchanges with instant task matching, escrow payouts, and live community hubs.",
            tech: [
                "React 18 (Vite)",
                "Node.js & Express",
                "MongoDB Atlas",
                "Socket.io",
                "TypeScript",
                "JWT Auth",
                "Razorpay API",
                "Vercel & Railway"
            ],
            impact: "Empowers developers and creators with zero-barrier micro-earnings, reduces skill acquisition latency, and increases task turnaround through real-time communication and milestone-based escrow.",
            link: "https://elevatex-one.vercel.app",
            repo: "https://github.com/vivaswanshetty/ElevateX",
            metrics: [
                { label: "Platform Views", val: "15+ Screens" },
                { label: "Socket Latency", val: "<50ms" },
                { label: "Payment Security", val: "100% Escrow" },
                { label: "Gamification", val: "XP & Guilds" }
            ],
            architecture: "Client-Server architecture with React (Vite) deployed on Vercel, a Node.js/Express micro-backend on Railway, MongoDB Atlas with optimized compound indexes, and a Socket.io WebSocket cluster for bidirectional real-time events.",
            challenges: [
                "Real-time state synchronization across concurrent guild rooms with auto-reconnection handling.",
                "Idempotent Razorpay webhook architecture ensuring zero duplicate transactions during network retries.",
                "Secure JWT token refresh rotation with HTTP-only cookies and role-based permissions."
            ]
        },
        {
            slug: "elevatex-mobile",
            title: "ElevateX Mobile App",
            category: "Mobile Apps",
            tagline: "Cross-Platform Gamified Skill Exchange & Multiplayer Duels",
            image: elevatexImg,
            problem: "On-the-go freelancers and students need instant mobile access to task notifications, live chat, and skill challenges without losing desktop parity. The ElevateX mobile app delivers native performance with gesture-driven workflows.",
            tech: [
                "React Native (Expo)",
                "TypeScript",
                "Socket.io Client",
                "Expo Router",
                "Reanimated 3",
                "AsyncStorage",
                "EAS Build"
            ],
            impact: "Provides 60 FPS mobile performance, push notification alerts for urgent tasks, and multiplayer 1v1 skill duels with synchronous timers.",
            link: "https://github.com/vivaswanshetty/ElevateX-Mobile",
            repo: "https://github.com/vivaswanshetty/ElevateX-Mobile",
            metrics: [
                { label: "Target Platforms", val: "iOS & Android" },
                { label: "Target FPS", val: "60 FPS" },
                { label: "Duel Engine", val: "Live Sync" },
                { label: "Deployment", val: "Expo EAS" }
            ],
            architecture: "Modular Expo framework utilizing React Navigation native stack, custom audio recorder modules, optimistic WebSocket state updates, and over-the-air EAS updates.",
            challenges: [
                "Low-latency timer synchronization for 1v1 multiplayer coding duels across mobile networks.",
                "Optimistic UI rendering for direct messaging with audio attachment caching and progressive uploads.",
                "Smooth 60 FPS gesture animations using react-native-reanimated worklets."
            ]
        },
        {
            slug: "conquerone",
            title: "ConquerONE",
            category: "Mobile Apps",
            tagline: "AI-Powered 6-Day Dumbbell Training & Health Connect Engine",
            image: conqueroneImg,
            problem: "Fitness enthusiasts training with home dumbbells often lack structured progressive overload protocols and live coaching feedback without expensive subscriptions or invasive ads.",
            tech: [
                "React Native (Expo)",
                "Cloud Firestore",
                "Firebase Auth",
                "Google Gemini AI",
                "Health Connect",
                "Reanimated v4",
                "EAS Updates"
            ],
            impact: "Delivers an ad-free 6-day split protocol with automated rest timers, streak tracking, volume progression curves, and context-aware Gemini AI coaching.",
            link: "https://github.com/vivaswanshetty/ConquerONE",
            repo: "https://github.com/vivaswanshetty/ConquerONE",
            metrics: [
                { label: "AI Resilience", val: "6-Model Cascade" },
                { label: "Training Split", val: "6-Day Protocol" },
                { label: "Health Sync", val: "Google Health" },
                { label: "Offline Cache", val: "100% Local" }
            ],
            architecture: "Offline-first React Native architecture backed by Firebase Cloud Firestore, integrated with Google Health Connect for bi-directional biometric metrics, and Gemini Generative AI SDK.",
            challenges: [
                "Building an automated 6-model Gemini AI fallback cascade that switches models dynamically during API rate limits.",
                "Bi-directional Google Health Connect synchronization handling background permissions and sensor errors.",
                "Background workout audio countdowns and haptic triggers that persist during lock screen states."
            ]
        },
        {
            slug: "portfolio",
            title: "Developer Portfolio",
            category: "Full-Stack Web",
            tagline: "High-Performance Cosmic Multi-Chromatic Portfolio System",
            image: portfolioMockupImg,
            problem: "Engineering portfolios often rely on generic templates that fail to convey technical depth, system architecture, and interactive design excellence to modern tech recruiters.",
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
                { label: "Build Time", val: "<1s" },
                { label: "Lighthouse Score", val: "98+" },
                { label: "Command Palette", val: "⌘K Enabled" },
                { label: "Analytics", val: "Vercel Live" }
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
            { name: "React & React Native", level: 95 },
            { name: "JavaScript/TypeScript", level: 95 },
            { name: "Node.js & Express.js", level: 90 },
            { name: "MongoDB & Cloud Firestore", level: 92 },
            { name: "Firebase (Auth, DB, Storage)", level: 88 },
            { name: "C/C++", level: 85 },
            { name: "Python", level: 80 }
        ],
        domain: ["System Design & Architecture", "Mobile App Development", "UI/UX Design & User Research", "Full-Stack Web Engineering", "Real-Time Systems (Socket.io)", "Product Strategy & Management"],
        tools: ["VS Code", "Android Studio", "Expo EAS Updates", "Git/GitHub", "Figma", "Vercel & Railway", "MongoDB Atlas", "Postman", "Notion"]
    },





    // ----------------------------------------------------
    // TESTIMONIALS SECTION
    // ----------------------------------------------------
    testimonials: [
        {
            name: "Jensen Huang",
            role: "CEO, NVIDIA",
            content: "Vivaswan is an exceptional developer with a keen eye for design. He delivered our project on time and exceeded our expectations."
        },
        {
            name: "Elon Musk",
            role: "CEO, Tesla",
            content: "It's impressive how Vivaswan can turn complex ideas into reality. His technical skills combined with entrepreneurial thinking are rare."
        }
    ],

    // ----------------------------------------------------
    // CONTACT SECTION
    // ----------------------------------------------------
    contact: {
        email: "vivaswanprofessional@gmail.com",
        linkedin: "https://www.linkedin.com/in/vivaswanshetty",
        github: "https://github.com/vivaswanshetty",
        instagram: "https://instagram.com/vivaswan.shetty",
        x: "https://x.com/vivaswanshetty",
        phone: "+91 8073352003"
    }
};
