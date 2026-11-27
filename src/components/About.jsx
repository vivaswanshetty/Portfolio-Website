import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, useInView } from 'framer-motion';
import { ArrowRight, ArrowUp, Compass, Cpu, Zap } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import portraitImg from '../assets/vivaswan_portrait.webp';
import { NightValleyEngine } from '../utils/nightValleyEngine';
import { useGlobalAudio } from '../context/useGlobalAudio';

const OPERATING_PILLARS = [
    {
        code: '01',
        title: 'Systems Under Constraints',
        summary:
            'Engineered for real device limits, offline-first persistence, and strict user privacy—from truncated geolocation lookups to local expiry queues.',
        icon: Cpu,
        tag: 'RESILIENCE FIRST',
    },
    {
        code: '02',
        title: 'Latency & Visual Discipline',
        summary:
            'Every animation, shader, and route transition respects frame budgets so expressive interfaces stay fluid across desktop and mobile hardware.',
        icon: Zap,
        tag: '60 FPS COMPOSITING',
    },
    {
        code: '03',
        title: 'End-to-End Ownership',
        summary:
            'From typographic systems and tactile interactions to real-time sockets, AI orchestration fallbacks, and production edge deployments.',
        icon: Compass,
        tag: 'FULL-STACK SCOPE',
    },
];

const TRAJECTORY_STEPS = [
    {
        period: '2022 — 2024',
        title: 'Pre-University (PCMC) · State Top Ranker',
        detail: 'Scored 398 / 400 (99.5%) in State Board examinations and placed in the Top 2% state-wide (~5,000 rank) in KCET.',
        highlight: '99.5% SCORE',
    },
    {
        period: '2024 — 2028',
        title: 'B.E. Computer Science & Engineering · BMSCE',
        detail: 'Undergraduate at BMS College of Engineering, Bengaluru, focused on Systems Architecture, Algorithms, and Full-Stack product execution.',
        highlight: '8.67 / 10 CGPA',
    },
    {
        period: '2025 — PRESENT',
        title: 'Building Production Software Ecosystems',
        detail: 'Architected MedFind, RV Tours & Travels, CONQUER ONE, and the ElevateX Web & Mobile developer network from zero to production.',
        highlight: '6 FLAGSHIP SYSTEMS',
    },
];

const AnimatedCounter = ({ value, duration = 1800 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    useEffect(() => {
        if (!isInView) return;

        const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
        const startTime = performance.now();
        let rafId = null;

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * numericValue));
            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            }
        };

        rafId = requestAnimationFrame(tick);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isInView, value, duration]);

    const suffix = value.replace(/[\d]/g, '');

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
};

