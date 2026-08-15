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
            className="page-container"
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ position: 'relative', marginBottom: '2rem' }}
            >
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    zIndex: -1
                }} />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        border: '2px dashed rgba(59, 130, 246, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}
                >
                    <Compass size={48} color="var(--accent-primary)" />
                </motion.div>

                <h1 style={{
                    fontSize: 'clamp(4rem, 12vw, 8rem)',
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    404
                </h1>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '1rem' }}>
                    Lost in Cyberspace
                </h2>
                <p style={{ maxWidth: '480px', margin: '0 auto 2.5rem', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                    The page or coordinates you are attempting to reach do not exist in this sector of the web.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
                    <Link to="/" className="btn btn-primary">
                        <Home size={18} /> Return to Mission Control
                    </Link>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ width: '100%', maxWidth: '600px' }}
            >
                <span style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--accent-primary)',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    display: 'block'
                }}>
                    Quick Waypoints
                </span>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '1rem'
                }}>
                    {quickLinks.map((link, idx) => (
                        <Link
                            key={idx}
                            to={link.path}
                            className="card"
                            style={{
                                padding: '1.2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.6rem',
                                textDecoration: 'none',
                                color: '#fff',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <link.icon size={20} color="var(--accent-primary)" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{link.name}</span>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
