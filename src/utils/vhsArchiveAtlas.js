// Procedural + real-project screenshot duotone sprite atlas generator
// Synthesizes the 4x3 VHS Cover Sheet (1744x2336) and 12x1 VHS Spine Strip (2688x1152)
// so every VHS tape displays worn cardboard texture, screen-print grain, and Vivaswan's real builds.

import elevatexImg from '../assets/elevatex.webp';
import elevatexMobileCoverImg from '../assets/elevatex-mobile-cover.webp';
import conqueroneImg from '../assets/conquerone.webp';
import portfolioCoverImg from '../assets/portfolio-cover.webp';
import medfindImg from '../assets/medfind.webp';
import rvToursImg from '../assets/rv-tours.webp';
import {
    COVER_CELL_BOXES,
    COVERS_SHEET_H,
    COVERS_SHEET_W,
    SPINE_CELL_BOXES,
    SPINES_SHEET_H,
    SPINES_SHEET_W,
    VHS_ARCHIVE_ITEMS,
} from './vhsArchiveMath';

const SHOT_SOURCES = {
    medfind: medfindImg,
    'rv-tours': rvToursImg,
    'elevatex-web': elevatexImg,
    'elevatex-mobile': elevatexMobileCoverImg,
    conquerone: conqueroneImg,
    portfolio: portfolioCoverImg,
};

function drawCardboardGrain(ctx, x, y, w, h, seed) {
    let s = seed >>> 0;
    const rand = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0xffffffff;
    };

    ctx.save();
    for (let i = 0; i < 65; i++) {
        const px = x + rand() * w;
        const py = y + rand() * h;
        const rw = 1 + rand() * 3.5;
        const rh = 1 + rand() * 2;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(20, 20, 20, 0.055)' : 'rgba(255, 255, 255, 0.07)';
        ctx.fillRect(px, py, rw, rh);
    }
    // Subtle worn top/bottom horizontal wear lines
    for (let i = 0; i < 8; i++) {
        const ly = y + (rand() < 0.5 ? rand() * 22 : h - rand() * 22);
        ctx.fillStyle = 'rgba(20, 16, 12, 0.09)';
        ctx.fillRect(x, ly, w, 1.2);
    }
    ctx.restore();
}

function drawVhsBadge(ctx, cx, cy, boxW, boxH, strokeColor, textColor) {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH);
    ctx.fillStyle = textColor;
    ctx.font = '700 13px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VHS', cx, cy + 0.5);
    ctx.restore();
}

