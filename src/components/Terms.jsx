import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileCode2, Scale, Copyright, AlertTriangle, ArrowLeft, Mail } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const Terms = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 60]);
    const { contact } = portfolioData;

    const termsSections = [
        {
            icon: Scale,
            title: "1. Acceptance of Terms",
            content: "By accessing and using this portfolio website (the \"Site\"), you agree to abide by these Terms of Service. If you do not agree with any part of these terms, please discontinue use of the site."
        },
        {
            icon: Copyright,
            title: "2. Intellectual Property & Project Code",
            content: "All content, designs, assets, and branding on this site are the property of Vivaswan Shetty unless otherwise attributed. Code repositories showcased on this site (such as ElevateX and ConquerONE) are subject to their respective open-source licenses or proprietary rights specified within their GitHub repositories. You may view and inspect code for educational and evaluation purposes."
        },
        {
            icon: FileCode2,
            title: "3. Permitted & Prohibited Use",
            content: "You are granted a non-exclusive, revocable license to access this website for personal, non-commercial, and recruiting purposes. You agree not to perform automated denial-of-service attacks, scraping of contact information for spam campaigns, or attempts to disrupt site operations."
        },
        {
            icon: AlertTriangle,
            title: "4. Disclaimer of Warranties",
            content: "This website and its demo links are provided on an \"as is\" and \"as available\" basis without warranties of any kind. While I strive to ensure all showcased applications and uptime are maintained, I make no representations regarding absolute availability or zero-downtime guarantees."
        }
    ];

    return (
        <div className="editorial-page-container" ref={containerRef}>
            <motion.div
                style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    position: 'relative'
                }}
            >
                <motion.div style={{ y: headerY }}>
                    <div className="editorial-eyebrow-container" style={{ justifyContent: 'center', marginBottom: '0.8rem' }}>
                        <span className="editorial-eyebrow-text">
                            LEGAL TERMS & GOVERNANCE.
                        </span>
                        <div className="editorial-eyebrow-rule" />
                    </div>

                    <h1 className="editorial-page-title" style={{ textAlign: 'center', margin: '0 auto 1rem' }}>
                        TERMS OF <span style={{ color: '#ef4444' }}>SERVICE</span>.
                    </h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                        Last Updated: 2026. Standard usage terms and intellectual property information.
                    </p>
                </motion.div>
            </motion.div>

            <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {termsSections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        className="editorial-card"
                        style={{ padding: '2.25rem 2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <section.icon size={18} color="#ef4444" />
                            </div>
                            <h2 style={{ fontSize: '1.15rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}>{section.title}</h2>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
                            {section.content}
                        </p>
                    </motion.div>
                ))}

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/contact" className="editorial-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={16} /> CONTACT FOR INQUIRIES
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Terms;
