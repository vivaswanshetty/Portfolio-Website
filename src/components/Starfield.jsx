import React, { useEffect, useState, useRef } from 'react';

const Starfield = () => {
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const rafRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
                setScrollY(window.scrollY);
                rafRef.current = null;
            });
        };

        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <>
            <style>{`
                .starfield-bg {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: -4;
                    background: #030712;
                }

                .grid-overlay {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: -3;
                    background-image:
                        linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
                    background-size: 100px 100px;
                    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
                    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
                }

                .floating-orb {
                    position: fixed;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: -2;
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .orb-1 {
                    width: 550px; height: 550px;
                    background: radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%);
                    top: 10%; left: -10%;
                    filter: blur(120px);
                    opacity: 0.7;
                }

                .orb-2 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%);
                    bottom: 15%; right: -10%;
                    filter: blur(100px);
                    opacity: 0.6;
                }

                .parallax-layer {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    pointer-events: none;
                    z-index: -1;
                }

                .parallax-line {
                    position: absolute;
                    width: 1px;
                    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.06), transparent);
                    transform-origin: top center;
                }

                .parallax-glow {
                    position: fixed;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 65%);
                    filter: blur(90px);
                    z-index: -1;
                    pointer-events: none;
                }

                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(15px, -15px); }
                }
            `}</style>

            <div className="starfield-bg" />
            <div className="grid-overlay" />

            <div
                className="floating-orb orb-1"
                style={{
                    transform: `translate(${mousePos.x * 0.25}px, ${-scrollY * 0.08}px)`,
                }}
            />
            <div
                className="floating-orb orb-2"
                style={{
                    transform: `translate(${-mousePos.x * 0.2}px, ${scrollY * 0.1}px)`,
                }}
            />

            <div className="parallax-layer">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="parallax-line"
                        style={{
                            left: `${15 + i * 14}%`,
                            height: `${140 + (i % 3) * 80}px`,
                            top: `${20 + (i % 3) * 20}%`,
                            opacity: 0.12 + (i % 2) * 0.06,
                            transform: `translateY(${scrollY * (0.02 + i * 0.01)}px)`,
                            animation: `float-slow ${7 + i}s ease-in-out infinite`,
                            animationDelay: `${i * 0.6}s`
                        }}
                    />
                ))}
            </div>

            <div
                className="parallax-glow"
                style={{
                    top: `${25 - scrollY * 0.04}%`,
                    left: `${50 + mousePos.x * 0.2}%`,
                    transform: `translate(-50%, -50%) translate(${mousePos.x}px, ${mousePos.y * 0.4}px)`,
                }}
            />
        </>
    );
};

export default Starfield;