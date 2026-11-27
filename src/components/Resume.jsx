import React, { useRef } from 'react';
import { motion as Motion, useScroll, useTransform, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Briefcase, Calendar, Award, GraduationCap, MapPin, ChevronRight } from 'lucide-react';
import { LineReveal, RuleDraw, MagnetContainer } from './MotionPrimitives';

const TimelineItem = ({ job, index, isLeft }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <Motion.div
            ref={ref}
            className={`timeline-item-row ${isLeft ? 'left' : 'right'}`}
        >
            <Motion.div
                className="timeline-card-wrapper"
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -30 : 30 }}
                transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
                <Motion.div
                    className="timeline-dot"
                    style={{
                        background: '#ffffff',
                        borderRadius: '50%',
                        border: '2px solid #030712',
                        boxShadow: '0 0 12px rgba(239, 68, 68, 0.75)',
                    }}
                    whileHover={{ scale: 1.3 }}
                />

                <Motion.div
                    className="editorial-card kinetic-glass-panel"
                    style={{ padding: '2.25rem 2rem' }}
                    whileHover={{ y: -5, transition: { duration: 0.15, ease: 'easeOut' } }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.8rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingBottom: '0.75rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Briefcase size={16} color="var(--text-main)" />
                            <h3
                                style={{
                                    fontSize: '1.15rem',
                                    margin: 0,
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    color: '#ffffff',
                                }}
                            >
                                {job.role}
                            </h3>
                        </div>
                        <span className="kinetic-index-numeral">0{index + 1}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {job.company}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.05em' }}>
                            <Calendar size={12} /> {job.duration}
                        </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {job.description}
                    </p>

                    {job.highlights && (
                        <div className="editorial-badge-group">
                            {job.highlights.map((h) => (
                                <MagnetContainer key={h} strength={7}>
                                    <span
                                        className="editorial-badge"
                                        style={{ fontSize: '0.7rem', padding: '0.3rem 0.65rem' }}
                                    >
                                        {h}
                                    </span>
                                </MagnetContainer>
                            ))}
                        </div>
                    )}
                </Motion.div>
            </Motion.div>
        </Motion.div>
    );
};

const EducationCard = ({ edu, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <Motion.div
            ref={ref}
            className="editorial-card kinetic-glass-panel"
            style={{ padding: '2rem 2rem', marginBottom: '1.25rem' }}
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.15, ease: 'easeOut' } }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3
                    style={{
                        fontSize: '1.1rem',
                        margin: 0,
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: '#ffffff',
                    }}
                >
                    {edu.degree}
                </h3>
                <span className="kinetic-index-numeral">0{index + 1}</span>
            </div>

            <p style={{ color: '#f8fafc', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {edu.institution}
            </p>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <Calendar size={12} /> {edu.duration || edu.year}
                <MapPin size={12} style={{ marginLeft: '0.5rem' }} /> {edu.location || 'Bengaluru, India'}
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {edu.description || edu.desc}
            </p>
        </Motion.div>
    );
};

