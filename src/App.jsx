import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Hero';
import About from './components/About';
import Resume from './components/Resume';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Testimonials from './components/Testimonials';
import PrivacyPolicy from './components/PrivacyPolicy';
import Terms from './components/Terms';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import Starfield from './components/Starfield';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import CommandPalette from './components/CommandPalette';
import SpotlightCursor from './components/SpotlightCursor';
import CookieBanner from './components/CookieBanner';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import { Analytics } from '@vercel/analytics/react';

const AnimatedRoutes = () => {
    const location = useLocation();

    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        enter: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.25
            }
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={pageVariants}
            >
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/resume" element={<Resume />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/skills" element={<Skills />} />
                    <Route path="/testimonials" element={<Testimonials />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
};

function App() {
    return (
        <ToastProvider>
            <Router>
                <ScrollToTop />
                <Starfield />
                <SpotlightCursor />
                <ScrollProgress />
                <CommandPalette />
                <CookieBanner />
                <ToastContainer />
                <Analytics />
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Navbar />
                    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <AnimatedRoutes />
                    </main>
                    <Footer />
                </div>
            </Router>
        </ToastProvider>
    );
}

export default App;