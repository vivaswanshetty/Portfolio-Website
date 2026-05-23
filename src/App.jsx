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
import Footer from './components/Footer';
import Starfield from './components/Starfield';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
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
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.3
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
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
};

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Starfield />
            <ScrollProgress />
            <Analytics />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <AnimatedRoutes />
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;