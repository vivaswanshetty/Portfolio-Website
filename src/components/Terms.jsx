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
        <div className="page-container" ref={containerRef}>
            <motion.div
                style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    position: 'relative'
                }}
            >
                <motion.div style={{ y: headerY }}>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--accent-primary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginBottom: '1.5rem',
                            textDecoration: 'none',
                            padding: '0.4rem 1rem',
                            borderRadius: '9999px',
                            background: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.15)'
                        }}
                    >
                        <ArrowLeft size={14} /> Back to Home
                    </Link>

                    <h1 style={{ marginBottom: '1rem', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}>Terms of Service</h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
                        Last Updated: May 2026. Standard usage terms and intellectual property information.
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
                        className="card"
                        style={{ padding: '2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <section.icon size={20} color="var(--accent-primary)" />
                            </div>
                            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{section.title}</h2>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
                            {section.content}
                        </p>
                    </motion.div>
                ))}

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/contact" className="btn btn-outline">
                        <Mail size={16} /> Contact For Inquiries
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Terms;