function drawCoverMotifArt(ctx, item, x, y, w, h, loadedImg) {
    const { dark, accent, cobalt } = item.palette;
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // Base rich midnight tone inside illustration window
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, dark);
    grad.addColorStop(0.55, '#121a2d');
    grad.addColorStop(1, '#080b12');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Composite real project screenshot in high-contrast screen-print style when loaded
    if (loadedImg && loadedImg.naturalWidth > 0) {
        const imgAspect = loadedImg.naturalWidth / loadedImg.naturalHeight;
        const boxAspect = w / h;
        let dw = w;
        let dh = h;
        if (imgAspect > boxAspect) {
            dh = h;
            dw = h * imgAspect;
        } else {
            dw = w;
            dh = w / imgAspect;
        }
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.filter = 'contrast(1.22) saturate(0.75)';
        ctx.drawImage(loadedImg, cx - dw / 2, cy - dh / 2, dw, dh);
        ctx.restore();

        // Duotone wash uniting every screenshot into a cohesive VHS print series
        const wash = ctx.createLinearGradient(x, y, x, y + h);
        wash.addColorStop(0, 'rgba(37, 99, 235, 0.24)');
        wash.addColorStop(0.55, 'rgba(10, 12, 22, 0.25)');
        wash.addColorStop(1, 'rgba(239, 68, 68, 0.44)');
        ctx.fillStyle = wash;
        ctx.fillRect(x, y, w, h);
    } else {
        // Bold geometric duotone illustration per milestone
        const m = item.motif;
        if (m === 'matrix' || m === 'layers') {
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 5; col++) {
                    const active = (row * 5 + col + item.index) % 3 === 0;
                    ctx.fillStyle = active ? accent : col % 2 === 0 ? cobalt : 'rgba(248, 250, 252, 0.16)';
                    ctx.fillRect(x + 28 + col * 52, y + 48 + row * 50, 40, 38);
                }
            }
        } else if (m === 'orbit' || m === 'ring') {
            for (let ring = 1; ring <= 4; ring++) {
                ctx.strokeStyle = ring % 2 === 0 ? accent : 'rgba(248, 250, 252, 0.65)';
                ctx.lineWidth = ring === 2 ? 4 : 2;
                ctx.beginPath();
                ctx.ellipse(cx, cy, ring * 30, ring * 44, (item.index * 0.4) % Math.PI, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(cx, cy, 24, 0, Math.PI * 2);
            ctx.fill();
        } else if (m === 'canyon' || m === 'horizon') {
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(cx, y + h * 0.34, 54, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(248, 250, 252, 0.65)';
            ctx.lineWidth = 2.5;
            for (let ridge = 0; ridge < 6; ridge++) {
                ctx.beginPath();
                const baseY = y + h * 0.45 + ridge * 30;
                for (let px = x; px <= x + w; px += 12) {
                    const t = (px - x) / w;
                    const wave = Math.sin(t * Math.PI * 3 + ridge) * 14 + Math.cos(t * 9) * 8;
                    const py = baseY + wave;
                    if (px === x) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
        } else if (m === 'pulse' || m === 'wave') {
            ctx.strokeStyle = accent;
            ctx.lineWidth = 5;
            ctx.beginPath();
            for (let px = x; px <= x + w; px += 5) {
                const t = (px - x) / w;
                const peak = Math.exp(-Math.pow((t - 0.52) * 8, 2)) * 90;
                const py = cy + Math.sin(t * 18) * 18 - peak;
                if (px === x) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        } else {
            ctx.strokeStyle = cobalt;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(cx, y + 36);
            ctx.lineTo(x + w - 34, y + h - 42);
            ctx.lineTo(x + 34, y + h - 42);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(cx, cy + 12, 34, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Subtle analog scanlines across artwork window
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    for (let sy = y; sy < y + h; sy += 6) {
        ctx.fillRect(x, sy, w, 1.5);
    }

    // Precision corner reticle ticks
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    ctx.restore();
}

function renderCoversSheetCanvas(imagesByKey) {
    const canvas = document.createElement('canvas');
    canvas.width = COVERS_SHEET_W;
    canvas.height = COVERS_SHEET_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.clearRect(0, 0, COVERS_SHEET_W, COVERS_SHEET_H);

    VHS_ARCHIVE_ITEMS.forEach((item, idx) => {
        const box = COVER_CELL_BOXES[idx];
        if (!box) return;
        const { x, y, w, h } = box;
        const { paper, dark, accent } = item.palette;

        ctx.save();
        // Sleeve outer background (warm archival paper card with sharp border)
        ctx.fillStyle = paper;
        ctx.fillRect(x, y, w, h);

        // Dark top strip matching analog collector edition branding
        ctx.fillStyle = dark;
        ctx.fillRect(x, y, w, 54);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('A VIVASWAN SHETTY RELEASE', x + w / 2, y + 27);

        // Big bold condensed title block on warm paper
        ctx.fillStyle = accent;
        ctx.fillRect(x + 22, y + 72, 42, 4);

        ctx.fillStyle = dark;
        ctx.font = '800 32px "Outfit", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const words = item.title.toUpperCase().split(' ');
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
        ctx.fillText(line1, x + 22, y + 84, w - 44);
        if (line2) {
            ctx.fillText(line2, x + 22, y + 120, w - 44);
        } else {
            ctx.fillStyle = 'rgba(20, 20, 20, 0.56)';
            ctx.font = '600 14px "Space Grotesk", sans-serif';
            ctx.fillText(`${item.displayYear} · ${item.category}`, x + 22, y + 124, w - 44);
        }

        // Central duotone artwork / project screenshot window
        const artY = y + 172;
        const artH = h - 252;
        drawCoverMotifArt(ctx, item, x + 18, artY, w - 36, artH, item.shotKey ? imagesByKey[item.shotKey] : null);

        // Bottom archival metadata strip + boxed VHS stamp
        ctx.fillStyle = dark;
        ctx.font = '700 12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${item.code}  //  ${item.displayYear}`, x + 22, y + h - 38);

        drawVhsBadge(ctx, x + w - 46, y + h - 38, 48, 24, dark, dark);

        drawCardboardGrain(ctx, x, y, w, h, 4100 + idx * 97);
        ctx.strokeStyle = 'rgba(18, 18, 22, 0.24)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx.restore();
    });

    return canvas;
}

function renderSpinesSheetCanvas(imagesByKey) {
    const canvas = document.createElement('canvas');
    canvas.width = SPINES_SHEET_W;
    canvas.height = SPINES_SHEET_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.clearRect(0, 0, SPINES_SHEET_W, SPINES_SHEET_H);

    VHS_ARCHIVE_ITEMS.forEach((item, idx) => {
        const box = SPINE_CELL_BOXES[idx];
        if (!box) return;
        const { x, y, w, h } = box;
        const darkSpine = idx % 3 === 1;
        const baseBg = darkSpine ? '#121624' : idx % 3 === 2 ? '#1c1116' : '#ece7de';
        const ink = darkSpine || idx % 3 === 2 ? '#f8fafc' : '#141414';
        const { accent } = item.palette;

        ctx.save();
        ctx.fillStyle = baseBg;
        ctx.fillRect(x, y, w, h);

        // Worn subtle spine crease along edges
        ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.fillRect(x, y, 7, h);
        ctx.fillRect(x + w - 7, y, 7, h);

        // Top miniature illustration window (aspect ~1:1)
        const thumbMargin = 18;
        const thumbW = w - thumbMargin * 2;
        const thumbH = 196;
        drawCoverMotifArt(
            ctx,
            item,
            x + thumbMargin,
            y + 28,
            thumbW,
            thumbH,
            item.shotKey ? imagesByKey[item.shotKey] : null
        );

        // Accent color band under thumb
        ctx.fillStyle = accent;
        ctx.fillRect(x + thumbMargin, y + 242, thumbW, 8);

        // Vertical condensed spine title rotating 90 degrees clockwise
        ctx.save();
        ctx.translate(x + w / 2, y + 585);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = ink;
        ctx.font = '800 50px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.spineLabel, 0, 0, 560);
        ctx.restore();

        // Creator surname + year before boxed VHS mark at spine foot
        ctx.fillStyle = ink;
        ctx.font = '700 18px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SHETTY', x + w / 2, y + h - 122);

        ctx.fillStyle = accent;
        ctx.font = '700 16px "Space Grotesk", sans-serif';
        ctx.fillText(`${item.displayYear}`, x + w / 2, y + h - 94);

        // Boxed VHS emblem at spine base
        drawVhsBadge(ctx, x + w / 2, y + h - 48, 62, 28, ink, ink);

        drawCardboardGrain(ctx, x, y, w, h, 8800 + idx * 71);
        ctx.strokeStyle = 'rgba(20, 20, 20, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx.restore();
    });

    return canvas;
}

function canvasToObjectUrl(canvas) {
    return new Promise((resolve) => {
        if (typeof canvas.toBlob === 'function') {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(URL.createObjectURL(blob));
                } else {
                    resolve(canvas.toDataURL('image/png'));
                }
            }, 'image/png');
        } else {
            resolve(canvas.toDataURL('image/png'));
        }
    });
}

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

/**
 * Generates immediate synchronous fallback sheets, then progressively upgrades them
 * once local project screenshot WebPs decode. Calls `onUpdate({ coversUrl, spinesUrl })`.
 */
export function buildVhsArchiveAtlas(onUpdate) {
    let cancelled = false;
    const activeUrls = [];

    const emit = async (imagesByKey) => {
        const coversCanvas = renderCoversSheetCanvas(imagesByKey);
        const spinesCanvas = renderSpinesSheetCanvas(imagesByKey);
        const [coversUrl, spinesUrl] = await Promise.all([
            canvasToObjectUrl(coversCanvas),
            canvasToObjectUrl(spinesCanvas),
        ]);
        if (cancelled) {
            if (coversUrl.startsWith('blob:')) URL.revokeObjectURL(coversUrl);
            if (spinesUrl.startsWith('blob:')) URL.revokeObjectURL(spinesUrl);
            return;
        }
        activeUrls.push(coversUrl, spinesUrl);
        onUpdate({ coversUrl, spinesUrl });
    };

    // Pass 1: Immediate vector-crisp cover & spine sheet on frame 0
    emit({});

    // Pass 2: Upgrade with real project screenshot WebPs once decoded locally
    const entries = Object.entries(SHOT_SOURCES);
    Promise.all(entries.map(async ([k, src]) => [k, await loadImage(src)])).then((pairs) => {
        if (cancelled) return;
        const loaded = Object.fromEntries(pairs.filter(([, img]) => Boolean(img)));
        if (Object.keys(loaded).length > 0) {
            emit(loaded);
        }
    });

    return () => {
        cancelled = true;
        for (const u of activeUrls) {
            if (u.startsWith('blob:')) URL.revokeObjectURL(u);
        }
    };
}
