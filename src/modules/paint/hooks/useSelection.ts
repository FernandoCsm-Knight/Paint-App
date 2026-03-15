import { useCallback, useContext, useRef } from "react";
import type { RefObject } from "react";
import { PaintContext } from "../context/PaintContext";
import { ReplacementContext } from "../context/ReplacementContext";
import { SettingsContext } from "../context/SettingsContext";
import { cohenSutherland, type ClipWindow } from "../algorithms/CohenSutherland";
import { liangBarsky } from "../algorithms/LiangBarsky";
import { sutherlandHodgman } from "../algorithms/SutherlandHodgman";
import { Shape } from "../shapes/ShapeTypes";
import SnapshotShape from "../shapes/SnapshotShape";
import type { SceneItem } from "./useScene";
import type { Point } from "../../../functions/geometry";

// ─── Types ───────────────────────────────────────────────────────────────────

type SelectionInput = {
    sceneRef: RefObject<SceneItem[]>;
    redrawFromScene: (ctx: CanvasRenderingContext2D) => void;
    pushShape: (shape: SceneItem) => void;
    takeSnapshotShape: (ctx: CanvasRenderingContext2D) => SnapshotShape;
};

type SelectionPhase = 'idle' | 'drawing' | 'floating';

/** Floating state for standard (raster) mode. */
type StandardFloat = {
    kind: 'standard';
    imageData: ImageData;
    /** Current top-left of the floating image in doc-space pixels. */
    x: number;
    y: number;
    /** Size of the floating image in doc-space pixels. */
    w: number;
    h: number;
};

/** Floating state for pixelated mode (line or polygon clip). */
type PixelFloat = {
    kind: 'pixel';
    shapes: (Shape & { start?: Point; end?: Point; points?: Point[] })[];
    keepInScene: SceneItem[];
    /** Current selection rect in doc-space (canvas) pixels — tracks with drag. */
    rectX: number;
    rectY: number;
    rectW: number;
    rectH: number;
};

type FloatState = StandardFloat | PixelFloat;

// ─── Shape type guards ────────────────────────────────────────────────────────

type LineShape  = Shape & { start: Point; end: Point };
type PolyShape  = Shape & { points: Point[] };

function isLineShape(s: Shape): s is LineShape {
    return s.kind === 'line' || s.kind === 'arrow';
}

function isPolyShape(s: Shape): s is PolyShape {
    return 'points' in s && Array.isArray((s as PolyShape).points);
}

// ─── Replay helper (mirrors redrawFromScene but on an arbitrary item list) ──

function replayItems(ctx: CanvasRenderingContext2D, items: SceneItem[]): void {
    let startIdx = 0;
    let found = false;
    for (let i = items.length - 1; i >= 0; i--) {
        if (items[i] instanceof SnapshotShape) { startIdx = i; found = true; break; }
    }
    if (!found) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = startIdx; i < items.length; i++) items[i].draw(ctx);
}

// ─── Overlay drawing helpers ──────────────────────────────────────────────────

function applyViewportTransform(
    overlay: CanvasRenderingContext2D,
    zoom: number,
    viewOffset: Point,
): void {
    const dpr = window.devicePixelRatio || 1;
    overlay.setTransform(zoom * dpr, 0, 0, zoom * dpr, viewOffset.x * dpr, viewOffset.y * dpr);
}

