import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, FolderGit2, FileText, Mail, Menu, X, Code, Search } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'About', path: '/about', icon: User },
        { name: 'Projects', path: '/projects', icon: FolderGit2 },
        { name: 'Skills', path: '/skills', icon: Code },
        { name: 'Resume', path: '/resume', icon: FileText },
    ];

    const openCommandPalette = () => {
        window.dispatchEvent(new CustomEvent('open-command-palette'));
    };

    return (
        <>
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="navbar-main"
            >
                {/* Brand Logo */}
                <NavLink
                    to="/"
                    className="navbar-logo"
                    onClick={() => {
                        setIsOpen(false);
                        if (window.location.pathname === '/') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}
                >
                    <span className="navbar-logo-text">VIVASWAN</span>
                    <span className="navbar-logo-dot" />
                </NavLink>

                {/* Desktop Navigation Links */}
                <div className="desktop-only navbar-links">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <span style={{ position: 'relative', zIndex: 2 }}>{link.name}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavIndicator"
                                            className="navbar-active-pill"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Right Side Actions: Command Palette & Contact */}
                <div className="desktop-only navbar-actions">
                    <motion.button
                        onClick={openCommandPalette}
                        className="navbar-cmd-btn"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        title="Search & Commands (⌘K / Ctrl+K)"
                    >
                        <Search size={13} className="navbar-cmd-icon" />
                        <span className="navbar-cmd-shortcut">⌘K</span>
                    </motion.button>

                    <NavLink to="/contact" className="navbar-contact-btn">
                        <span>Contact</span>
                    </NavLink>
                </div>

                {/* Mobile Right Controls */}
                <div className="mobile-actions">
                    <motion.button
                        onClick={openCommandPalette}
                        className="mobile-cmd-btn"
                        whileTap={{ scale: 0.92 }}
                        title="Search & Commands"
                    >
                        <Search size={17} />
                    </motion.button>

                    <motion.button
                        onClick={() => setIsOpen(!isOpen)}
                        className="mobile-toggle"
                        whileTap={{ scale: 0.9 }}
                        aria-label="Toggle menu"
                    >
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                    <X size={22} />
                                </motion.div>
                            ) : (
                                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                                    <Menu size={22} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.nav>

            {/* Mobile Drawer Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.3 }}
                        className="mobile-menu"
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '320px' }}>
                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.path}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: idx * 0.06 }}
                                >
                                    <NavLink
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`}
                                    >
                                        <div className="mobile-menu-icon">
                                            <link.icon size={20} />
                                        </div>
                                        <span>{link.name}</span>
                                    </NavLink>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: navLinks.length * 0.06 }}
                                style={{ marginTop: '1rem' }}
                            >
                                <NavLink
                                    to="/contact"
                                    onClick={() => setIsOpen(false)}
                                    className="mobile-menu-link contact-pill"
                                >
                                    <div className="mobile-menu-icon contact">
                                        <Mail size={20} />
                                    </div>
                                    <span>Get In Touch</span>
                                </NavLink>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;