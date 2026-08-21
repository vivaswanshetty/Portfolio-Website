import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Mail, Linkedin, Github, Send, Instagram, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import MagneticWrapper from './MagneticWrapper';

const XIcon = ({ size = 15, color = 'currentColor' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const Contact = () => {
    const { email, linkedin, github, instagram, x } = portfolioData.contact;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start']
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -60]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) {
            errs.name = 'Name is required.';
        }
        if (!formData.email.trim()) {
            errs.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errs.email = 'Please enter a valid email address.';
        }
        if (!formData.message.trim()) {
            errs.message = 'Message is required.';
        } else if (formData.message.trim().length < 10) {
            errs.message = 'Message must be at least 10 characters.';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setStatus('submitting');
        setErrorMessage('');

        try {
            const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;

            if (!accessKey || accessKey === 'your_key_here' || accessKey === 'YOUR_ACCESS_KEY_HERE') {
                setStatus('error');
                setErrorMessage('Web3Forms Access Key is missing or unconfigured in .env.local.');
                return;
            }

            const formPayload = new FormData();
            formPayload.append('access_key', accessKey);
            formPayload.append('name', formData.name.trim());
            formPayload.append('email', formData.email.trim());
            formPayload.append('subject', formData.subject.trim() || `Portfolio Inquiry from ${formData.name.trim()}`);
            formPayload.append('message', formData.message.trim());
            formPayload.append('from_name', 'Vivaswan Shetty Portfolio');

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formPayload
            });

            const data = await response.json();
            console.log('Web3Forms transmission status:', data);

            if (data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setErrors({});
            } else {
                setStatus('error');
                setErrorMessage(data.message || 'Submission failed. Please verify your Web3Forms key and connection.');
            }
        } catch (err) {
            console.error('Transmission error:', err);
            setStatus('error');
            setErrorMessage('Network error while transmitting message. Please try again or email directly.');
        }
    };

    const handleReset = () => {
        setStatus('idle');
        setErrorMessage('');
        setErrors({});
    };

    return (
        <div className="editorial-page-container" ref={ref}>
            {/* Opening Editorial Header */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="editorial-page-header"
            >
                <motion.div style={{ y: y1 }}>
                    <div className="editorial-eyebrow-container" style={{ marginBottom: '0.8rem' }}>
                        <span className="editorial-eyebrow-text">
                            COMMUNICATIONS & INQUIRIES.
                        </span>
                    </div>
                    <h1 className="editorial-page-title">
                        INITIATE DIALOGUE & <span style={{ color: '#ef4444' }}>COLLABORATE</span>.
                    </h1>
                    <p style={{ maxWidth: '600px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                        Open for technical leadership, production engineering collaborations, and high-impact systems development.
                    </p>
                </motion.div>
            </motion.div>

            {/* 2-Column Editorial Grid */}
            <motion.div
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
                    alignItems: 'stretch', 
                    gap: '2.5rem', 
                    maxWidth: '1150px', 
                    margin: '0 auto' 
                }}
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
            >
                {/* Column 1: Editorial Details & Social Links */}
                <motion.div 
                    variants={itemVariants}
                    className="editorial-card"
                    style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <span className="editorial-eyebrow-text" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                DIRECT CHANNELS
                            </span>
                        </div>

                        <h2 style={{ 
                            marginBottom: '1.25rem', 
                            fontSize: '1.75rem', 
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em',
                            color: '#ffffff',
                            lineHeight: 1.2 
                        }}>
                            LET'S ARCHITECT SOMETHING <span style={{ color: '#ef4444' }}>ICONIC</span>.
                        </h2>
                        <p style={{ marginBottom: '2.5rem', lineHeight: 1.8, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Whether you have an ambitious platform to build, an engineering hurdle to solve, or wish to explore executive technical leadership, my inbox is open.
                        </p>

                        <div style={{
                            padding: '1.25rem 1.5rem',
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.1em', color: '#ffffff', textTransform: 'uppercase' }}>
                                    RAPID TRANSMISSION GUARANTEE
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Inquiries submitted via this portal or email are delivered directly to personal notifications with a guaranteed 24-hour response SLA.
                            </p>
                        </div>
                    </div>

                    <div>
                        <span className="editorial-eyebrow-text" style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '1rem' }}>
                            OFFICIAL PLATFORMS
                        </span>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <motion.a
                                href={linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="editorial-platform-badge"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Linkedin size={15} /> <span>LINKEDIN</span>
                            </motion.a>
                            <motion.a
                                href={github}
                                target="_blank"
                                rel="noreferrer"
                                className="editorial-platform-badge"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Github size={15} /> <span>GITHUB</span>
                            </motion.a>
                            {instagram && (
                                <motion.a
                                    href={instagram}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="editorial-platform-badge"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Instagram size={15} /> <span>INSTAGRAM</span>
                                </motion.a>
                            )}
                            {x && (
                                <motion.a
                                    href={x}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="editorial-platform-badge"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <XIcon size={14} /> <span>X / TWITTER</span>
                                </motion.a>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Column 2: Web3Forms Connected Interactive Form */}
                <motion.div
                    variants={itemVariants}
                    className="editorial-card"
                    style={{
                        padding: '3rem 2.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    {status === 'success' ? (
                        /* SUCCESS STATE */
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            style={{ textAlign: 'center', padding: '2rem 1rem' }}
                        >
                            <div style={{
                                width: '72px',
                                height: '72px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)'
                            }}>
                                <CheckCircle2 size={36} color="#ef4444" />
                            </div>

                            <span className="editorial-eyebrow-text" style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '0.5rem', display: 'block' }}>
                                TRANSMISSION SUCCESSFUL
                            </span>

                            <h3 style={{ 
                                fontSize: '1.6rem', 
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: '#ffffff',
                                margin: '0 0 1rem'
                            }}>
                                MESSAGE <span style={{ color: '#ef4444' }}>DISPATCHED</span>.
                            </h3>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 2.5rem' }}>
                                Thank you for reaching out. Your communication has been routed directly to Vivaswan's inbox. Expect a response within 24 hours.
                            </p>

                            <MagneticWrapper>
                                <button
                                    onClick={handleReset}
                                    className="editorial-btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.75rem' }}
                                >
                                    <RefreshCw size={15} /> SEND ANOTHER TRANSMISSION
                                </button>
                            </MagneticWrapper>
                        </motion.div>
                    ) : (
                        /* IDLE / SUBMITTING / ERROR FORM */
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span className="editorial-eyebrow-text" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                    ELECTRONIC TRANSMISSION
                                </span>
                            </div>

                            <h3 style={{ 
                                marginBottom: '0.5rem', 
                                fontSize: '1.4rem',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: '#ffffff'
                            }}>
                                SEND A <span style={{ color: '#ef4444' }}>DIRECT MESSAGE</span>
                            </h3>

                            <p style={{ marginBottom: '1.75rem', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                                Direct secure transmission to Vivaswan's inbox.
                            </p>

                            {/* Inline Error Alert */}
                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: '0.85rem 1.15rem',
                                        background: 'rgba(239, 68, 68, 0.14)',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        borderRadius: '6px',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '0.84rem',
                                        color: '#fca5a5'
                                    }}
                                >
                                    <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                                    <span>{errorMessage}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {/* Name Input */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.74rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.08em', color: '#cbd5e1', textTransform: 'uppercase' }}>
                                        NAME <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input 
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Alex Morgan"
                                        className={`editorial-input ${errors.name ? 'error' : ''}`}
                                        disabled={status === 'submitting'}
                                    />
                                    {errors.name && (
                                        <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.76rem', color: '#f87171' }}>
                                            {errors.name}
                                        </span>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.74rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.08em', color: '#cbd5e1', textTransform: 'uppercase' }}>
                                        EMAIL ADDRESS <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input 
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="alex@company.com"
                                        className={`editorial-input ${errors.email ? 'error' : ''}`}
                                        disabled={status === 'submitting'}
                                    />
                                    {errors.email && (
                                        <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.76rem', color: '#f87171' }}>
                                            {errors.email}
                                        </span>
                                    )}
                                </div>

                                {/* Subject Input (Optional) */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.74rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.08em', color: '#cbd5e1', textTransform: 'uppercase' }}>
                                        SUBJECT <span style={{ opacity: 0.6, fontSize: '0.68rem' }}>(OPTIONAL)</span>
                                    </label>
                                    <input 
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="e.g. Technical Leadership / Production Collaboration"
                                        className="editorial-input"
                                        disabled={status === 'submitting'}
                                    />
                                </div>

                                {/* Message Input */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.74rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '0.08em', color: '#cbd5e1', textTransform: 'uppercase' }}>
                                        MESSAGE <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <textarea 
                                        name="message"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Outline your vision, technical requirements, or collaboration scope..."
                                        className={`editorial-textarea ${errors.message ? 'error' : ''}`}
                                        disabled={status === 'submitting'}
                                        style={{ resize: 'vertical', minHeight: '100px' }}
                                    />
                                    {errors.message && (
                                        <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.76rem', color: '#f87171' }}>
                                            {errors.message}
                                        </span>
                                    )}
                                </div>

                                {/* Submit Button with Magnetic Wrapper */}
                                <div style={{ marginTop: '0.5rem' }}>
                                    <MagneticWrapper>
                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="editorial-btn-primary"
                                            style={{
                                                width: '100%',
                                                justifyContent: 'center',
                                                padding: '0.95rem 1.5rem',
                                                fontSize: '0.84rem',
                                                opacity: status === 'submitting' ? 0.75 : 1,
                                                cursor: status === 'submitting' ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {status === 'submitting' ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                                    <span>TRANSMITTING MESSAGE...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    <span>TRANSMIT INQUIRY</span>
                                                </>
                                            )}
                                        </button>
                                    </MagneticWrapper>
                                </div>

                                {/* Alternative direct mailto text */}
                                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                    <a
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            fontSize: '0.78rem',
                                            color: 'var(--text-muted)',
                                            textDecoration: 'none',
                                            transition: 'color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                    >
                                        Or launch email client directly → <span style={{ color: '#ffffff', textDecoration: 'underline' }}>{email}</span>
                                    </a>
                                </div>
                            </form>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Subtle Animated Letter Marquee */}
            <motion.div
                style={{
                    marginTop: '6rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2.5rem'
                }}
            >
                {['C', 'O', 'N', 'N', 'E', 'C', 'T'].map((letter, i) => (
                    <motion.span
                        key={i}
                        style={{
                            fontSize: '0.9rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            color: '#ffffff',
                            opacity: 0.25
                        }}
                        animate={{
                            y: [0, -5, 0],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </motion.div>
        </div>
    );
};

export default Contact;