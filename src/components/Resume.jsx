import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Briefcase, Calendar, Award, GraduationCap, MapPin, ChevronRight } from 'lucide-react';

const TimelineItem = ({ job, index, isLeft }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            style={{
                display: 'flex',
                justifyContent: isLeft ? 'flex-start' : 'flex-end',
                position: 'relative',
                paddingBottom: '3rem'
            }}
        >
            <motion.div
                style={{
                    width: 'min(45%, 420px)',
                    position: 'relative'
                }}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -30 : 30 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <div style={{
                    position: 'absolute',
                    top: '0',
                    [isLeft ? 'right' : 'left']: '-2px',
                    width: '2px',
                    height: '100%',
                    background: 'linear-gradient(180deg, var(--accent-primary), rgba(59, 130, 246, 0.1))'
                }} />

                <motion.div
                    style={{
                        position: 'absolute',
                        [isLeft ? 'right' : 'left']: '-11px',
                        top: '0',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--bg-color)',
                        border: '3px solid var(--accent-primary)',
                        zIndex: 1
                    }}
                    whileHover={{ scale: 1.4, background: 'var(--accent-primary)' }}
                />

                <motion.div
                    className="card"
                    style={{ padding: '2rem' }}
                    whileHover={{ y: -6 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Briefcase size={18} color="var(--accent-primary)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{job.role}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>{job.company}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={12} /> {job.duration}
                        </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>{job.description}</p>

                    {job.highlights && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {job.highlights.map((h, i) => (
                                <span
                                    key={i}
                                    style={{
                                        fontSize: '0.72rem',
                                        padding: '0.3rem 0.8rem',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '9999px',
                                        color: 'var(--accent-primary)'
                                    }}
                                >
                                    {h}
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};


const EducationCard = ({ edu, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            className="card"
            style={{ padding: '1.8rem', marginBottom: '1.2rem' }}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
        >
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{edu.degree}</h3>
            <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>{edu.institution}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={12} /> {edu.year}
                <MapPin size={12} style={{ marginLeft: '0.5rem' }} /> {edu.location || 'Bangalore, India'}
            </span>
            <p style={{ fontSize: '0.85rem', marginTop: '0.8rem', marginBottom: 0 }}>{edu.desc}</p>
        </motion.div>
    );
};

const Resume = () => {
    const { experience, education, achievements } = portfolioData.resume;
    const pageRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: pageRef,
        offset: ['start start', 'end start']
    });

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <div className="page-container" ref={pageRef}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                    textAlign: 'center',
                    marginBottom: '5rem',
                    position: 'relative'
                }}
            >
                <motion.div
                    style={{
                        y: headerY,
                        opacity: headerOpacity
                    }}
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
                        My Journey
                    </span>
                    <h1 style={{ marginBottom: '1rem' }}>Resume</h1>
                    <p style={{ maxWidth: '500px', margin: '0 auto' }}>
                        A timeline of my professional experience and education.
                    </p>
                </motion.div>
            </motion.div>

            <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
                <motion.div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        background: 'linear-gradient(180deg, var(--accent-primary) 0%, rgba(59, 130, 246, 0.1) 100%)',
                        transform: 'translateX(-50%)'
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {experience.map((job, idx) => (
                        <TimelineItem key={idx} job={job} index={idx} isLeft={idx % 2 === 0} />
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ marginTop: '5rem', maxWidth: '800px', margin: '5rem auto 0' }}
            >
                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem'
                }}>
                    <div style={{
                        width: '40px', height: '40px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <GraduationCap size={20} color="var(--accent-secondary)" />
                    </div>
                    Education
                </h2>

                {education.map((edu, idx) => (
                    <EducationCard key={idx} edu={edu} index={idx} />
                ))}

                {achievements && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '1.5rem'
                }}>
                    {achievements && (
                        <motion.div
                            className="card"
                            style={{ padding: '1.8rem' }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Award size={18} color="var(--accent-primary)" /> Achievements
                            </h3>
                            <ul style={{ paddingLeft: '0' }}>
                                {achievements.map((a, i) => (
                                    <motion.li
                                        key={i}
                                        style={{
                                            marginBottom: '0.8rem',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.8rem'
                                        }}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                    >
                                        <ChevronRight size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span>{a}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    {portfolioData.resume.certifications && (
                        <motion.div
                            className="card"
                            style={{ padding: '1.8rem' }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Award size={18} color="var(--accent-secondary)" /> Certifications
                            </h3>
                            <ul style={{ paddingLeft: '0' }}>
                                {portfolioData.resume.certifications.map((c, i) => (
                                    <motion.li
                                        key={i}
                                        style={{
                                            marginBottom: '0.8rem',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.8rem'
                                        }}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                    >
                                        <ChevronRight size={18} color="var(--accent-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <strong style={{ color: 'white' }}>{c.name}</strong> — <span style={{ fontSize: '0.85rem' }}>{c.issuer} ({c.year})</span>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </div>
                )}
            </motion.div>


        </div>
    );
};

export default Resume;