import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, Home, FolderGit2, FileText, Mail, ArrowRight } from 'lucide-react';

const NotFound = () => {
    const quickLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Projects', path: '/projects', icon: FolderGit2 },
        { name: 'Resume', path: '/resume', icon: FileText },
        { name: 'Contact', path: '/contact', icon: Mail }
    ];

    return (
        <div
            className="editorial-page-container"
            style={{
                minHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                paddingTop: 'calc(var(--nav-height) + 4rem)'
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'relative', marginBottom: '2.5rem', width: '100%', maxWidth: '640px' }}
            >
                <div className="editorial-eyebrow-container" style={{ justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <span className="editorial-eyebrow-text">
                        SYSTEM STATUS: 404 NOT FOUND
                    </span>
                    <div className="editorial-eyebrow-rule" />
                </div>

                <h1 style={{
                    fontSize: 'clamp(4.5rem, 12vw, 8rem)',
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    fontFamily: 'var(--font-heading)',
                    color: '#ffffff',
                    marginBottom: '0.75rem'
                }}>
                    ERROR <span style={{ color: '#ef4444' }}>404</span>
                </h1>

                <h2 style={{
                    fontSize: 'clamp(1.25rem, 3.5vw, 1.8rem)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#f8fafc',
                    marginBottom: '1rem'
                }}>
                    SPECIFIED RESOURCE <span style={{ color: '#ef4444' }}>NOT LOCATED</span>
                </h2>

                <p style={{ maxWidth: '480px', margin: '0 auto 2.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    The path or coordinates you are attempting to reach do not exist in the official production registry.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
                    <Link to="/" className="editorial-btn-primary">
                        <Home size={16} /> RETURN TO ARCHIVE
                    </Link>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ width: '100%', maxWidth: '700px' }}
            >
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                    <span className="editorial-eyebrow-text" style={{ color: '#94a3b8' }}>
                        AVAILABLE SYSTEM ROUTES
                    </span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '1rem'
                }}>
                    {quickLinks.map((link, idx) => (
                        <Link
                            key={idx}
                            to={link.path}
                            className="editorial-card"
                            style={{
                                padding: '1.25rem 1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.6rem',
                                textDecoration: 'none',
                                color: '#fff',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                        >
                            <link.icon size={18} color="#ef4444" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{link.name}</span>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
