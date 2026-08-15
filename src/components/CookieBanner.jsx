import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';

export const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('vivaswan_privacy_consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('vivaswan_privacy_consent', 'accepted');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'fixed',
                        bottom: '1.5rem',
                        left: '1.5rem',
                        right: '1.5rem',
                        maxWidth: '520px',
                        zIndex: 9990,
                        background: 'rgba(15, 23, 42, 0.88)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '1.25rem',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(59, 130, 246, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(59, 130, 246, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <ShieldCheck size={20} color="var(--accent-primary)" />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem', color: '#fff', fontWeight: 600 }}>
                                Privacy & Analytics
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
                                This website uses lightweight, privacy-preserving analytics without invasive trackers or cross-site cookies.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <Link
                            to="/privacy"
                            onClick={() => setIsVisible(false)}
                            style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                textDecoration: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '6px',
                                transition: 'color 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                            Privacy Policy <ArrowRight size={12} />
                        </Link>

                        <button
                            onClick={handleAccept}
                            className="btn btn-primary"
                            style={{
                                padding: '0.45rem 1.1rem',
                                fontSize: '0.82rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <Check size={14} /> Got It
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
