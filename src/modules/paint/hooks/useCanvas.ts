import { useEffect, useRef, useCallback, type PointerEvent, type WheelEvent, useContext } from "react";
import { PaintContext } from "../context/PaintContext";
import { Shape } from "../types/ShapeTypes";
import generator from "../types/ShapeGenerator";
import FreeForm from "../types/FreeForm";
import FillShape from "../shapes/FillShape";
import { map, type Point } from "../types/Graphics";
import useImage from "./useImage";
import useSelection from "./useSelection";
import useHistory from "./useHistory";
import useReplacement from "./useReplacement";
import { ReplacementContext } from "../context/ReplacementContext";
import { SettingsContext } from "../context/SettingsContext";
import { getGridCellSize, GRID_LINE_COLOR } from "../utils/Grid";

const MIN_CANVAS_WIDTH = 2400;
const MIN_CANVAS_HEIGHT = 1600;
const CANVAS_SCALE_FACTOR = 2;
const CANVAS_GROWTH_STEP = 1200;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.12;

const useCanvas = () => {
    const paintContext = useContext(PaintContext)!;
    const {
        canvasRef,
        viewportCanvasRef,
        containerRef,
        contextRef,
        thickness,
        currentColor,
        isEraserActive,
        isFillActive,
        isSelectionActive,
        pixelated,
        selectedShape,
        isPanModeActive,
        setCanvasPanning,
        viewOffset,
        setViewOffset,
        zoom,
        setZoom,
        canvasSize,
        setCanvasSize,
        setRenderViewport
    } = paintContext;

    const { pixelSize, lineAlgorithm, gridDisplayMode } = useContext(SettingsContext)!;

    const isDrawing = useRef(false);
    const start = useRef<Point>({ x: 0, y: 0 });
    const panSession = useRef<{
        pointerId: number;
        mode: "middle" | "tool";
        startClientX: number;
        startClientY: number;
        originOffset: Point;
    } | null>(null);

    const {
        push: pushSnapshot,
        undo: undoSnapshot,
        redo: redoSnapshot,
        last: lastSnapshot
    } = useHistory<ImageData>(50);

    const currentShape = useRef<Shape | null>(null);

    const saveCurrentState = useCallback((snapshot: ImageData | null) => {
        if(snapshot) {
            pushSnapshot(snapshot);
        }
    }, [pushSnapshot]);

    const {
        takeSnapshot,
        restoreSnapshot,
        copySnapshot,
        pasteSnapshot
    } = useImage(saveCurrentState);

    const {
        startSelection,
        updateSelection,
        stopSelection
    } = useSelection();

    const {
        drawGrid,
        clearGrid
    } = useReplacement();

    const replacementContext = useContext(ReplacementContext)!;
    const {
        replacementCanvasRef,
        viewportReplacementCanvasRef,
        replacementContextRef
    } = replacementContext;

    const ensureDocumentCanvases = useCallback(() => {
        if(!canvasRef.current) {
            canvasRef.current = document.createElement("canvas");
        }

        if(!replacementCanvasRef.current) {
            replacementCanvasRef.current = document.createElement("canvas");
        }
    }, [canvasRef, replacementCanvasRef]);

    const getViewportSize = useCallback(() => {
        const viewport = containerRef.current;
        if(!viewport) {
            return { width: 0, height: 0 };
        }

        return {
            width: Math.max(1, Math.floor(viewport.clientWidth)),
            height: Math.max(1, Math.floor(viewport.clientHeight))
        };
    }, [containerRef]);

    const resizeViewportCanvas = useCallback((canvas: HTMLCanvasElement, width: number, height: number) => {
        const dpr = window.devicePixelRatio || 1;
        const bitmapWidth = Math.max(1, Math.floor(width * dpr));
        const bitmapHeight = Math.max(1, Math.floor(height * dpr));

        if(canvas.width !== bitmapWidth) {
            canvas.width = bitmapWidth;
        }

        if(canvas.height !== bitmapHeight) {
            canvas.height = bitmapHeight;
        }

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    }, []);

    const clampViewOffset = useCallback((next: Point, viewportWidth?: number, viewportHeight?: number, canvasWidth?: number, canvasHeight?: number, zoomLevel?: number): Point => {
        const resolvedViewport = getViewportSize();
        const resolvedViewportWidth = viewportWidth ?? resolvedViewport.width;
        const resolvedViewportHeight = viewportHeight ?? resolvedViewport.height;
        const resolvedCanvasWidth = canvasWidth ?? canvasRef.current?.width ?? 0;
        const resolvedCanvasHeight = canvasHeight ?? canvasRef.current?.height ?? 0;
        const scale = zoomLevel ?? zoom;
        const scaledCanvasWidth = resolvedCanvasWidth * scale;
        const scaledCanvasHeight = resolvedCanvasHeight * scale;

        const minX = Math.min(0, resolvedViewportWidth - scaledCanvasWidth);
        const minY = Math.min(0, resolvedViewportHeight - scaledCanvasHeight);

        return {
            x: Math.min(0, Math.max(minX, next.x)),
            y: Math.min(0, Math.max(minY, next.y)),
        };
    }, [canvasRef, getViewportSize, zoom]);

    const getMinAllowedZoom = useCallback((viewportWidth?: number, viewportHeight?: number, canvasWidth?: number, canvasHeight?: number) => {
        const resolvedViewport = getViewportSize();
        const resolvedViewportWidth = viewportWidth ?? resolvedViewport.width;
        const resolvedViewportHeight = viewportHeight ?? resolvedViewport.height;
        const resolvedCanvasWidth = canvasWidth ?? canvasRef.current?.width ?? 0;
        const resolvedCanvasHeight = canvasHeight ?? canvasRef.current?.height ?? 0;

        if(resolvedCanvasWidth <= 0 || resolvedCanvasHeight <= 0) {
            return MIN_ZOOM;
        }

        return Math.max(
            MIN_ZOOM,
            resolvedViewportWidth / resolvedCanvasWidth,
            resolvedViewportHeight / resolvedCanvasHeight
        );
    }, [canvasRef, getViewportSize]);

    const renderViewport = useCallback(() => {
        const documentCanvas = canvasRef.current;
        const viewportCanvas = viewportCanvasRef.current;
        const overlayDocumentCanvas = replacementCanvasRef.current;
        const overlayViewportCanvas = viewportReplacementCanvasRef.current;
        const { width: viewportWidth, height: viewportHeight } = getViewportSize();

        if(!viewportCanvas || !overlayViewportCanvas || viewportWidth <= 0 || viewportHeight <= 0) {
            return;
        }

        resizeViewportCanvas(viewportCanvas, viewportWidth, viewportHeight);
        resizeViewportCanvas(overlayViewportCanvas, viewportWidth, viewportHeight);

        const viewportCtx = viewportCanvas.getContext("2d", {
            alpha: true,
            willReadFrequently: true
        });
        const overlayViewportCtx = overlayViewportCanvas.getContext("2d", {
            alpha: true,
            willReadFrequently: true
        });

        if(!viewportCtx || !overlayViewportCtx) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const drawViewport = (targetCtx: CanvasRenderingContext2D, sourceCanvas: HTMLCanvasElement | null, clearBeforeDraw: boolean = true) => {
            if(clearBeforeDraw) {
                targetCtx.setTransform(1, 0, 0, 1, 0, 0);
                targetCtx.clearRect(0, 0, targetCtx.canvas.width, targetCtx.canvas.height);
            }
            targetCtx.imageSmoothingEnabled = false;

            if(!sourceCanvas) {
                return;
            }

            const sourceWidth = Math.min(sourceCanvas.width, viewportWidth / zoom);
            const sourceHeight = Math.min(sourceCanvas.height, viewportHeight / zoom);
            const maxSourceX = Math.max(0, sourceCanvas.width - sourceWidth);
            const maxSourceY = Math.max(0, sourceCanvas.height - sourceHeight);
            const sourceX = Math.min(maxSourceX, Math.max(0, -viewOffset.x / zoom));
            const sourceY = Math.min(maxSourceY, Math.max(0, -viewOffset.y / zoom));

            targetCtx.save();
            targetCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            targetCtx.drawImage(
                sourceCanvas,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                viewportWidth,
                viewportHeight
            );
            targetCtx.restore();
        };

        drawViewport(viewportCtx, documentCanvas);

        overlayViewportCtx.setTransform(1, 0, 0, 1, 0, 0);
        overlayViewportCtx.clearRect(0, 0, overlayViewportCtx.canvas.width, overlayViewportCtx.canvas.height);

        if(gridDisplayMode !== "none") {
            const gridCellSize = getGridCellSize(pixelated, pixelSize) * zoom;
            const startX = ((viewOffset.x % gridCellSize) + gridCellSize) % gridCellSize;
            const startY = ((viewOffset.y % gridCellSize) + gridCellSize) % gridCellSize;

            overlayViewportCtx.save();
            overlayViewportCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            overlayViewportCtx.strokeStyle = GRID_LINE_COLOR;
            overlayViewportCtx.lineWidth = 1;
            overlayViewportCtx.beginPath();

            for(let x = startX; x <= viewportWidth; x += gridCellSize) {
                const alignedX = Math.round(x) + 0.5;
                overlayViewportCtx.moveTo(alignedX, 0);
                overlayViewportCtx.lineTo(alignedX, viewportHeight);
            }

            for(let y = startY; y <= viewportHeight; y += gridCellSize) {
                const alignedY = Math.round(y) + 0.5;
                overlayViewportCtx.moveTo(0, alignedY);
                overlayViewportCtx.lineTo(viewportWidth, alignedY);
            }

            overlayViewportCtx.stroke();
            overlayViewportCtx.restore();
        }

        drawViewport(overlayViewportCtx, overlayDocumentCanvas, false);
    }, [
        canvasRef,
        viewportCanvasRef,
        replacementCanvasRef,
        viewportReplacementCanvasRef,
        getViewportSize,
        resizeViewportCanvas,
        viewOffset.x,
        viewOffset.y,
        zoom,
        gridDisplayMode,
        pixelated,
        pixelSize
    ]);

    const renderViewportRef = useRef(renderViewport);

    useEffect(() => {
        renderViewportRef.current = renderViewport;
        setRenderViewport(renderViewport);
    }, [renderViewport, setRenderViewport]);

    const getCanvasPoint = useCallback((e: PointerEvent<HTMLCanvasElement>): Point | null => {
        const canvas = viewportCanvasRef.current;
        if(!canvas) {
            return null;
        }

        const rect = canvas.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        return {
            x: (localX - viewOffset.x) / zoom,
            y: (localY - viewOffset.y) / zoom
        };
    }, [viewportCanvasRef, viewOffset.x, viewOffset.y, zoom]);

    const maybeGrowCanvas = useCallback((candidateOffset: Point) => {
        const { width: viewportWidth, height: viewportHeight } = getViewportSize();
        if(viewportWidth <= 0 || viewportHeight <= 0) {
            return { width: canvasSize.width, height: canvasSize.height };
        }

        let nextWidth = canvasSize.width;
        let nextHeight = canvasSize.height;
        const scaledWidth = canvasSize.width * zoom;
        const scaledHeight = canvasSize.height * zoom;
        const minOffsetX = Math.min(0, viewportWidth - scaledWidth);
        const minOffsetY = Math.min(0, viewportHeight - scaledHeight);

        if(candidateOffset.x < minOffsetX) {
            nextWidth += CANVAS_GROWTH_STEP;
        }

        if(candidateOffset.y < minOffsetY) {
            nextHeight += CANVAS_GROWTH_STEP;
        }

        if(nextWidth !== canvasSize.width || nextHeight !== canvasSize.height) {
            setCanvasSize((prev) => ({
                width: Math.max(prev.width, nextWidth),
                height: Math.max(prev.height, nextHeight),
            }));
        }

        return { width: nextWidth, height: nextHeight };
    }, [canvasSize.height, canvasSize.width, getViewportSize, setCanvasSize, zoom]);

    useEffect(() => {
        ensureDocumentCanvases();

        const setupCanvas = () => {
            const canvas = canvasRef.current;
            const replacementCanvas = replacementCanvasRef.current;
            const parent = containerRef.current;

            if(!canvas || !replacementCanvas || !parent) {
                return;
            }

            const rect = parent.getBoundingClientRect();
            const viewportWidth = Math.max(1, Math.floor(rect.width));
            const viewportHeight = Math.max(1, Math.floor(rect.height));
            const worldWidth = Math.max(MIN_CANVAS_WIDTH, canvasSize.width, Math.ceil(viewportWidth * CANVAS_SCALE_FACTOR));
            const worldHeight = Math.max(MIN_CANVAS_HEIGHT, canvasSize.height, Math.ceil(viewportHeight * CANVAS_SCALE_FACTOR));

            const snapshot = lastSnapshot();

            canvas.width = worldWidth;
            canvas.height = worldHeight;

            replacementCanvas.width = worldWidth;
            replacementCanvas.height = worldHeight;

            const contextSettings: CanvasRenderingContext2DSettings = {
                alpha: true,
                willReadFrequently: true
            };

            const ctx = canvas.getContext("2d", contextSettings);
            if(ctx) {
                ctx.imageSmoothingEnabled = false;
                ctx.globalAlpha = 1;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                contextRef.current = ctx;
            }

            const replacementCtx = replacementCanvas.getContext("2d", contextSettings);
            if(replacementCtx) {
                replacementCtx.imageSmoothingEnabled = false;
                replacementContextRef.current = replacementCtx;
            }

            if(snapshot) {
                restoreSnapshot(snapshot);
            }

            if(gridDisplayMode !== "none") {
                drawGrid(worldWidth, worldHeight);
            } else {
                clearGrid(worldWidth, worldHeight);
            }

            setViewOffset((prev) => {
                const next = clampViewOffset(prev, viewportWidth, viewportHeight, worldWidth, worldHeight);
                return next.x === prev.x && next.y === prev.y ? prev : next;
            });

            renderViewportRef.current();
        };

        setupCanvas();

        const parent = containerRef.current;
        if(!parent || typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(() => {
            setupCanvas();
        });

        observer.observe(parent);

        return () => observer.disconnect();
    }, [
        ensureDocumentCanvases,
        canvasRef,
        replacementCanvasRef,
        containerRef,
        contextRef,
        replacementContextRef,
        drawGrid,
        clearGrid,
        restoreSnapshot,
        lastSnapshot,
        gridDisplayMode,
        clampViewOffset,
        setViewOffset,
        canvasSize.width,
        canvasSize.height,
        pixelated,
        pixelSize,
    ]);

    useEffect(() => {
        renderViewport();
    }, [renderViewport]);

    const undo = useCallback(() => {
        const { current: previousSnapshot } = undoSnapshot();
        if(previousSnapshot) {
            restoreSnapshot(previousSnapshot);
            renderViewport();
        }
    }, [renderViewport, restoreSnapshot, undoSnapshot]);

    const redo = useCallback(() => {
        const currentSnap = redoSnapshot();
        if(currentSnap) {
            restoreSnapshot(currentSnap);
            renderViewport();
        }
    }, [redoSnapshot, renderViewport, restoreSnapshot]);

    const handlePointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
        const canvas = viewportCanvasRef.current;
        if(!canvas) {
            return;
        }

        const shouldPanCanvas = e.button === 1 || (e.button === 0 && isPanModeActive);
        if(shouldPanCanvas) {
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
            return;
        }

        if(panSession.current?.pointerId === e.pointerId) {
            panSession.current = null;
            setCanvasPanning(false);
        }

        if(e.button !== 0) {
            return;
        }

        const ctx = contextRef.current;
        if(!ctx) {
            return;
        }

        canvas.setPointerCapture(e.pointerId);
        const point = getCanvasPoint(e);
        if(!point) {
            return;
        }

        const { x, y } = point;
        isDrawing.current = true;
        start.current = pixelated ? map({ x, y }, pixelSize) : { x, y };

        if(isSelectionActive) {
            startSelection({ x, y });
            return;
        }

        if(isFillActive) {
            const fillShape = new FillShape({
                point: start.current,
                strokeStyle: currentColor.current,
                isEraser: isEraserActive,
                pixelated: pixelated,
                pixelSize: pixelSize
            });

            fillShape.draw(ctx);
            currentShape.current = fillShape;
            renderViewport();
            return;
        }

        if(selectedShape === "freeform") {
            const form = new FreeForm([start.current], {
                strokeStyle: currentColor.current,
                lineWidth: thickness.current,
                isEraser: isEraserActive,
                filled: isFillActive,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });

            form.draw(ctx);
            currentShape.current = form;
            renderViewport();
        }
    }, [
        viewportCanvasRef,
        isPanModeActive,
        viewOffset,
        setCanvasPanning,
        contextRef,
        getCanvasPoint,
        pixelated,
        pixelSize,
        isSelectionActive,
        startSelection,
        isFillActive,
        currentColor,
        isEraserActive,
        selectedShape,
        thickness,
        lineAlgorithm,
        renderViewport
    ]);

    const rafId = useRef<number | null>(null);
    const pendingPoint = useRef<Point | null>(null);

    const handlePointerMove = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
        if(panSession.current?.pointerId === e.pointerId) {
            const shouldContinuePanning =
                panSession.current.mode === "tool"
                    ? isPanModeActive && (e.buttons & 1) === 1
                    : (e.buttons & 4) === 4;

            if(!shouldContinuePanning) {
                panSession.current = null;
                setCanvasPanning(false);
            } else {
                e.preventDefault();
                const candidateOffset = {
                    x: panSession.current.originOffset.x + (e.clientX - panSession.current.startClientX),
                    y: panSession.current.originOffset.y + (e.clientY - panSession.current.startClientY),
                };
                const nextSize = maybeGrowCanvas(candidateOffset);
                const nextOffset = clampViewOffset(candidateOffset, undefined, undefined, nextSize.width, nextSize.height);
                setViewOffset(nextOffset);
                return;
            }
        }

        if(!isDrawing.current) {
            return;
        }

        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        if(!ctx || !canvas) {
            return;
        }

        const currentPoint = getCanvasPoint(e);
        if(!currentPoint) {
            return;
        }

        const { x, y } = currentPoint;
        const point = pixelated ? map({ x, y }, pixelSize) : { x, y };

        if(isSelectionActive) {
            updateSelection({ x, y });
            return;
        }

        if(selectedShape === "freeform") {
            if(currentShape.current instanceof FreeForm) {
                currentShape.current.lineTo(point, ctx);
                renderViewport();
            }
            return;
        }

        pendingPoint.current = point;
        if(rafId.current === null) {
            rafId.current = requestAnimationFrame(() => {
                rafId.current = null;

                if(!pendingPoint.current) {
                    return;
                }

                const snapshot = lastSnapshot();
                if(snapshot) {
                    restoreSnapshot(snapshot);
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }

                const shape = generator({
                    start: start.current,
                    end: pendingPoint.current,
                    color: currentColor.current,
                    thickness: thickness.current,
                    kind: selectedShape,
                    pixelated: pixelated,
                    pixelSize: pixelSize,
                    lineAlgorithm: lineAlgorithm
                });

                currentShape.current = shape;
                shape.draw(ctx);
                renderViewport();
            });
        }
    }, [
        isPanModeActive,
        setCanvasPanning,
        maybeGrowCanvas,
        clampViewOffset,
        setViewOffset,
        contextRef,
        canvasRef,
        getCanvasPoint,
        pixelated,
        pixelSize,
        isSelectionActive,
        updateSelection,
        selectedShape,
        lastSnapshot,
        restoreSnapshot,
        currentColor,
        thickness,
        lineAlgorithm,
        renderViewport
    ]);

    const handlePointerUp = useCallback((e?: PointerEvent<HTMLCanvasElement>) => {
        if(panSession.current && (!e || panSession.current.pointerId === e.pointerId)) {
            setCanvasPanning(false);
            panSession.current = null;

            if(e?.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
            return;
        }

        if(isDrawing.current) {
            if(rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }

            if(isSelectionActive) {
                stopSelection();
            } else if(currentShape.current) {
                saveCurrentState(takeSnapshot());
                renderViewport();
            }

            isDrawing.current = false;
            currentShape.current = null;
            const ctx = contextRef.current;
            if(ctx) {
                ctx.beginPath();
                ctx.globalCompositeOperation = "source-over";
            }
        }

        if(e?.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    }, [contextRef, isSelectionActive, renderViewport, saveCurrentState, setCanvasPanning, stopSelection, takeSnapshot]);

    const saveSnapshot = useCallback(() => {
        saveCurrentState(takeSnapshot());
        renderViewport();
    }, [renderViewport, saveCurrentState, takeSnapshot]);

    const handleWheel = useCallback((e: WheelEvent<HTMLElement>) => {
        const { width: viewportWidth, height: viewportHeight } = getViewportSize();
        if(viewportWidth <= 0 || viewportHeight <= 0) {
            return;
        }

        e.preventDefault();

        const direction = e.deltaY < 0 ? 1 : -1;
        const minAllowedZoom = getMinAllowedZoom(viewportWidth, viewportHeight, canvasSize.width, canvasSize.height);
        const nextZoom = Math.min(MAX_ZOOM, Math.max(minAllowedZoom, Number((zoom + direction * ZOOM_STEP).toFixed(2))));
        if(nextZoom === zoom) {
            return;
        }

        const viewport = containerRef.current;
        if(!viewport) {
            return;
        }

        const rect = viewport.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        const worldX = (localX - viewOffset.x) / zoom;
        const worldY = (localY - viewOffset.y) / zoom;
        const nextOffset = clampViewOffset({
            x: localX - worldX * nextZoom,
            y: localY - worldY * nextZoom,
        }, viewportWidth, viewportHeight, canvasSize.width, canvasSize.height, nextZoom);

        setZoom(nextZoom);
        setViewOffset(nextOffset);
    }, [
        getViewportSize,
        getMinAllowedZoom,
        canvasSize.width,
        canvasSize.height,
        zoom,
        containerRef,
        viewOffset.x,
        viewOffset.y,
        clampViewOffset,
        setZoom,
        setViewOffset
    ]);

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleWheel,
        undo,
        redo,
        pasteSnapshot,
        copySnapshot,
        saveSnapshot
    };
};

export default useCanvas;