const Resume = () => {
    const { experience, education, achievements } = portfolioData.resume;
    const pageRef = useRef(null);
    const timelineRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: pageRef,
        offset: ['start start', 'end start'],
    });
    const { scrollYProgress: axisProgress } = useScroll({
        target: timelineRef,
        offset: ['start 0.72', 'end 0.58'],
    });

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 80]);
    const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <div className="editorial-page-container" ref={pageRef}>
            {/* Opening Editorial Header */}
            <Motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="editorial-page-header"
            >
                <Motion.div
                    style={{
                        y: headerY,
                        opacity: headerOpacity,
                    }}
                >
                    <div className="editorial-eyebrow-container" style={{ marginBottom: '0.8rem' }}>
                        <span className="editorial-eyebrow-text">
                            CAREER TRACK &amp; PEDIGREE.
                        </span>
                        <div className="editorial-eyebrow-rule" />
                    </div>
                    <LineReveal as="h1" className="editorial-page-title">
                        PROFESSIONAL TRAJECTORY &amp; <span style={{ color: '#ef4444' }}>EXPERIENCE</span>.
                    </LineReveal>
                    <RuleDraw />
                    <p style={{ maxWidth: '600px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                        Chronological record of engineering roles, production deliveries, academic qualifications, and verified honors.
                    </p>
                </Motion.div>
            </Motion.div>

            {/* Scroll-Driven Glowing Axis Timeline */}
            <div ref={timelineRef} className="timeline-container" style={{ maxWidth: '1000px', margin: '0 auto 5rem' }}>
                <div className="timeline-axis" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
                <Motion.div
                    className="timeline-axis kinetic-laser-axis"
                    style={{ scaleY: axisProgress, transformOrigin: 'top' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {experience.map((job, idx) => (
                        <TimelineItem key={idx} job={job} index={idx} isLeft={idx % 2 === 0} />
                    ))}
                </div>
            </div>

            {/* Education & Credentials Section */}
            <Motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ maxWidth: '1000px', margin: '0 auto' }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                        paddingBottom: '1.25rem',
                        marginBottom: '2rem',
                    }}
                >
                    <GraduationCap size={22} color="var(--text-main)" />
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '1.35rem',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            color: '#ffffff',
                        }}
                    >
                        ACADEMIC <span style={{ color: '#ef4444' }}>QUALIFICATIONS</span>
                    </h2>
                </div>

                {education.map((edu, idx) => (
                    <EducationCard key={idx} edu={edu} index={idx} />
                ))}

                {/* Achievements & Certifications Grid */}
                {achievements && (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                            gap: '2rem',
                            marginTop: '2rem',
                            alignItems: 'stretch',
                        }}
                    >
                        {achievements && (
                            <Motion.div
                                className="editorial-card kinetic-glass-panel"
                                style={{
                                    padding: '2.25rem 2rem',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxSizing: 'border-box',
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                            >
                                <div
                                    style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                                        paddingBottom: '1rem',
                                        marginBottom: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                    }}
                                >
                                    <Award size={18} color="#f8fafc" />
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: '1.1rem',
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            color: '#ffffff',
                                        }}
                                    >
                                        ACHIEVEMENTS &amp; <span style={{ color: '#ef4444' }}>HONORS</span>
                                    </h3>
                                </div>
                                <ul style={{ paddingLeft: '0', margin: 0, flex: 1, listStyle: 'none' }}>
                                    {achievements.map((a, i) => (
                                        <Motion.li
                                            key={i}
                                            style={{
                                                marginBottom: '1rem',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.88rem',
                                                lineHeight: 1.6,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.8rem',
                                            }}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.35 + i * 0.08 }}
                                        >
                                            <ChevronRight size={16} color="#f8fafc" style={{ flexShrink: 0, marginTop: '3px' }} />
                                            <span>{a}</span>
                                        </Motion.li>
                                    ))}
                                </ul>
                            </Motion.div>
                        )}

                        {portfolioData.resume.certifications && (
                            <Motion.div
                                className="editorial-card kinetic-glass-panel"
                                style={{
                                    padding: '2.25rem 2rem',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxSizing: 'border-box',
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.35 }}
                            >
                                <div
                                    style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                                        paddingBottom: '1rem',
                                        marginBottom: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                    }}
                                >
                                    <Award size={18} color="#f8fafc" />
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: '1.1rem',
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            color: '#ffffff',
                                        }}
                                    >
                                        VERIFIED <span style={{ color: '#ef4444' }}>CERTIFICATIONS</span>
                                    </h3>
                                </div>
                                <ul style={{ paddingLeft: '0', margin: 0, flex: 1, listStyle: 'none' }}>
                                    {portfolioData.resume.certifications.map((c, i) => (
                                        <Motion.li
                                            key={i}
                                            style={{
                                                marginBottom: '1rem',
                                                color: 'var(--text-muted)',
                                                fontSize: '0.88rem',
                                                lineHeight: 1.6,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '0.8rem',
                                            }}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.35 + i * 0.08 }}
                                        >
                                            <ChevronRight size={16} color="#f8fafc" style={{ flexShrink: 0, marginTop: '3px' }} />
                                            <div>
                                                {c.link ? (
                                                    <a
                                                        href={c.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            color: '#ffffff',
                                                            textDecoration: 'underline',
                                                            fontWeight: 600,
                                                            transition: 'color 0.2s ease',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {c.name}
                                                    </a>
                                                ) : (
                                                    <strong style={{ color: '#ffffff' }}>{c.name}</strong>
                                                )}
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                                                    {c.issuer} ({c.year})
                                                </span>
                                            </div>
                                        </Motion.li>
                                    ))}
                                </ul>
                            </Motion.div>
                        )}
                    </div>
                )}
            </Motion.div>
        </div>
    );
};

export default Resume;
