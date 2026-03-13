import { useCallback, useContext, useRef } from "react";
import type { PointerEvent, WheelEvent } from "react";
import { PaintContext } from "../context/PaintContext";
import { MAX_ZOOM, ZOOM_STEP } from "./useViewport";
import type { Point } from "../types/Graphics";

const CANVAS_GROWTH_STEP = 1200;

type PanZoomInput = {
    getViewportSize: () => { width: number; height: number };
    clampViewOffset: (next: Point, viewportWidth?: number, viewportHeight?: number, canvasWidth?: number, canvasHeight?: number, zoomLevel?: number) => Point;
    getMinAllowedZoom: (viewportWidth?: number, viewportHeight?: number, canvasWidth?: number, canvasHeight?: number) => number;
};

const usePanZoom = ({ getViewportSize, clampViewOffset, getMinAllowedZoom }: PanZoomInput) => {
    const {
        canvasRef,
        containerRef,
        viewOffset,
        setViewOffset,
        zoom,
        setZoom,
        canvasSize,
        setCanvasSize,
        setCanvasPanning,
        isPanModeActive,
    } = useContext(PaintContext)!;

    const panSession = useRef<{
        pointerId: number;
        mode: "middle" | "tool";
        startClientX: number;
        startClientY: number;
        originOffset: Point;
    } | null>(null);

    const maybeGrowCanvas = useCallback((candidateOffset: Point) => {
        const { width: vpW, height: vpH } = getViewportSize();
        if (vpW <= 0 || vpH <= 0) return { width: canvasSize.width, height: canvasSize.height };

        let nextW = canvasSize.width;
        let nextH = canvasSize.height;
        if (candidateOffset.x < Math.min(0, vpW - canvasSize.width * zoom)) nextW += CANVAS_GROWTH_STEP;
        if (candidateOffset.y < Math.min(0, vpH - canvasSize.height * zoom)) nextH += CANVAS_GROWTH_STEP;

        if (nextW !== canvasSize.width || nextH !== canvasSize.height) {
            setCanvasSize((prev) => ({
                width: Math.max(prev.width, nextW),
                height: Math.max(prev.height, nextH),
            }));
        }
        return { width: nextW, height: nextH };
    }, [canvasSize.width, canvasSize.height, getViewportSize, setCanvasSize, zoom]);

    /** Returns true if pan was initiated — caller should return early. */
    const onPointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>): boolean => {
        const canvas = canvasRef.current;
        if (!canvas) return false;

        if (e.button === 1 || (e.button === 0 && isPanModeActive)) {
            e.preventDefault();
            canvas.setPointerCapture(e.pointerId);
            panSession.current = {
                pointerId: e.pointerId,
                mode: e.button === 1 ? "middle" : "tool",
                startClientX: e.clientX,
                startClientY: e.clientY,
                originOffset: viewOffset,
            };
            setCanvasPanning(true);
            return true;
        }

        if (panSession.current?.pointerId === e.pointerId) {
            panSession.current = null;
            setCanvasPanning(false);
        }
        return false;
    }, [canvasRef, isPanModeActive, viewOffset, setCanvasPanning]);

    /** Returns true if pan move was handled — caller should return early. */
    const onPointerMove = useCallback((e: PointerEvent<HTMLCanvasElement>): boolean => {
        if (panSession.current?.pointerId !== e.pointerId) return false;

        const ok = panSession.current.mode === "tool"
            ? isPanModeActive && (e.buttons & 1) === 1
            : (e.buttons & 4) === 4;

        if (!ok) {
            panSession.current = null;
            setCanvasPanning(false);
            return false;
        }

        e.preventDefault();
        const candidate = {
            x: panSession.current.originOffset.x + (e.clientX - panSession.current.startClientX),
            y: panSession.current.originOffset.y + (e.clientY - panSession.current.startClientY),
        };
        const nextSize = maybeGrowCanvas(candidate);
        setViewOffset(clampViewOffset(candidate, undefined, undefined, nextSize.width, nextSize.height));
        return true;
    }, [isPanModeActive, setCanvasPanning, maybeGrowCanvas, clampViewOffset, setViewOffset]);

    /** Returns true if pan end was handled — caller should return early. */
    const onPointerUp = useCallback((e?: PointerEvent<HTMLCanvasElement>): boolean => {
        if (!panSession.current) return false;
        if (e && panSession.current.pointerId !== e.pointerId) return false;

        setCanvasPanning(false);
        panSession.current = null;
        if (e?.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        return true;
    }, [setCanvasPanning]);

    const handleWheel = useCallback((e: WheelEvent<HTMLElement>) => {
        const { width: vpW, height: vpH } = getViewportSize();
        if (vpW <= 0 || vpH <= 0) return;
        e.preventDefault();

        const direction = e.deltaY < 0 ? 1 : -1;
        const minZoom = getMinAllowedZoom(vpW, vpH, canvasSize.width, canvasSize.height);
        const nextZoom = Math.min(MAX_ZOOM, Math.max(minZoom, Number((zoom + direction * ZOOM_STEP).toFixed(2))));
        if (nextZoom === zoom) return;

        const viewport = containerRef.current;
        if (!viewport) return;

        const rect = viewport.getBoundingClientRect();
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;
        const wx = (lx - viewOffset.x) / zoom;
        const wy = (ly - viewOffset.y) / zoom;

        setZoom(nextZoom);
        setViewOffset(clampViewOffset(
            { x: lx - wx * nextZoom, y: ly - wy * nextZoom },
            vpW, vpH, canvasSize.width, canvasSize.height, nextZoom,
        ));
    }, [
        getViewportSize, getMinAllowedZoom, canvasSize.width, canvasSize.height,
        zoom, containerRef, viewOffset.x, viewOffset.y, clampViewOffset, setZoom, setViewOffset,
    ]);

    return { onPointerDown, onPointerMove, onPointerUp, handleWheel };
};

export default usePanZoom;
