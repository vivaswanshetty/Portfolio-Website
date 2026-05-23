import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Mail, Linkedin, Github, Send, Instagram, Twitter } from 'lucide-react';

const Contact = () => {
    const { email, linkedin, github, instagram, x } = portfolioData.contact;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start']
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 80]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="page-container" ref={ref}>
            <motion.div
                style={{
                    textAlign: 'center',
                    marginBottom: '5rem',
                    position: 'relative'
                }}
            >
                <motion.div
                    style={{ y: y1 }}
                >
                    <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        color: 'var(--accent-primary)',
                        marginBottom: '1rem',
                        fontWeight: 600
                    }}>
                        Let's Connect
                    </span>
                    <h1 style={{ marginBottom: '1rem' }}>Get in Touch</h1>
                    <p style={{ maxWidth: '500px', margin: '0 auto' }}>
                        Open for collaborations, project deployment, and technical inquiries.
                    </p>
                </motion.div>

                <motion.div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        left: '40%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }}
                />
            </motion.div>

            <motion.div
                className="grid grid-2"
                style={{ alignItems: 'center', gap: '5rem', maxWidth: '1000px', margin: '0 auto' }}
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
            >
                <motion.div variants={itemVariants} style={{ position: 'relative' }}>
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '10%',
                            left: '-30%',
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
                            filter: 'blur(50px)',
                            y: y2
                        }}
                    />

                    <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem', lineHeight: 1.3 }}>Let's build something great together</h2>
                    <p style={{ marginBottom: '2.5rem', lineHeight: 1.8 }}>
                        Whether you have a project in mind, need technical guidance, or just want to say hello, I'd love to hear from you.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <motion.a
                            href={linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Linkedin size={18} /> LinkedIn
                        </motion.a>
                        <motion.a
                            href={github}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Github size={18} /> GitHub
                        </motion.a>
                        {instagram && (
                            <motion.a
                                href={instagram}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline"
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Instagram size={18} /> Instagram
                            </motion.a>
                        )}
                        {x && (
                            <motion.a
                                href={x}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline"
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Twitter size={18} /> X
                            </motion.a>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="card"
                    style={{
                        textAlign: 'center',
                        padding: '3.5rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    whileHover={{ y: -8 }}
                >
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
                            opacity: 0.5
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <motion.div
                            style={{
                                width: '90px', height: '90px',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 2rem'
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                            <Mail size={40} color="white" />
                        </motion.div>

                        <h3 style={{ marginBottom: '0.6rem', fontSize: '1.4rem' }}>Email Me</h3>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                            I'll get back to you within 24 hours
                        </p>

                        <motion.a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ display: 'inline-flex' }}
                        >
                            <Send size={18} /> {email}
                        </motion.a>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                style={{
                    marginTop: '5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem'
                }}
            >
                {['A', 'B', 'O', 'U', 'T'].map((letter, i) => (
                    <motion.span
                        key={i}
                        style={{
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            opacity: 0.3
                        }}
                        animate={{
                            y: [0, -5, 0],
                            opacity: [0.2, 0.4, 0.2]
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