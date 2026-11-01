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
                    className="editorial-cookie-banner"
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    role="region"
                    aria-label="Privacy and cookies notice"
                >
                    <div className="cookie-banner-content">
                        <div className="cookie-banner-icon-box" aria-hidden="true">
                            <ShieldCheck size={16} color="#ef4444" />
                        </div>
                        <div className="cookie-banner-text-group">
                            <span className="cookie-banner-title">
                                PRIVACY & ANALYTICS
                            </span>
                            <span className="cookie-banner-copy">
                                Lightweight, privacy-preserving analytics without invasive trackers or cross-site cookies.
                            </span>
                        </div>
                    </div>

                    <div className="cookie-banner-actions">
                        <Link
                            to="/privacy"
                            onClick={() => setIsVisible(false)}
                            className="cookie-banner-link"
                        >
                            PRIVACY POLICY <ArrowRight size={11} />
                        </Link>

                        <button
                            onClick={handleAccept}
                            className="cookie-banner-btn-accept"
                            aria-label="Accept privacy policy"
                        >
                            <Check size={13} /> GOT IT
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;
