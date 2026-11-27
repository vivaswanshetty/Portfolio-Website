import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ArrowUpRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const CONTACT_PORTAL_VIDEO_URL =
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4';

const GitHubGlyph = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.1.73-.24.73-.53v-1.85c-3.03.66-3.67-1.45-3.67-1.45-.5-1.26-1.2-1.6-1.2-1.6-.98-.67.07-.66.07-.66 1.09.08 1.66 1.12 1.66 1.12.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.42-.28-4.96-1.21-4.96-5.38 0-1.19.42-2.16 1.12-2.92-.11-.28-.49-1.4.11-2.91 0 0 .91-.29 3 1.11a10.4 10.4 0 0 1 5.46 0c2.09-1.4 3-1.11 3-1.11.6 1.51.22 2.63.11 2.91.7.76 1.12 1.73 1.12 2.92 0 4.18-2.55 5.1-4.98 5.37.39.34.74 1.01.74 2.04v3.02c0 .3.19.64.74.53A11 11 0 0 0 12 1.27Z" />
    </svg>
);

const LinkedInGlyph = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.94 8.5v11.56H3.1V8.5h3.84ZM5.02 3.1a2.22 2.22 0 1 1 0 4.44 2.22 2.22 0 0 1 0-4.44Zm15.88 10.33v6.63h-3.83v-6.19c0-1.56-.56-2.62-1.95-2.62-1.06 0-1.7.72-1.98 1.41-.1.25-.13.59-.13.94v6.46H9.18s.05-10.48 0-11.56h3.84v1.64l-.02.04h.02v-.04c.51-.79 1.42-1.91 3.45-1.91 2.52 0 4.43 1.65 4.43 5.2Z" />
    </svg>
);

const XGlyph = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const MailGlyph = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2.5" />
        <path d="m3 6.5 9 6.5 9-6.5" />
    </svg>
);

