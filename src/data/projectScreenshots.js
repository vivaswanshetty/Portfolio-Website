// -----------------------------------------------------------------------------
// PROJECT SCREENSHOTS & GALLERY METADATA
// -----------------------------------------------------------------------------

// ConquerONE Screenshots
import c1Home from '../assets/projects/conquerone/Home.webp';
import c1ActiveWorkout from '../assets/projects/conquerone/Actice Workout Screen.webp';
import c1WorkoutOverview from '../assets/projects/conquerone/Workout overview.webp';
import c1AiScreen from '../assets/projects/conquerone/AI Screen.webp';
import c1Overview from '../assets/projects/conquerone/Overview.webp';
import c1RestDay from '../assets/projects/conquerone/Rest Day View.webp';
import c1Settings from '../assets/projects/conquerone/Settings.webp';
import c1Connectors from '../assets/projects/conquerone/Additonal Connectors.webp';

// ElevateX Mobile Screenshots
import emHome from '../assets/projects/elevatex-mobile/Home.webp';
import emFeed from '../assets/projects/elevatex-mobile/Feed.webp';
import emExplore from '../assets/projects/elevatex-mobile/Explore Tasks.webp';
import emCreateTask from '../assets/projects/elevatex-mobile/Create Task.webp';
import emLobby from '../assets/projects/elevatex-mobile/Lobby.webp';
import emDuels from '../assets/projects/elevatex-mobile/Duels.webp';
import emChat from '../assets/projects/elevatex-mobile/Chat.webp';
import emAiAssistant from '../assets/projects/elevatex-mobile/AI Assistant.webp';
import emProfile from '../assets/projects/elevatex-mobile/Profile.webp';

// ElevateX Web Screenshots
import ewOpportunities from '../assets/projects/elevatex-web/Open opportunities.webp';
import ewLeaderboard from '../assets/projects/elevatex-web/Leaderboard.webp';
import ewResonance from '../assets/projects/elevatex-web/Resonance Chamber.webp';
import ewAlchemy from '../assets/projects/elevatex-web/Alchemy Lab.webp';
import ewCreateTask from '../assets/projects/elevatex-web/Create Task.webp';
import ewProductivity from '../assets/projects/elevatex-web/Productivity.webp';
import ewProfile from '../assets/projects/elevatex-web/Profile.webp';
import ewChat from '../assets/projects/elevatex-web/Chat.webp';
import ewSubscription from '../assets/projects/elevatex-web/Subscription.webp';
import ewUserSearch from '../assets/projects/elevatex-web/User Search.webp';
import ewWallet from '../assets/projects/elevatex-web/Wallet.webp';
import ewActivity from '../assets/projects/elevatex-web/Activity.webp';

// Portfolio Screenshots
import pHome from '../assets/projects/portfolio/Home.webp';
import pAbout from '../assets/projects/portfolio/About.webp';
import pProjects from '../assets/projects/portfolio/Projects.webp';
import pSkills from '../assets/projects/portfolio/Skills.webp';
import pContact from '../assets/projects/portfolio/Contact.webp';

