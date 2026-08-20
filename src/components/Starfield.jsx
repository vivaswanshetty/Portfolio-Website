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
                    display: none;
                }

                .orb-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(0, 242, 254, 0.2), transparent 70%);
                    top: 5%; left: -15%;
                    filter: blur(100px);
                    opacity: 0.5;
                }

                .orb-2 {
                    width: 450px; height: 450px;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.22), transparent 70%);
                    bottom: 15%; right: -10%;
                    filter: blur(90px);
                    opacity: 0.45;
                }

                .orb-3 {
                    width: 350px; height: 350px;
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.16), transparent 70%);
                    top: 40%; left: 55%;
                    filter: blur(70px);
                    opacity: 0.35;
                }

                .orb-4 {
                    width: 280px; height: 280px;
                    background: radial-gradient(circle, rgba(245, 158, 11, 0.14), transparent 70%);
                    bottom: 5%; left: 10%;
                    filter: blur(60px);
                    opacity: 0.3;
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
                    background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.2), transparent);
                    transform-origin: top center;
                }

                .parallax-glow {
                    position: fixed;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
                    filter: blur(80px);
                    z-index: -1;
                    pointer-events: none;
                }

                @keyframes orb-float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -40px) scale(1.08); }
                    66% { transform: translate(-15px, 25px) scale(0.95); }
                }

                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, -20px); }
                }
            `}</style>

            <div className="starfield-bg" />
            <div className="grid-overlay" />

            <div
                className="floating-orb orb-1"
                style={{
                    transform: `translate(${mousePos.x * 0.3}px, ${-scrollY * 0.1}px) translateY(calc(var(--scroll-offset, 0px)))`,
                }}
            />
            <div
                className="floating-orb orb-2"
                style={{
                    transform: `translate(${-mousePos.x * 0.2}px, ${scrollY * 0.15}px)`,
                }}
            />
            <div
                className="floating-orb orb-3"
                style={{
                    transform: `translate(${mousePos.x * 0.4}px, ${-scrollY * 0.08}px)`,
                }}
            />
            <div
                className="floating-orb orb-4"
                style={{
                    transform: `translate(${-mousePos.x * 0.25}px, ${scrollY * 0.1}px)`,
                }}
            />

            <div className="parallax-layer">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="parallax-line"
                        style={{
                            left: `${10 + i * 12}%`,
                            height: `${150 + (i % 3) * 100}px`,
                            top: `${20 + (i % 4) * 15}%`,
                            opacity: 0.15 + (i % 3) * 0.05,
                            transform: `translateY(${scrollY * (0.02 + i * 0.01)}px)`,
                            animation: `float-slow ${6 + i}s ease-in-out infinite`,
                            animationDelay: `${i * 0.5}s`
                        }}
                    />
                ))}
            </div>

            <div
                className="parallax-glow"
                style={{
                    top: `${20 - scrollY * 0.05}%`,
                    left: `${50 + mousePos.x * 0.3}%`,
                    transform: `translate(-50%, -50%) translate(${mousePos.x}px, ${mousePos.y * 0.5}px)`,
                }}
            />
        </>
    );
};

export default Starfield;