import React, { Suspense, lazy, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Hero'; // Kept eager for instantaneous first paint

// Code-split sub-routes for high performance and minimal initial bundle size
const About = lazy(() => import('./components/About'));
const Resume = lazy(() => import('./components/Resume'));
const Projects = lazy(() => import('./components/Projects'));
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const Skills = lazy(() => import('./components/Skills'));
const Contact = lazy(() => import('./components/Contact'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Terms = lazy(() => import('./components/Terms'));
const NotFound = lazy(() => import('./components/NotFound'));

import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import Starfield from './components/Starfield';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import SpotlightCursor from './components/SpotlightCursor';
import CookieBanner from './components/CookieBanner';
import { ToastProvider } from './context/ToastContext';
const CyberDrone = lazy(() => import('./components/CyberDrone'));
import { IntroProvider } from './context/IntroContext';
import { GlobalAudioProvider } from './context/AudioContext';
import { useIntro } from './context/useIntro';
import { ToastContainer } from './components/Toast';
import { Analytics } from '@vercel/analytics/react';

// Sleek editorial top progress bar loader for instant route transitions
const RouteLoader = () => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.04)',
        overflow: 'hidden',
        pointerEvents: 'none'
    }}>
        <Motion.div
            style={{
                height: '100%',
                width: '40%',
                background: 'linear-gradient(90deg, transparent, #ef4444, #f87171, transparent)',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)'
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '350%' }}
            transition={{
                repeat: Infinity,
                duration: 0.9,
                ease: 'easeInOut'
            }}
        />
    </div>
);

const AnimatedRoutes = () => {
    const location = useLocation();
    const { isIntroActive, ensureDoneForSubroute } = useIntro();

    useEffect(() => {
        if (location.pathname !== '/' && isIntroActive) {
            ensureDoneForSubroute();
        }
    }, [location.pathname, isIntroActive, ensureDoneForSubroute]);

    const skipInitialHomeMotion = isIntroActive && location.pathname === '/';

    const pageVariants = {
        initial: {
            opacity: 0,
            y: 15
        },
        enter: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1]
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2
            }
        }
    };

    const isProjectsSphere = location.pathname === '/projects';
    const isSpatialScene = isProjectsSphere || location.pathname === '/about';

    const routeElement = (
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );

    if (isSpatialScene) {
        return (
            <Suspense fallback={<RouteLoader />}>
                <div key={location.pathname}>{routeElement}</div>
            </Suspense>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={<RouteLoader />}>
                <Motion.div
                    key={location.pathname}
                    initial={skipInitialHomeMotion ? false : "initial"}
                    animate="enter"
                    exit="exit"
                    variants={pageVariants}
                >
                    {routeElement}
                </Motion.div>
            </Suspense>
        </AnimatePresence>
    );
};

const AppLayout = () => {
    const location = useLocation();
    const isProjectsSphere = location.pathname === '/projects';

    return (
        <>
            <a href="#main-content" className="skip-to-content-link">
                Skip to content
            </a>
            <ScrollToTop />
            <Starfield />
            {!isProjectsSphere && <SpotlightCursor />}
            {!isProjectsSphere && <ScrollProgress />}
            {!isProjectsSphere && <CookieBanner />}
            <ToastContainer />
            <Analytics />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <Suspense fallback={null}>
                    <CyberDrone />
                </Suspense>
                <main id="main-content" tabIndex="-1" style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', outline: 'none' }}>
                    <ErrorBoundary>
                        <AnimatedRoutes />
                    </ErrorBoundary>
                </main>
                {!isProjectsSphere && <Footer />}
            </div>
        </>
    );
};

function App() {
    return (
        <GlobalAudioProvider>
            <ToastProvider>
                <IntroProvider>
                    <Router>
                        <AppLayout />
                    </Router>
                </IntroProvider>
            </ToastProvider>
        </GlobalAudioProvider>
    );
}

export default App;