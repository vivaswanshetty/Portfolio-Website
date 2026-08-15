import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, FolderGit2, FileText, Mail, Menu, X, Code, Search, Sparkles } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'HOME', path: '/', icon: Home },
        { name: 'ABOUT', path: '/about', icon: User },
        { name: 'PROJECTS', path: '/projects', icon: FolderGit2 },
        { name: 'SKILLS', path: '/skills', icon: Code },
        { name: 'RESUME', path: '/resume', icon: FileText },
    ];

    const openCommandPalette = () => {
        window.dispatchEvent(new CustomEvent('open-command-palette'));
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="navbar-main"
            >
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
                    VIVASWAN
                </NavLink>

                <div className="desktop-only navbar-links">
                    {navLinks.map((link) => (
                        <motion.div
                            key={link.path}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                            >
                                <link.icon size={14} />
                                {link.name}
                            </NavLink>
                        </motion.div>
                    ))}

                    {/* Command Palette Trigger Button */}
                    <motion.button
                        onClick={openCommandPalette}
                        className="navbar-link"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.45rem 0.8rem'
                        }}
                        title="Open Command Palette (Cmd + K / Ctrl + K)"
                    >
                        <Search size={13} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.72rem', letterSpacing: '0.05em', color: '#fff', fontWeight: 600 }}>⌘K</span>
                    </motion.button>

                    <NavLink to="/contact" className="navbar-contact-btn">
                        <Mail size={14} />
                        CONTACT
                    </NavLink>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Mobile Command Palette trigger */}
                    <motion.button
                        onClick={openCommandPalette}
                        className="mobile-toggle"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            display: 'none',
                            padding: '0.4rem',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}
                        title="Search & Commands"
                    >
                        <Search size={18} color="var(--accent-primary)" />
                    </motion.button>

                    <motion.button
                        onClick={() => setIsOpen(!isOpen)}
                        className="mobile-toggle"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                    <X size={24} />
                                </motion.div>
                            ) : (
                                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                                    <Menu size={24} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mobile-menu"
                    >
                        {navLinks.map((link, idx) => (
                            <motion.div
                                key={link.path}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: idx * 0.08 }}
                            >
                                <NavLink
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="mobile-menu-link"
                                >
                                    <link.icon size={26} />
                                    {link.name}
                                </NavLink>
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: navLinks.length * 0.08 }}
                        >
                            <NavLink
                                to="/contact"
                                onClick={() => setIsOpen(false)}
                                className="mobile-menu-link contact"
                            >
                                <Mail size={26} />
                                CONTACT
                            </NavLink>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;