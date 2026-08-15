import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Cookie, FileText, ArrowLeft, Mail, CheckCircle, Database } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const PrivacyPolicy = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 60]);
    const { contact } = portfolioData;

    const sections = [
        {
            icon: ShieldCheck,
            title: "1. Overview & Commitment",
            content: "This Privacy Policy applies to this personal developer portfolio and web showcase operated by Vivaswan Shetty (\"I\", \"me\", or \"my\"). I value your privacy and believe in privacy-by-design, data minimization, and total transparency. This page explains what limited information is processed when you visit this website or contact me."
        },
        {
            icon: Eye,
            title: "2. Information Collected",
            content: "This website is a static showcase and does not require account creation, logins, or tracking of sensitive Personally Identifiable Information (PII). When you interact with the site, only the following minimal data may be processed:\n• Contact Inquiries: If you send an email directly to me via provided links, your email address, name, and message contents are received solely to respond to your inquiry.\n• Aggregated Privacy-First Analytics: I utilize Vercel Analytics to monitor general performance, page views, and visitor geographic regions. Vercel Analytics does not track unique IP addresses across sites, does not use persistent cross-site tracking cookies, and does not sell or share your data."
        },
        {
            icon: Cookie,
            title: "3. Cookies & Local Storage",
            content: "This website minimizes cookie usage. Local Storage is used solely on your device to remember user UI preferences (such as dismissing the Cookie/Privacy notification banner or Command Palette state). These entries are stored locally on your device and are never transmitted to third parties."
        },
        {
            icon: Lock,
            title: "4. Data Security",
            content: "Industry standard security measures, including HTTPS SSL encryption and modern HTTP headers (such as strict Referrer Policies), are strictly enforced across the domain. Communication sent via third-party email providers (such as Gmail) is governed by their respective encryption and privacy standards."
        },
        {
            icon: Database,
            title: "5. Third-Party Services & External Links",
            content: "This website contains external links to third-party platforms (GitHub, LinkedIn, Instagram, X/Twitter, Vercel, Google Maps). Please note that once you leave this site, you are subject to the privacy policies and terms of those respective platforms. I do not host intrusive ad networks or data broker trackers."
        },
        {
            icon: CheckCircle,
            title: "6. Your Rights & Data Requests",
            content: "Under applicable regulations (including GDPR and CCPA guidelines), you have the right to request information about any personal communications received from you or to request the complete deletion of past email correspondence. To submit any inquiry or request, please contact me directly at the address below."
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

                    <h1 style={{ marginBottom: '1rem', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}>Privacy Policy</h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
                        Last Updated: May 2026. Transparent, privacy-by-design standards for this portfolio.
                    </p>
                </motion.div>
            </motion.div>

            <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {sections.map((section, idx) => (
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
                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-line', color: 'var(--text-muted)' }}>
                            {section.content}
                        </p>
                    </motion.div>
                ))}

                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="card"
                    style={{
                        padding: '2.5rem',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.5))',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <Mail size={32} color="var(--accent-secondary)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Questions or Data Inquiries?</h3>
                    <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                        Feel free to reach out directly if you have any questions regarding privacy or data handling.
                    </p>
                    <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex' }}
                    >
                        <Mail size={16} /> {contact.email}
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
