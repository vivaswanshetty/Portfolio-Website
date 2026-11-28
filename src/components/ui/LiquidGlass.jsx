import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
    buildFilterSvg,
    computeDisplacementData,
    detectGlassMode,
} from '../../utils/liquidGlassMath';

/** Encodes a Snell-law displacement map as a PNG ObjectURL for SVG feImage (WebKit-safe). */
async function generateDisplacementBlobUrl(opts) {
    const { data, width, height } = computeDisplacementData(opts);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    ctx.putImageData(new ImageData(data, width, height), 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Failed to encode displacement map');
    return URL.createObjectURL(blob);
}

/**
 * Polymorphic refractive Liquid Glass surface adapted from Aceternity UI for Vite + Vanilla CSS.
 * Chromium bends live backdrop pixels through an SVG <feDisplacementMap> with chromatic aberration;
 * Safari, Firefox, and reduced-transparency environments gracefully fall back to obsidian blur.
 */
export function LiquidGlass({
    as = 'div',
    onNode,
    children,
    className = '',
    contentClassName = '',
    radius = 999,
    bevelDepth = 14,
    scale = 48,
    aberration = 4,
    frost = 0.4,
    tint = 0.06,
    tintRgb = '255 255 255',
    saturation = 1.85,
    brightness = 1.02,
    maxMapDpr = 2,
    style,
    ...rest
}) {
    const reactId = useId().replace(/:/g, '');
    const rootRef = useRef(null);
    const blobRef = useRef(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const [filter, setFilter] = useState(null);
    const [mode] = useState(() => detectGlassMode());

    const setHostRef = useCallback(
        (node) => {
            rootRef.current = node;
            if (typeof onNode === 'function') {
                onNode(node);
            }
        },
        [onNode]
    );

    useEffect(() => {
        const el = rootRef.current;
        if (!el || mode !== 'pending') return undefined;

        let debounceTimer = null;
        const ro = new ResizeObserver(([entry]) => {
            if (!entry) return;
            const box = entry.borderBoxSize?.[0];
            const width = box?.inlineSize ?? entry.contentRect.width;
            const height = box?.blockSize ?? entry.contentRect.height;
            const nextW = Math.max(1, Math.round(width));
            const nextH = Math.max(1, Math.round(height));

            const commitSize = () => {
                setSize((prev) =>
                    Math.abs(prev.w - nextW) >= 2 || Math.abs(prev.h - nextH) >= 2
                        ? { w: nextW, h: nextH }
                        : prev
                );
            };

            if (size.w === 0) {
                commitSize();
            } else {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(commitSize, 55);
            }
        });

        ro.observe(el);
        return () => {
            clearTimeout(debounceTimer);
            ro.disconnect();
        };
    }, [mode, size.w]);

    useEffect(() => {
        if (mode !== 'pending' || size.w <= 1 || size.h <= 1) return undefined;
        let cancelled = false;

        // ponytail: clamp DPR on large cards (>220k px) to keep PNG displacement synthesis under 4ms
        const effectiveDpr =
            size.w * size.h > 220000
                ? 1
                : Math.min(window.devicePixelRatio || 1, maxMapDpr);

        (async () => {
            try {
                const mapUrl = await generateDisplacementBlobUrl({
                    width: size.w,
                    height: size.h,
                    radius: Math.min(radius, size.w / 2, size.h / 2),
                    bevelDepth: Math.min(bevelDepth, Math.min(size.w, size.h) / 2),
                    dpr: effectiveDpr,
                });

                await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = img.onerror = () => resolve();
                    img.src = mapUrl;
                });

                if (cancelled) {
                    URL.revokeObjectURL(mapUrl);
                    return;
                }

                if (blobRef.current) URL.revokeObjectURL(blobRef.current);
                blobRef.current = mapUrl;

                const id = `lg-${reactId}-${size.w}x${size.h}-${Date.now().toString(36)}`;
                setFilter({
                    id,
                    svg: buildFilterSvg({
                        id,
                        mapUrl,
                        width: size.w,
                        height: size.h,
                        scale,
                        aberration,
                        frost,
                    }),
                });
            } catch {
                // Canvas/PNG fallback unavailable — preserve frosted backdrop safely
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        mode,
        size.w,
        size.h,
        radius,
        bevelDepth,
        scale,
        aberration,
        frost,
        maxMapDpr,
        reactId,
    ]);

    useEffect(
        () => () => {
            if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        },
        []
    );

    const backdrop =
        mode === 'opaque'
            ? 'none'
            : mode === 'simple'
              ? 'blur(20px) saturate(1.4)'
              : filter
                ? `url(#${filter.id}) blur(0.5px) saturate(${saturation}) brightness(${brightness})`
                : 'blur(12px) saturate(1.6) brightness(1.04)';

    const modeClass =
        mode === 'simple'
            ? 'lg-surface lg-simple'
            : mode === 'opaque'
              ? 'lg-surface lg-opaque'
              : 'lg-surface';

    const combinedClassName = [modeClass, className].filter(Boolean).join(' ');

    const HostTag = as;

    return (
        <HostTag
            ref={setHostRef}
            data-refract={mode === 'pending' && filter ? 'true' : 'false'}
            className={combinedClassName}
            style={{
                '--lg-tint-bg': `rgb(${tintRgb} / ${tint})`,
                borderRadius: radius,
                backdropFilter: backdrop,
                WebkitBackdropFilter: backdrop,
                ...style,
            }}
            {...rest}
        >
            {filter ? (
                <span
                    key={filter.id}
                    aria-hidden="true"
                    className="lg-svg-host"
                    dangerouslySetInnerHTML={{ __html: filter.svg }}
                />
            ) : null}
            {contentClassName ? <div className={contentClassName}>{children}</div> : children}
        </HostTag>
    );
}

export default LiquidGlass;