const About = () => {
    const { highlights, stats } = portfolioData.about;
    const { isMuted, toggleMute, setDuck } = useGlobalAudio();
    const valleyContainerRef = useRef(null);
    const valleyEngineRef = useRef(null);
    const storyRef = useRef(null);
    const portraitCardRef = useRef(null);

    const [loaded, setLoaded] = useState(false);
    const [introDone, setIntroDone] = useState(false);
    const [isDiving, setIsDiving] = useState(false);
    const [storyEntered, setStoryEntered] = useState(false);

    // Mount persistent Three.js Night Valley Engine for /about
    useEffect(() => {
        const container = valleyContainerRef.current;
        if (!container) return undefined;

        document.body.classList.add('about-valley-route', 'valley-loading');

        let shown = false;
        const engine = new NightValleyEngine(container, {
            onLoaded: () => {
                setLoaded(true);
                document.body.classList.remove('valley-loading');
            },
            onIntroDone: () => {
                if (!shown) {
                    shown = true;
                    setIntroDone(true);
                }
            },
        });
        valleyEngineRef.current = engine;

        const backstop = setTimeout(() => {
            setLoaded(true);
            setIntroDone(true);
            document.body.classList.remove('valley-loading');
        }, 2800);

        return () => {
            clearTimeout(backstop);
            document.body.classList.remove('about-valley-route', 'about-valley-locked', 'valley-loading');
            document.documentElement.classList.remove('about-valley-locked-html');
            engine.dispose();
            setDuck(false);
            valleyEngineRef.current = null;
        };
    }, [setDuck]);

    // Lock page scroll strictly inside Valley Portal mode until visitor enters through the #go arrow,
    // and make Story Mode scrolling drive dynamic valley speed, bloom & luminescence!
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        if (!storyEntered) {
            html.classList.add('about-valley-locked-html');
            body.classList.add('about-valley-locked');
            window.scrollTo({ top: 0, behavior: 'instant' });
            valleyEngineRef.current?.setScrollDim(0);
            return undefined;
        }

        html.classList.remove('about-valley-locked-html');
        body.classList.remove('about-valley-locked');
        valleyEngineRef.current?.setScrollDim(0.32);

        let lastY = window.scrollY;
        const onStoryScroll = () => {
            const curY = window.scrollY;
            const dy = curY - lastY;
            lastY = curY;
            valleyEngineRef.current?.pulseScroll(dy * 1.4);
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const prog = Math.max(0, Math.min(1, curY / maxScroll));
            // Progressively lift dark dimming into luminous flower flight as visitor reads deeper
            valleyEngineRef.current?.setScrollDim(0.38 - prog * 0.26);
        };

        window.addEventListener('scroll', onStoryScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onStoryScroll);
        };
    }, [storyEntered]);

    const handleToggleSound = () => {
        toggleMute();
    };

    const handleEnterPointerEnter = () => {
        valleyEngineRef.current?.startHoverTransition();
        setDuck(true);
    };

    const handleEnterPointerLeave = () => {
        valleyEngineRef.current?.stopHoverTransition();
        setDuck(false);
    };

    const handleEnterClick = (e) => {
        e.preventDefault();
        if (isDiving || storyEntered) return;

        setIsDiving(true);
        setDuck(false);

        const engine = valleyEngineRef.current;
        if (!engine) {
            setIsDiving(false);
            setStoryEntered(true);
            requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
            return;
        }

        engine.triggerWarpHole().then(() => {
            engine.resetWarp();
            engine.setScrollDim(0.82);
            setStoryEntered(true);
            setIsDiving(false);
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
            });
        });
    };

    const handleReturnToValley = () => {
        valleyEngineRef.current?.resetWarp();
        valleyEngineRef.current?.setScrollDim(0);
        setStoryEntered(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const handlePortraitMove = (e) => {
        const el = portraitCardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const rx = ((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * -5;
        const ry = ((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 5;
        el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    };

    const handlePortraitLeave = () => {
        if (portraitCardRef.current) {
            portraitCardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
    };

    return (
        <div className="about-valley-page">
            {/* Fixed Interactive 3D Night Flower Valley Stage */}
            <div id="valley" className="valley-canvas-host" aria-hidden="true">
                <div ref={valleyContainerRef} className="js-canvas-container" />
                <div
                    className="valley-depth-scrim"
                    style={{ opacity: storyEntered ? 0.28 : isDiving ? 0.04 : 0 }}
                />
            </div>

            {/* Loader Curtain with Single Pulsing 9u Cream Dot */}
            <div className={`valley-loader${loaded ? ' gone' : ''}`} aria-hidden={loaded}>
                <span />
            </div>

            {/* Section 1: Exclusive 100vh Entry Hero (scroll stays locked to Valley flight until #go arrow click) */}
            {!storyEntered && (
                <section className="valley-entry" aria-label="About entry">
                    <div
                        className={`valley-ui${introDone ? ' on' : ''}${isDiving ? ' diving' : ''}`}
                        style={{
                            opacity: isDiving ? 0 : introDone ? 1 : 0,
                            transform: isDiving ? 'scale(0.84) translateZ(0)' : 'none',
                            pointerEvents: isDiving ? 'none' : undefined,
                        }}
                    >
                        <div className="valley-hero">
                            <h1>No teacher. Self-built.</h1>
                            <p className="valley-cap">
                                No one ever showed me the way.
                                <br />
                                I learned everything myself—to build a legacy.
                            </p>
                            <a
                                href="#about-story"
                                id="go"
                                className="valley-go"
                                aria-label="Enter About story through vortex"
                                onPointerEnter={handleEnterPointerEnter}
                                onPointerLeave={handleEnterPointerLeave}
                                onClick={handleEnterClick}
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 12h16M14 6l6 6-6 6" />
                                </svg>
                            </a>
                        </div>

                        <div className="valley-corner">
                            <button
                                type="button"
                                id="sound"
                                className="valley-sound"
                                aria-pressed={!isMuted}
                                aria-label="Toggle ambient sound"
                                onClick={handleToggleSound}
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z" />
                                    <path className="w" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
                                    <path className="x" d="m16 10 4 4m0-4-4 4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Section 2+: Architectural Liquid Glass Narrative (only revealed after entering via #go arrow) */}
            {storyEntered && (
                <div ref={storyRef} id="about-story" className="about-story-shell">
                <div className="about-story-topbar">
                    <button
                        type="button"
                        className="about-reenter-btn"
                        onClick={handleReturnToValley}
                    >
                        <ArrowUp size={13} />
                        <span>Return To Night Valley</span>
                    </button>
                </div>
                {/* Chapter 1: Portrait & Identity Manifesto */}
                <Motion.section
                    className="about-chapter about-identity-grid"
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div
                        ref={portraitCardRef}
                        className="about-glass-card about-portrait-panel"
                        onMouseMove={handlePortraitMove}
                        onMouseLeave={handlePortraitLeave}
                    >
                        <div className="about-portrait-media">
                            <img src={portraitImg} alt="Vivaswan Shetty" loading="lazy" />
                            <div className="about-portrait-vignette" />
                            <span className="about-portrait-tag">BMSCE · CS&amp;E &apos;28</span>
                        </div>
                        <div className="about-portrait-caption">
                            <strong>Vivaswan Shetty</strong>
                            <span>Bengaluru, India · 20 y/o Builder</span>
                        </div>
                    </div>

                    <div className="about-glass-card about-manifesto-panel">
                        <div className="about-kicker-row">
                            <span className="about-kicker">01 / IDENTITY &amp; CONVICTION</span>
                            <span className="about-rule" />
                        </div>

                        <h2 className="about-manifesto-heading">
                            DESIGNED LIKE AN ENGINEER. <span>BUILT LIKE AN OWNER.</span>
                        </h2>

                        <p className="about-lead-copy">
                            I&apos;m Vivaswan Shetty—a 20-year-old Computer Science &amp; Engineering undergraduate at BMS College of Engineering, Bengaluru, building at the intersection of software architecture, product craft, and entrepreneurship.
                        </p>

                        <p className="about-body-copy">
                            From resilient React Native mobile apps to full-stack Next.js and WebSocket ecosystems, my work focuses on turning ambiguous real-world problems into fast, durable products that feel effortless to use.
                        </p>

                        <div className="about-competencies-wrap">
                            <span className="about-sub-kicker">CORE DISCIPLINES</span>
                            <div className="editorial-badge-group">
                                {highlights.map((item) => (
                                    <span key={item} className="about-glass-badge">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </Motion.section>

                {/* Chapter 2: Animated Telemetry & Output Counters */}
                <Motion.section
                    className="about-chapter"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="about-section-head">
                        <span className="about-kicker">02 / TELEMETRY &amp; OUTPUT</span>
                        <h3>CRAFT MEASURED BY SHIPPED EXECUTION.</h3>
                    </div>

                    <div className="about-stats-bento">
                        {stats?.map((stat, idx) => (
                            <div key={stat.label} className="about-glass-card about-stat-tile">
                                <span className="about-stat-index">0{idx + 1}</span>
                                <div className="about-stat-value">
                                    <AnimatedCounter value={stat.value} />
                                </div>
                                <div className="about-stat-name">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </Motion.section>

                {/* Chapter 3: Operating Philosophy */}
                <Motion.section
                    className="about-chapter"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="about-section-head">
                        <span className="about-kicker">03 / OPERATING PRINCIPLES</span>
                        <h3>HOW EVERY PRODUCT TAKES SHAPE.</h3>
                    </div>

                    <div className="about-pillars-grid">
                        {OPERATING_PILLARS.map((pillar) => {
                            const Icon = pillar.icon;
                            return (
                                <article key={pillar.code} className="about-glass-card about-pillar-card">
                                    <div className="about-pillar-top">
                                        <span className="about-pillar-icon">
                                            <Icon size={18} />
                                        </span>
                                        <span className="about-pillar-code">{pillar.code}</span>
                                    </div>
                                    <h4>{pillar.title}</h4>
                                    <p>{pillar.summary}</p>
                                    <span className="about-pillar-tag">{pillar.tag}</span>
                                </article>
                            );
                        })}
                    </div>
                </Motion.section>

                {/* Chapter 4: Academic & Building Trajectory */}
                <Motion.section
                    className="about-chapter"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="about-section-head">
                        <span className="about-kicker">04 / TRAJECTORY</span>
                        <h3>MILESTONES SO FAR.</h3>
                    </div>

                    <div className="about-trajectory-list">
                        {TRAJECTORY_STEPS.map((step) => (
                            <div key={step.period} className="about-glass-card about-trajectory-item">
                                <div className="about-trajectory-meta">
                                    <span className="about-trajectory-period">{step.period}</span>
                                    <span className="about-trajectory-badge">{step.highlight}</span>
                                </div>
                                <div className="about-trajectory-content">
                                    <h4>{step.title}</h4>
                                    <p>{step.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Motion.section>

                {/* Chapter 5: Liquid Glass Closing Continuity Dock */}
                <Motion.section
                    className="about-chapter"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="about-glass-card about-cta-dock">
                        <div>
                            <span className="about-kicker">NEXT CHAPTER</span>
                            <h3>SEE THESE PRINCIPLES IN PRODUCTION.</h3>
                        </div>
                        <div className="about-cta-actions">
                            <Link to="/projects" className="about-btn-primary">
                                <span>Explore Projects</span>
                                <ArrowRight size={15} />
                            </Link>
                            <Link to="/contact" className="about-btn-secondary">
                                <span>Let&apos;s Talk</span>
                            </Link>
                        </div>
                    </div>
                </Motion.section>
                </div>
            )}
        </div>
    );
};

export default About;
