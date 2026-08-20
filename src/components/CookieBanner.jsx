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
                    initial={{ opacity: 0, y: 50, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'fixed',
                        bottom: '1.5rem',
                        left: '1.5rem',
                        right: '1.5rem',
                        maxWidth: '520px',
                        zIndex: 9990,
                        background: 'rgba(3, 7, 18, 0.95)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        borderLeft: '3px solid #ef4444',
                        borderRadius: 0,
                        padding: '1.4rem 1.6rem',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.1rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 0,
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <ShieldCheck size={18} color="#ef4444" />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem', color: '#ffffff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-heading)' }}>
                                PRIVACY & ANALYTICS
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                                This website uses lightweight, privacy-preserving analytics without invasive trackers or cross-site cookies.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <Link
                            to="/privacy"
                            onClick={() => setIsVisible(false)}
                            className="editorial-btn-secondary"
                            style={{
                                fontSize: '0.74rem',
                                padding: '0.3rem 0.5rem'
                            }}
                        >
                            PRIVACY POLICY <ArrowRight size={12} />
                        </Link>

                        <button
                            onClick={handleAccept}
                            className="editorial-btn-primary"
                            style={{
                                padding: '0.5rem 1.4rem',
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: '#ef4444',
                                borderColor: '#ef4444',
                                color: '#ffffff'
                            }}
                        >
                            <Check size={14} /> GOT IT
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