function drawDashedRect(
    overlay: CanvasRenderingContext2D,
    zoom: number,
    x: number, y: number, w: number, h: number,
): void {
    const lw = 1 / zoom;
    overlay.setLineDash([4 * lw, 4 * lw]);
    overlay.lineWidth = lw;
    overlay.strokeStyle = '#1d4ed8';
    overlay.fillStyle = 'rgba(59,130,246,0.10)';
    overlay.beginPath();
    overlay.rect(x, y, w, h);
    overlay.fill();
    overlay.stroke();
    overlay.setLineDash([]);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useSelection = ({ sceneRef, redrawFromScene, pushShape, takeSnapshotShape }: SelectionInput) => {
    const { contextRef, pixelated, viewOffset, zoom, renderViewport } = useContext(PaintContext)!;
    const { pixelSize, clipAlgorithm } = useContext(SettingsContext)!;
    const { replacementContextRef } = useContext(ReplacementContext)!;

    const phase       = useRef<SelectionPhase>('idle');
    const selStart    = useRef<Point | null>(null);
    const selEnd      = useRef<Point | null>(null);
    const floatState  = useRef<FloatState | null>(null);
    const dragStart   = useRef<Point | null>(null);
    /** Snapshot of sceneRef at floating-entry time, used for cancel/commit. */
    const savedScene  = useRef<SceneItem[]>([]);

    // ── Snap helper ────────────────────────────────────────────────────────────

    const snap = useCallback((v: number) =>
        pixelated ? Math.floor(v / pixelSize) * pixelSize : v,
    [pixelated, pixelSize]);

    // ── Overlay: draw selection border (called after renderViewport) ───────────

    const drawSelectionOverlay = useCallback((
        x: number, y: number, w: number, h: number,
    ) => {
        const overlay = replacementContextRef.current;
        if (!overlay) return;
        overlay.save();
        applyViewportTransform(overlay, zoom, viewOffset);
        drawDashedRect(overlay, zoom, x, y, w, h);
        overlay.restore();
    }, [replacementContextRef, zoom, viewOffset]);

    // ── Overlay: draw standard floating image + border ─────────────────────────

    const drawStandardFloatOverlay = useCallback((fs: StandardFloat) => {
        const overlay = replacementContextRef.current;
        if (!overlay) return;

        const tmp = document.createElement('canvas');
        tmp.width  = fs.w;
        tmp.height = fs.h;
        tmp.getContext('2d')?.putImageData(fs.imageData, 0, 0);

        overlay.save();
        applyViewportTransform(overlay, zoom, viewOffset);
        overlay.drawImage(tmp, fs.x, fs.y, fs.w, fs.h);
        drawDashedRect(overlay, zoom, fs.x, fs.y, fs.w, fs.h);
        overlay.restore();
    }, [replacementContextRef, zoom, viewOffset]);

    // ── Enter floating for STANDARD mode ──────────────────────────────────────

    const enterStandardFloat = useCallback((
        ctx: CanvasRenderingContext2D,
        sx: number, sy: number, sw: number, sh: number,
    ) => {
        const imageData = ctx.getImageData(sx, sy, sw, sh);
        ctx.clearRect(sx, sy, sw, sh);

        const fs: StandardFloat = { kind: 'standard', imageData, x: sx, y: sy, w: sw, h: sh };
        floatState.current = fs;
        phase.current      = 'floating';

        pushShape(takeSnapshotShape(ctx)); // "hole" checkpoint for undo
        renderViewport();
        drawStandardFloatOverlay(fs);
    }, [pushShape, takeSnapshotShape, renderViewport, drawStandardFloatOverlay]);

    // ── Enter floating for PIXELATED mode ─────────────────────────────────────

    const enterPixelFloat = useCallback((
        ctx: CanvasRenderingContext2D,
        sx: number, sy: number, sw: number, sh: number,
    ) => {
        const scene = sceneRef.current;
        const isLineCut = clipAlgorithm !== 'sutherland-hodgman';

        // Build clip window in pixel-grid units (shapes store grid coords)
        const win: ClipWindow = {
            xMin: sx / pixelSize,
            yMin: sy / pixelSize,
            xMax: (sx + sw) / pixelSize,
            yMax: (sy + sh) / pixelSize,
        };

        const floatingShapes: PolyShape[] | LineShape[] = [];
        const keepInScene: SceneItem[] = [];

        for (const item of scene) {
            if (!(item instanceof Shape)) { keepInScene.push(item); continue; }

            if (isLineCut && isLineShape(item)) {
                const fn = clipAlgorithm === 'liang-barsky' ? liangBarsky : cohenSutherland;
                const clipped = fn(item.start, item.end, win);
                if (clipped) {
                    // Clip the shape in-place (it will become floating)
                    item.start = clipped.p1;
                    item.end   = clipped.p2;
                    (floatingShapes as LineShape[]).push(item);
                } else {
                    keepInScene.push(item); // entirely outside — stays in scene
                }
            } else if (!isLineCut && isPolyShape(item)) {
                const clipped = sutherlandHodgman(item.points, win);
                if (clipped.length >= 2) {
                    item.points = clipped;
                    (floatingShapes as PolyShape[]).push(item);
                } else {
                    keepInScene.push(item);
                }
            } else {
                keepInScene.push(item);
            }
        }

        if (floatingShapes.length === 0) {
            // Nothing to float — just clear selection overlay
            renderViewport();
            phase.current = 'idle';
            return;
        }

        const pf: PixelFloat = {
            kind: 'pixel',
            shapes: floatingShapes as PixelFloat['shapes'],
            keepInScene,
            rectX: sx, rectY: sy, rectW: sw, rectH: sh,
        };
        floatState.current = pf;
        phase.current = 'floating';

        // Draw scene without floating shapes
        replayItems(ctx, keepInScene);
        pushShape(takeSnapshotShape(ctx)); // "hole" checkpoint for undo

        // Draw floating shapes at their initial position
        for (const s of floatingShapes) s.draw(ctx);
        renderViewport();
        drawSelectionOverlay(sx, sy, sw, sh);
    }, [sceneRef, clipAlgorithm, pixelSize, pushShape, takeSnapshotShape, renderViewport, drawSelectionOverlay]);

    // ── commitFloating ─────────────────────────────────────────────────────────

    const commitFloating = useCallback(() => {
        const ctx = contextRef.current;
        const fs  = floatState.current;
        if (!ctx || !fs) return;

        if (fs.kind === 'standard') {
            redrawFromScene(ctx);                               // restore hole state
            ctx.putImageData(fs.imageData, fs.x, fs.y);        // stamp at final pos
        } else {
            // Restore original scene for undo chain, then draw committed state
            sceneRef.current = [...savedScene.current];
            replayItems(ctx, fs.keepInScene);
            for (const s of fs.shapes) s.draw(ctx);            // at final positions
        }

        pushShape(takeSnapshotShape(ctx));
        renderViewport();

        phase.current      = 'floating'; // will be set to idle below
        floatState.current = null;
        dragStart.current  = null;
        phase.current      = 'idle';
    }, [contextRef, redrawFromScene, sceneRef, pushShape, takeSnapshotShape, renderViewport]);

    // ── cancelFloating ────────────────────────────────────────────────────────

    const cancelFloating = useCallback(() => {
        const ctx = contextRef.current;
        if (!ctx) return;

        // Restore scene and canvas to the state before the cut
        sceneRef.current = [...savedScene.current];
        redrawFromScene(ctx);
        renderViewport();

        floatState.current = null;
        dragStart.current  = null;
        phase.current      = 'idle';
    }, [contextRef, sceneRef, redrawFromScene, renderViewport]);

    // ── Public drawing phase API ───────────────────────────────────────────────

    const startSelection = useCallback((point: Point) => {
        const p = { x: snap(point.x), y: snap(point.y) };
        selStart.current = p;
        selEnd.current   = p;
        phase.current    = 'drawing';
        renderViewport();
        drawSelectionOverlay(p.x, p.y, 0, 0);
    }, [snap, renderViewport, drawSelectionOverlay]);

    const updateSelection = useCallback((point: Point) => {
        if (!selStart.current) return;
        const nx = snap(point.x);
        const ny = snap(point.y);
        selEnd.current = { x: nx, y: ny };
        const sx = Math.min(selStart.current.x, nx);
        const sy = Math.min(selStart.current.y, ny);
        const w  = Math.abs(nx - selStart.current.x);
        const h  = Math.abs(ny - selStart.current.y);
        renderViewport();
        drawSelectionOverlay(sx, sy, w, h);
    }, [snap, renderViewport, drawSelectionOverlay]);

    const stopSelection = useCallback(() => {
        const ctx = contextRef.current;
        if (!ctx || !selStart.current || !selEnd.current) {
            phase.current = 'idle';
            renderViewport();
            return;
        }

        const sx = Math.min(selStart.current.x, selEnd.current.x);
        const sy = Math.min(selStart.current.y, selEnd.current.y);
        const sw = Math.abs(selEnd.current.x - selStart.current.x);
        const sh = Math.abs(selEnd.current.y - selStart.current.y);

        selStart.current = null;
        selEnd.current   = null;

        if (sw < 2 || sh < 2) {
            phase.current = 'idle';
            renderViewport();
            return;
        }

        // Save scene before any modification (needed for cancel and commit)
        savedScene.current = [...sceneRef.current];

        if (pixelated) {
            enterPixelFloat(ctx, sx, sy, sw, sh);
        } else {
            enterStandardFloat(ctx, sx, sy, sw, sh);
        }
    }, [contextRef, sceneRef, pixelated, renderViewport, enterPixelFloat, enterStandardFloat]);

    // ── Floating phase pointer events ──────────────────────────────────────────

    /** Returns true if the given doc-space point is inside the floating rect. */
    const isInsideFloat = (p: Point): boolean => {
        const fs = floatState.current;
        if (!fs) return false;
        const rx = fs.kind === 'standard' ? fs.x : fs.rectX / pixelSize;
        const ry = fs.kind === 'standard' ? fs.y : fs.rectY / pixelSize;
        const rw = fs.kind === 'standard' ? fs.w : fs.rectW / pixelSize;
        const rh = fs.kind === 'standard' ? fs.h : fs.rectH / pixelSize;
        return p.x >= rx && p.x <= rx + rw && p.y >= ry && p.y <= ry + rh;
    };

    const onPointerDown = useCallback((docPoint: Point): boolean => {
        if (phase.current !== 'floating') return false;
        if (isInsideFloat(docPoint)) {
            dragStart.current = docPoint;
        } else {
            commitFloating();
        }
        return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commitFloating]);

    const onPointerMove = useCallback((docPoint: Point): boolean => {
        if (phase.current !== 'floating' || !dragStart.current) return false;
        const ctx = contextRef.current;
        if (!ctx) return false;

        const fs = floatState.current;
        if (!fs) return false;

        if (fs.kind === 'standard') {
            const dx = docPoint.x - dragStart.current.x;
            const dy = docPoint.y - dragStart.current.y;
            fs.x += dx;
            fs.y += dy;
            dragStart.current = docPoint;
            redrawFromScene(ctx); // restore hole
            renderViewport();
            drawStandardFloatOverlay(fs);
        } else {
            // Pixelated: docPoint is already in grid units (mapped by caller)
            const dx = docPoint.x - dragStart.current.x;
            const dy = docPoint.y - dragStart.current.y;
            dragStart.current = docPoint;
            for (const s of fs.shapes) s.moveBy(dx, dy);
            fs.rectX += dx * pixelSize;
            fs.rectY += dy * pixelSize;
            replayItems(ctx, fs.keepInScene);
            for (const s of fs.shapes) s.draw(ctx);
            renderViewport();
            drawSelectionOverlay(fs.rectX, fs.rectY, fs.rectW, fs.rectH);
        }

        return true;
    }, [contextRef, redrawFromScene, renderViewport, drawStandardFloatOverlay, drawSelectionOverlay, pixelSize]);

    const onPointerUp = useCallback((): boolean => {
        if (phase.current !== 'floating') return false;
        dragStart.current = null; // end drag; shape stays floating
        return true;
    }, []);

    const hasFloating = () => phase.current === 'floating';

    return {
        startSelection,
        updateSelection,
        stopSelection,
        hasFloating,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        cancelSelection: cancelFloating,
        commitSelection: commitFloating,
    };
};

export default useSelection;