const Contact = () => {
    const { email, linkedin, github, x } = portfolioData.contact;
    const videoRef = useRef(null);
    const triggerBtnRef = useRef(null);
    const nameInputRef = useRef(null);

    const [composerOpen, setComposerOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');

    useLayoutEffect(() => {
        const prevTitle = document.title;
        document.title = "Contact | Vivaswan Shetty — Let's Architect What Comes Next";
        document.documentElement.classList.add('contact-cinema-html');
        document.body.classList.add('contact-cinema-route');
        return () => {
            document.title = prevTitle;
            document.documentElement.classList.remove('contact-cinema-html');
            document.body.classList.remove('contact-cinema-route');
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
            }
        }
    }, []);

    const closeComposer = useCallback(() => {
        setComposerOpen(false);
        requestAnimationFrame(() => triggerBtnRef.current?.focus());
    }, []);

    useEffect(() => {
        if (!composerOpen) return undefined;
        const focusTimer = setTimeout(() => {
            nameInputRef.current?.focus();
        }, 40);
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeComposer();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            clearTimeout(focusTimer);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [composerOpen, closeComposer]);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard fallback unavailable
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
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
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
                body: formPayload,
            });
            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setErrors({});
            } else {
                setStatus('error');
                setErrorMessage(data.message || 'Submission failed. Please verify your Web3Forms key and connection.');
            }
        } catch (err) {
            console.error('Submission error:', err);
            setStatus('error');
            setErrorMessage('Network error while sending message. Please try again or email directly.');
        }
    };

    const handleReset = () => {
        setStatus('idle');
        setErrorMessage('');
        setErrors({});
    };

    return (
        <div className="contact-stage">
            {/* Full-Bleed Portal Video Plate + Edge/Bottom Fades */}
            <div className="contact-plate" aria-hidden="true">
                <video
                    ref={videoRef}
                    className="contact-plate-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                >
                    <source src={CONTACT_PORTAL_VIDEO_URL} type="video/mp4" />
                </video>
            </div>

            {/* Primary Left-Anchored Editorial Composition */}
            <section className="contact-hero" aria-label="Contact overview">
                <h1 className="contact-headline">
                    <span>Let&apos;s Architect</span>
                    <span>
                        What Comes Next<em className="contact-accent-dot">.</em>
                    </span>
                </h1>

                <p className="contact-sub">
                    <span>Open for production software, mobile apps, and AI systems,</span>
                    <span>shipping from Bengaluru with a 24h direct response.</span>
                </p>

                <div className="contact-actions">
                    <button
                        ref={triggerBtnRef}
                        type="button"
                        className="contact-pill contact-pill-cta"
                        onClick={() => setComposerOpen(true)}
                    >
                        <span>Send Message</span>
                    </button>

                    <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
                        target="_blank"
                        rel="noreferrer"
                        className="contact-ghost"
                    >
                        Email Directly
                    </a>
                </div>
            </section>

            {/* Bottom Monochrome Channel Strip Sitting Inside #050505 Fade */}
            <nav className="contact-logos" aria-label="Direct contact platforms">
                <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-lg"
                    aria-label="GitHub profile"
                >
                    <GitHubGlyph />
                    <span>GitHub</span>
                </a>

                <a
                    href={linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-lg"
                    aria-label="LinkedIn profile"
                >
                    <LinkedInGlyph />
                    <span>LinkedIn</span>
                </a>

                <a
                    href={x || 'https://x.com/vivaswanshetty'}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-lg"
                    aria-label="X / Twitter profile"
                >
                    <XGlyph />
                    <span>X / Twitter</span>
                </a>

                <a
                    href={`mailto:${email}`}
                    className="contact-lg"
                    aria-label={`Send email to ${email}`}
                >
                    <MailGlyph />
                    <span>Direct Mail</span>
                </a>
            </nav>

            {/* Minimal Composer Overlay Triggered by Primary White Pill CTA */}
            {composerOpen && (
                <div
                    className="contact-modal-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="contact-composer-title"
                >
                    <div className="contact-modal-scrim" onClick={closeComposer} />

                    <div className="contact-modal-panel">
                        <div className="contact-modal-head">
                            <div>
                                <span className="contact-modal-kicker">Direct Transmission · Bengaluru</span>
                                <h2 id="contact-composer-title" className="contact-modal-title">
                                    Send a <span>Message</span>
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="contact-modal-close"
                                aria-label="Close message composer"
                                onClick={closeComposer}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {status === 'success' ? (
                            <div className="contact-modal-success">
                                <div className="contact-modal-success-icon">
                                    <CheckCircle2 size={28} color="#ef4444" />
                                </div>
                                <h3>Message Dispatched</h3>
                                <p>
                                    Your note has been routed directly to Vivaswan&apos;s inbox. Expect a reply within 24 hours.
                                </p>
                                <div className="contact-modal-success-actions">
                                    <button type="button" className="contact-pill-inline" onClick={handleReset}>
                                        <RefreshCw size={14} />
                                        <span>Send Another</span>
                                    </button>
                                    <button type="button" className="contact-ghost-inline" onClick={closeComposer}>
                                        Done
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form className="contact-modal-form" onSubmit={handleSubmit} noValidate>
                                {status === 'error' && (
                                    <div className="contact-modal-alert" role="alert">
                                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <div className="contact-modal-row">
                                    <label className="contact-field">
                                        <span>Name *</span>
                                        <input
                                            ref={nameInputRef}
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Alex Morgan"
                                            disabled={status === 'submitting'}
                                            className={errors.name ? 'error' : ''}
                                        />
                                        {errors.name && <small>{errors.name}</small>}
                                    </label>

                                    <label className="contact-field">
                                        <span>Email *</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="alex@company.com"
                                            disabled={status === 'submitting'}
                                            className={errors.email ? 'error' : ''}
                                        />
                                        {errors.email && <small>{errors.email}</small>}
                                    </label>
                                </div>

                                <label className="contact-field">
                                    <span>Subject (Optional)</span>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Technical leadership, product build, or collaboration"
                                        disabled={status === 'submitting'}
                                    />
                                </label>

                                <label className="contact-field">
                                    <span>Message *</span>
                                    <textarea
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Outline your vision, technical requirements, or collaboration scope..."
                                        disabled={status === 'submitting'}
                                        className={errors.message ? 'error' : ''}
                                    />
                                    {errors.message && <small>{errors.message}</small>}
                                </label>

                                <div className="contact-modal-foot">
                                    <div className="contact-modal-direct">
                                        <button
                                            type="button"
                                            className="contact-copy-btn"
                                            onClick={handleCopyEmail}
                                        >
                                            {copied ? <Check size={13} /> : <Copy size={13} />}
                                            <span>{copied ? 'Copied email' : email}</span>
                                        </button>
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="contact-gmail-link"
                                        >
                                            <span>Open Gmail</span>
                                            <ArrowUpRight size={13} />
                                        </a>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="contact-pill-inline"
                                    >
                                        {status === 'submitting' ? (
                                            <>
                                                <Loader2 size={15} className="contact-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <span>Send Message</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