export const projectScreenshots = {
    'conquerone': [
        { src: c1Home, title: "Training Dashboard & Streak Tracker", category: "Core UI", description: "Daily program routine, weekly split progress, rank tier status, and automated active day streak." },
        { src: c1ActiveWorkout, title: "Active Workout & Live Set Timer", category: "Training Engine", description: "Live rest countdowns, automated rep & weight logging, progressive overload prompts, and haptic feedback." },
        { src: c1WorkoutOverview, title: "Split Breakdown & Exercise Library", category: "Training Engine", description: "Target muscle engagement metrics, detailed movement video cues, and custom set configuration." },
        { src: c1AiScreen, title: "Gemini AI Coach & Form Advisor", category: "AI Intelligence", description: "Context-aware workout adjustments, recovery recommendations, and automated 6-model fallback architecture." },
        { src: c1Overview, title: "Analytics & Volume Progression", category: "Analytics", description: "Total tonnage lifted, MET-calculated calorie burn, and weekly muscle group volume distribution." },
        { src: c1RestDay, title: "Rest Day Recovery & Mobility", category: "Core UI", description: "Active recovery protocols, dynamic stretching routines, and sleep & hydration logging." },
        { src: c1Connectors, title: "Health Connect & Cloud Sync", category: "System Integration", description: "Google Health Connect bi-directional data flow, offline queue synchronization, and Firebase sync." },
        { src: c1Settings, title: "Profile, Preferences & EAS Updates", category: "Settings", description: "Custom weight units, dark/light ambient modes, and instant OTA firmware updates via Expo EAS." }
    ],
    'elevatex-mobile': [
        { src: emHome, title: "Gamified Hub & Task Feed", category: "Core UI", description: "User XP level progression, active bounties, skill exchange leaderboards, and quick task creation." },
        { src: emFeed, title: "Community Social Feed", category: "Social Network", description: "Real-time updates, task milestones, portfolio showcases, reactions, and threaded discussions." },
        { src: emExplore, title: "Explore Skill Opportunities", category: "Marketplace", description: "Geo-targeted and category-filtered task discovery with reward tiers and verified skill badges." },
        { src: emCreateTask, title: "Bounty & Task Composer", category: "Marketplace", description: "Rich media attachments, deadline scheduling, XP reward setting, and escrow deposit." },
        { src: emLobby, title: "Multiplayer Skill Lobbies", category: "Gamification", description: "Live skill matchmaking rooms, collaborative sprint sessions, and guild challenges." },
        { src: emDuels, title: "1v1 Timed Skill Duels", category: "Gamification", description: "Synchronous coding and design challenges with live timers, XP wagering, and anti-cheat validation." },
        { src: emChat, title: "Real-Time Socket.io Messenger", category: "Communication", description: "WhatsApp-style read receipts, audio messaging, media attachments, and end-to-end task escrow chat." },
        { src: emAiAssistant, title: "ElevateX AI Assistant", category: "AI Intelligence", description: "Automated task requirement generation, helper matching suggestions, and dispute resolution assistant." },
        { src: emProfile, title: "Gamer CV & Verified Portfolio", category: "Profile", description: "Dynamic skill radar charts, earned badges, completed task testimonials, and payout wallet." }
    ],
    'elevatex-web': [
        { src: ewOpportunities, title: "Open Opportunities Marketplace", category: "Marketplace", description: "Browse curated skill requests with real-time filtering, reward chips, and urgent request spotlights." },
        { src: ewLeaderboard, title: "Global XP & Reputation Leaderboard", category: "Gamification", description: "Tier rankings (Master, Diamond, Platinum), seasonal XP ladders, and community champions." },
        { src: ewResonance, title: "Resonance Chamber & Guild Hub", category: "Community", description: "Virtual co-working rooms, team hackathons, and real-time audio/chat collaboration spaces." },
        { src: ewAlchemy, title: "Alchemy Lab & Skill Crafting", category: "Gamification", description: "Combine micro-credentials into verified professional badges and unlock exclusive high-tier gigs." },
        { src: ewCreateTask, title: "Task Publisher & Milestone Escrow", category: "Marketplace", description: "Define task requirements, attach design files, set milestone deadlines, and secure funds." },
        { src: ewProductivity, title: "Sprint Analytics & Time Tracker", category: "Productivity", description: "Pomodoro-integrated task timers, weekly productivity heatmaps, and focus score ratings." },
        { src: ewChat, title: "Real-Time Collaborative Messenger", category: "Communication", description: "Socket.io real-time chat with file previews, code snippet formatting, and live status." },
        { src: ewSubscription, title: "Razorpay Pro Subscription Portal", category: "Monetization", description: "Tiered subscription management, automated invoice generation, and premium feature unlock." },
        { src: ewWallet, title: "Digital Earnings & Escrow Wallet", category: "Finance", description: "Instant Razorpay withdrawals, transaction audit history, platform fee breakdowns, and earnings graph." },
        { src: ewUserSearch, title: "Talent Search & Verified Directory", category: "Marketplace", description: "Search skilled helpers by specific technology stack, hourly rate, and peer review score." },
        { src: ewProfile, title: "Comprehensive Developer Profile", category: "Profile", description: "GitHub repository integration, verified skill badges, customer reviews, and bio showcase." },
        { src: ewActivity, title: "Activity Log & Audit Trail", category: "Analytics", description: "Real-time timeline of XP gains, task applications, payouts, and system alerts." }
    ],
    'portfolio': [
        { src: pHome, title: "Interactive Cosmic Hero & Terminal", category: "Hero & Brand", description: "Atmospheric multi-chromatic background, interactive command palette (⌘K), dynamic resume CTA, and quick links." },
        { src: pAbout, title: "Engineering Philosophy & Metrics", category: "About & Vision", description: "Interactive stat counters, core architectural principles, education credentials, and leadership trajectory." },
        { src: pProjects, title: "Featured Systems & Live Galleries", category: "Engineering Showcase", description: "Filterable project grid with live repository links, verified technology badges, and deep-dive case studies." },
        { src: pSkills, title: "Technical Arsenal & Competency Radar", category: "Technical Toolkit", description: "Categorized technical stack, proficiency meters, systems engineering toolsets, and certifications." },
        { src: pContact, title: "Interactive Terminal & Direct Inquiry", category: "Contact Hub", description: "Integrated terminal interface with live status pulse, social contact channels, and instant messaging." }
    ]
};
