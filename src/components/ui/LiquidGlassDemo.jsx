import React, { useRef, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import portfolioCoverImg from '../../assets/portfolio-cover.webp';

/**
 * Interactive Liquid Glass showcase adapted from Aceternity's `liquid-glass-demo`
 * for the portfolio's obsidian + crimson design system. Visitors can drag the circular
 * or pill refraction lens and tweak displacement, chromatic aberration, bevel depth, and frost.
 */
export default function LiquidGlassDemo({
    initialShape = 'circle',
    initialScale = 48,
    initialAberration = 14,
    initialBevelDepth = 37,
    initialFrost = 0.4,
    initialTint = 0.08,
}) {
    const constraintsRef = useRef(null);
    const reduceMotion = useReducedMotion();

    const [shape, setShape] = useState(initialShape);
    const [scale, setScale] = useState(initialScale);
    const [aberration, setAberration] = useState(initialAberration);
    const [bevelDepth, setBevelDepth] = useState(initialBevelDepth);
    const [frost, setFrost] = useState(initialFrost);

    const size = shape === 'pill' ? { w: 300, h: 112 } : { w: 196, h: 196 };

    const handleReset = () => {
        setShape('circle');
        setScale(48);
        setAberration(14);
        setBevelDepth(37);
        setFrost(0.4);
    };

    return (
        <div className="lg-demo-wrapper">
            <div className="lg-demo-header">
                <div className="lg-demo-title-wrap">
                    <span className="lg-demo-eyebrow">
                        <Sparkles size={13} />
                        <span>INTERACTIVE UI CRAFT · SNELL&apos;S-LAW OPTICS</span>
                    </span>
                    <h3 className="lg-demo-heading">
                        LIQUID GLASS <span>REFRACTION LAB</span>
                    </h3>
                    <p className="lg-demo-sub">
                        Drag the optical lens across live typography &amp; artwork to test Chromium SVG displacement + RGB chromatic aberration in real time (graceful dark blur fallback elsewhere).
                    </p>
                </div>

                <div className="lg-demo-mode-row">
                    <div className="lg-demo-shape-toggle" role="group" aria-label="Lens geometry">
                        <button
                            type="button"
                            className={`lg-demo-pill-btn${shape === 'circle' ? ' active' : ''}`}
                            onClick={() => setShape('circle')}
                        >
                            Circle Lens
                        </button>
                        <button
                            type="button"
                            className={`lg-demo-pill-btn${shape === 'pill' ? ' active' : ''}`}
                            onClick={() => setShape('pill')}
                        >
                            Pill Lens
                        </button>
                    </div>
                    <button
                        type="button"
                        className="lg-demo-reset-btn"
                        onClick={handleReset}
                        aria-label="Reset optics parameters"
                    >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            <div className="lg-demo-layout">
                <div ref={constraintsRef} className="lg-demo-stage">
                    <img
                        src={portfolioCoverImg}
                        alt=""
                        className="lg-demo-bg"
                        draggable={false}
                    />
                    <div className="lg-demo-bg-scrim" aria-hidden="true" />

                    <div className="lg-demo-content">
                        <p className="lg-demo-display">
                            Bend the
                            <br />
                            light<em className="lg-demo-dot">.</em>
                        </p>
                        <div className="lg-demo-bars" aria-hidden="true">
                            {Array.from({ length: 48 }).map((_, i) => (
                                <span
                                    key={i}
                                    className={i % 7 === 0 ? 'lg-demo-bar accent' : 'lg-demo-bar'}
                                />
                            ))}
                        </div>
                    </div>

                    <Motion.div
                        drag
                        dragConstraints={constraintsRef}
                        dragElastic={0.1}
                        whileDrag={reduceMotion ? undefined : { scale: 1.04 }}
                        className="lg-demo-drag"
                        style={{
                            width: size.w,
                            height: size.h,
                            marginLeft: -size.w / 2,
                            marginTop: -size.h / 2,
                        }}
                    >
                        <LiquidGlass
                            radius={size.h / 2}
                            scale={scale}
                            aberration={aberration}
                            bevelDepth={bevelDepth}
                            frost={frost}
                            tint={initialTint}
                            className="lg-demo-lens"
                        >
                            <span className="lg-demo-lens-hint">DRAG LENS</span>
                        </LiquidGlass>
                    </Motion.div>
                </div>

                <div className="lg-demo-controls" aria-label="Refraction parameters">
                    <label className="lg-demo-slider">
                        <div className="lg-demo-slider-top">
                            <span>Displacement Scale</span>
                            <strong>{scale}px</strong>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={80}
                            step={1}
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                        />
                    </label>

                    <label className="lg-demo-slider">
                        <div className="lg-demo-slider-top">
                            <span>Chromatic Aberration</span>
                            <strong>{aberration}px</strong>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={24}
                            step={1}
                            value={aberration}
                            onChange={(e) => setAberration(Number(e.target.value))}
                        />
                    </label>

                    <label className="lg-demo-slider">
                        <div className="lg-demo-slider-top">
                            <span>Bevel Rim Depth</span>
                            <strong>{bevelDepth}px</strong>
                        </div>
                        <input
                            type="range"
                            min={4}
                            max={60}
                            step={1}
                            value={bevelDepth}
                            onChange={(e) => setBevelDepth(Number(e.target.value))}
                        />
                    </label>

                    <label className="lg-demo-slider">
                        <div className="lg-demo-slider-top">
                            <span>Frost Blur</span>
                            <strong>{frost.toFixed(1)}px</strong>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={2.4}
                            step={0.1}
                            value={frost}
                            onChange={(e) => setFrost(Number(e.target.value))}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
