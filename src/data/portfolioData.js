// -----------------------------------------------------------------------------
// PORTFOLIO DATA FILE
// -----------------------------------------------------------------------------
// Update this file with your references to change the website content.
// No coding updates are required in the components.
// -----------------------------------------------------------------------------
import elevatexImg from '../assets/elevatex.png';
import conqueroneImg from '../assets/conquerone.png';


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
        description: "I am currently pursuing my degree in Engineering, with a focus on blending technical depth with entrepreneurial vision. My journey is defined by a relentless drive to innovate and lead teams towards impactful technology solutions. I believe in the power of code to solve real-world problems and creating sustainable business models around them.",
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
            title: "ElevateX (Web & Mobile)",
            image: elevatexImg,
            problem: "A full-stack gamified marketplace consisting of a React web client, a cross-platform React Native (Expo) mobile client, and a shared Express.js backend. ElevateX connects requesters with skilled helpers instantly for micro-tasks, featuring real-time Socket.io chat, WhatsApp-style read receipts, interactive leaderboards, and Razorpay subscriptions.",
            tech: [
                "React Native (Expo)",
                "React (Vite)",
                "TypeScript",
                "Socket.io",
                "Node.js + Express",
                "MongoDB",
                "JWT Auth"
            ],
            impact: "Reduces friction for small, urgent skill exchanges; provides a new revenue stream and micro-earning channel for creators; increases task completion rates via gamification (XP, badges).",
            link: "https://elevatex-one.vercel.app",
            repo: "https://github.com/vivaswanshetty/ElevateX",
            mobileRepo: "https://github.com/vivaswanshetty/ElevateX-Mobile"
        },
        {
            title: "ConquerONE",
            image: conqueroneImg,
            problem: "Athletes and fitness enthusiasts training with dumbbells need structured, high-intensity training guidance and real-time set tracking without intrusive ads or subscription fees. ConquerONE provides a 6-day split protocol with live timer tracking, offline-first syncing, and custom workout creation.",
            tech: [
                "React Native (Expo)",
                "Cloud Firestore",
                "Firebase Auth",
                "Expo EAS Updates",
                "Google Gemini API",
                "Reanimated v4",
                "Health Connect"
            ],
            impact: "Delivers structured training with live set progress haptics, streak milestones, voice cues, and MET calorie estimates. Real-time Firebase cloud integration syncs data dynamically while maintaining offline-first tracking capabilities.",
            link: "https://github.com/vivaswanshetty/ConquerONE",
            repo: "https://github.com/vivaswanshetty/ConquerONE"
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
        phone: "+91 8073352003"
    }
};
