import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, FolderGit2, FileText, Mail, Menu, X, Briefcase, Code, Star } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'HOME', path: '/', icon: Home },
        { name: 'ABOUT', path: '/about', icon: User },
        { name: 'PROJECTS', path: '/projects', icon: FolderGit2 },
        { name: 'SKILLS', path: '/skills', icon: Code },
        { name: 'RESUME', path: '/resume', icon: FileText },
    ];

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
                    <NavLink to="/contact" className="navbar-contact-btn">
                        <Mail size={14} />
                        CONTACT
                    </NavLink>
                </div>

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