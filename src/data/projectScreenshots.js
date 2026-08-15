// -----------------------------------------------------------------------------
// PROJECT SCREENSHOTS & GALLERY METADATA
// -----------------------------------------------------------------------------

// ConquerONE Screenshots
import c1Home from '../assets/projects/conquerone/Home.jpeg';
import c1ActiveWorkout from '../assets/projects/conquerone/Actice Workout Screen.jpeg';
import c1WorkoutOverview from '../assets/projects/conquerone/Workout overview.jpeg';
import c1AiScreen from '../assets/projects/conquerone/AI Screen.jpeg';
import c1Overview from '../assets/projects/conquerone/Overview.jpeg';
import c1RestDay from '../assets/projects/conquerone/Rest Day View.jpeg';
import c1Settings from '../assets/projects/conquerone/Settings.jpeg';
import c1Connectors from '../assets/projects/conquerone/Additonal Connectors.jpeg';

// ElevateX Mobile Screenshots
import emHome from '../assets/projects/elevatex-mobile/Home.jpeg';
import emFeed from '../assets/projects/elevatex-mobile/Feed.jpeg';
import emExplore from '../assets/projects/elevatex-mobile/Explore Tasks.jpeg';
import emCreateTask from '../assets/projects/elevatex-mobile/Create Task.jpeg';
import emLobby from '../assets/projects/elevatex-mobile/Lobby.jpeg';
import emDuels from '../assets/projects/elevatex-mobile/Duels.jpeg';
import emChat from '../assets/projects/elevatex-mobile/Chat.jpeg';
import emAiAssistant from '../assets/projects/elevatex-mobile/AI Assistant.jpeg';
import emProfile from '../assets/projects/elevatex-mobile/Profile.jpeg';

// ElevateX Web Screenshots
import ewOpportunities from '../assets/projects/elevatex-web/Open opportunities.png';
import ewLeaderboard from '../assets/projects/elevatex-web/Leaderboard.png';
import ewResonance from '../assets/projects/elevatex-web/Resonance Chamber.png';
import ewAlchemy from '../assets/projects/elevatex-web/Alchemy Lab.png';
import ewCreateTask from '../assets/projects/elevatex-web/Create Task.png';
import ewProductivity from '../assets/projects/elevatex-web/Productivity.png';
import ewProfile from '../assets/projects/elevatex-web/Profile.png';
import ewChat from '../assets/projects/elevatex-web/Chat.png';
import ewSubscription from '../assets/projects/elevatex-web/Subscription.png';
import ewUserSearch from '../assets/projects/elevatex-web/User Search.png';
import ewWallet from '../assets/projects/elevatex-web/Wallet.png';
import ewActivity from '../assets/projects/elevatex-web/Activity.png';

// Portfolio Mockup
import portfolioHero from '../assets/portfolio_mockup.png';

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
        { src: portfolioHero, title: "Minimalist Cosmic Interface", category: "UI/UX", description: "Custom Starfield animation, responsive navigation, and performance-optimized single-page architecture." }
    ]
};
