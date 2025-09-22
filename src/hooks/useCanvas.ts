import { useEffect, useRef, useCallback, type PointerEvent, useContext } from "react";
import { PaintContext } from "../context/PaintContext";
import { Shape } from "../types/ShapeTypes";
import generator from "../types/ShapeGenerator";
import FreeForm from "../types/FreeForm";
import FloodFillShape from "../shapes/FloodFillShape";
import { map, type Point } from "../types/Graphics";
import useImage from "./useImage";
import useSelection from "./useSelection";
import type ClipboardImage from "../types/ClipboardImage";

const useCanvas = () => {
    const { 
        canvasRef, 
        replacementCanvasRef,
        containerRef, 
        contextRef, 
        replacementContextRef,
        thickness, 
        currentColor, 
        isEraserActive, 
        isFillActive,
        isSelectionActive,
        pixelated,
        selectedShape,
        settings
    } = useContext(PaintContext)!;

    const isDrawing = useRef(false);
    const start = useRef<Point>({x: 0, y: 0});

    const drawnShapes = useRef<Shape[]>([]);
    const redoStackRef = useRef<Shape[]>([]);
    const currentShape = useRef<Shape | null>(null);

    const canvasSnapshots = useRef<ImageData[]>([]);
    const redoSnapshotsRef = useRef<ImageData[]>([]);
    const currentSnapshot = useRef<ImageData | null>(null);

    const lastPixelatedMode = useRef<boolean>(pixelated);

    const saveCurrentState = useCallback((clipboardImage: ClipboardImage | null, snapshot: ImageData | null) => {
        if(clipboardImage) drawnShapes.current.push(clipboardImage);

        if(snapshot) {
            canvasSnapshots.current.push(snapshot);
            currentSnapshot.current = snapshot;
            redoSnapshotsRef.current = [];
        }
    }, [drawnShapes, canvasSnapshots, currentSnapshot, redoSnapshotsRef]);

    const {
        takeSnapshot,
        restoreSnapshot,
        copySnapshot,
        pasteSnapshot
    } = useImage(saveCurrentState);

    const redrawAllShapes = useCallback(() => {
        const ctx = contextRef.current;
        if(!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        if(lastPixelatedMode.current !== pixelated) {
            drawnShapes.current = [];
            redoStackRef.current = [];
            canvasSnapshots.current = [];
            redoSnapshotsRef.current = [];
            lastPixelatedMode.current = pixelated;
        }

        drawnShapes.current.forEach(shape => shape.draw(ctx));
        
        if(canvasSnapshots.current.length === 0) {
            const initialSnapshot = takeSnapshot();
            if(initialSnapshot) {
                canvasSnapshots.current.push(initialSnapshot);
                currentSnapshot.current = initialSnapshot;
            }
        }
    }, [drawnShapes, pixelated, contextRef, takeSnapshot]);

    const redrawGrid = useCallback((width: number, height: number) => {
        const ctx = replacementContextRef.current;
        if(!ctx) return;

        const xCount = Math.floor(width / settings.pixelSize);
        const yCount = Math.floor(height / settings.pixelSize);

        ctx.clearRect(0, 0, width, height);
        
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 1;

        ctx.beginPath();
        for(let i = 0; i <= xCount; i++) {
            const x = i * settings.pixelSize + 0.5;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        ctx.stroke();

        ctx.beginPath();
        for(let i = 0; i <= yCount; i++) {
            const y = i * settings.pixelSize + 0.5;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();
        ctx.restore();
    }, [settings, replacementContextRef]);

    const clearGrid = useCallback((width: number, height: number) => {
        const ctx = replacementContextRef.current;
        if(!ctx) return;
        
        ctx.clearRect(0, 0, width, height);
    }, [replacementContextRef]);

    const {
        startSelection,
        updateSelection,
        stopSelection
    } = useSelection();

    useEffect(() => {
        const setupCanvas = () => {
            const canvas = canvasRef.current;
            const replacementCanvas = replacementCanvasRef.current;
            const parent = containerRef.current;

            if(canvas && replacementCanvas && parent) {
                const rect = parent.getBoundingClientRect();
                const cssWidth = Math.floor(rect.width);
                const cssHeight = Math.floor(rect.height);

                canvas.style.width = cssWidth + "px";
                canvas.style.height = cssHeight + "px";
                canvas.width = cssWidth;
                canvas.height = cssHeight;

                replacementCanvas.style.width = cssWidth + "px";
                replacementCanvas.style.height = cssHeight + "px";
                replacementCanvas.width = cssWidth;
                replacementCanvas.height = cssHeight;

                const contextSettings: CanvasRenderingContext2DSettings = {
                    alpha: true,
                    willReadFrequently: true
                };

                const ctx = canvas.getContext("2d", contextSettings);
                if(ctx) {
                    ctx.imageSmoothingEnabled = false;
                    ctx.globalAlpha = 1;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    contextRef.current = ctx;
                }

                const replacementCtx = replacementCanvas.getContext("2d");
                if(replacementCtx) {
                    replacementCtx.imageSmoothingEnabled = false;
                    replacementContextRef.current = replacementCtx;
                }

                if(pixelated && settings.gridDisplayMode !== 'none') redrawGrid(cssWidth, cssHeight);
                else clearGrid(cssWidth, cssHeight);
                
                redrawAllShapes();
            }
        };

        setupCanvas();
        const ro = new ResizeObserver(() => setupCanvas());
        if(containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [pixelated, settings, thickness, currentColor, canvasRef, replacementCanvasRef, containerRef, contextRef, replacementContextRef, redrawAllShapes, redrawGrid, clearGrid]);

    const undo = useCallback(() => {
        if(canvasSnapshots.current.length <= 1) return;

        const currentSnap = canvasSnapshots.current.pop();
        if(currentSnap) redoSnapshotsRef.current.push(currentSnap);
        
        const removedShape = drawnShapes.current.pop();
        if(removedShape) redoStackRef.current.push(removedShape);

        const previousSnapshot = canvasSnapshots.current[canvasSnapshots.current.length - 1];
        if(previousSnapshot) {
            restoreSnapshot(previousSnapshot);
            currentSnapshot.current = previousSnapshot;
        }
    }, [restoreSnapshot]);

    const redo = useCallback(() => {
        if(redoSnapshotsRef.current.length === 0) return;

        const redoSnapshot = redoSnapshotsRef.current.pop();
        if(redoSnapshot) {
            canvasSnapshots.current.push(redoSnapshot);
            restoreSnapshot(redoSnapshot);
            currentSnapshot.current = redoSnapshot;
        }

        const redoShape = redoStackRef.current.pop();
        if(redoShape) drawnShapes.current.push(redoShape);
    }, [restoreSnapshot]);

    const handlePointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
        if(e.button !== 0) return;

        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        
        if(ctx && canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            isDrawing.current = true;
            start.current = (pixelated) ? map({ x: x, y: y }, settings.pixelSize) : { x: x, y: y };

            if(isSelectionActive) {
                startSelection({ x, y });
                return;
            }

            if(isFillActive) {
                const floodFillShape = new FloodFillShape({
                    point: start.current,
                    strokeStyle: currentColor.current,
                    isEraser: isEraserActive,
                    pixelated: pixelated,
                    pixelSize: settings.pixelSize
                });
                
                floodFillShape.draw(ctx);
                currentShape.current = floodFillShape;
            } else {
                if(selectedShape === 'freeform') {
                    const form = new FreeForm([start.current], {
                        strokeStyle: currentColor.current,
                        lineWidth: thickness.current,
                        isEraser: isEraserActive,
                        filled: isFillActive,
                        pixelated: pixelated,
                        pixelSize: settings.pixelSize,
                        lineAlgorithm: settings.lineAlgorithm
                    });
                    
                    form.draw(ctx);
                    currentShape.current = form;
                }
            }

        }
    }, [start, selectedShape, isEraserActive, isFillActive, isSelectionActive, pixelated, settings, currentColor, thickness, canvasRef, contextRef, startSelection]);

    const rafId = useRef<number | null>(null);
    const pendingPoint = useRef<Point | null>(null);

    const handlePointerMove = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
        if(!isDrawing.current) return;

        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        if(!ctx || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const point = (pixelated) ? map({ x, y }, settings.pixelSize) : { x, y };

        if(isSelectionActive) {
            updateSelection({ x, y });
        } else if(selectedShape === 'freeform') {
            if(currentShape.current instanceof FreeForm) {
                currentShape.current.lineTo(point, ctx);
            }
        } else {
            pendingPoint.current = point;
            if(rafId.current === null) {
                rafId.current = requestAnimationFrame(() => {
                    rafId.current = null;
    
                    if(pendingPoint.current) {
                        if(currentSnapshot.current) restoreSnapshot(currentSnapshot.current);
        
                        const shape = generator({
                            start: start.current,
                            end: pendingPoint.current,
                            color: currentColor.current,
                            thickness: thickness.current,
                            kind: selectedShape,
                            pixelated: pixelated,
                            pixelSize: settings.pixelSize,
                            lineAlgorithm: settings.lineAlgorithm
                        });
        
                        currentShape.current = shape;
                        shape.draw(ctx);
                    }
                });
            }   
        }
    }, [selectedShape, restoreSnapshot, isSelectionActive, pixelated, settings, currentColor, thickness, canvasRef, contextRef, updateSelection]);

    const handlePointerUp = useCallback(() => {
        if(isDrawing.current) {
            if(rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
            
            if(isSelectionActive) {
                stopSelection();
            } else if(currentShape.current) {
                drawnShapes.current.push(currentShape.current);
                redoStackRef.current = [];
                saveCurrentState(null, takeSnapshot());
            }
    
            isDrawing.current = false;
            currentShape.current = null;
            const ctx = contextRef.current;
            if(ctx) {
                ctx.beginPath();
                ctx.globalCompositeOperation = 'source-over';
            }
        }
    }, [contextRef, saveCurrentState, isSelectionActive, stopSelection, takeSnapshot]);

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        undo,
        redo,
        pasteSnapshot,
        copySnapshot
    };
};

export default useCanvas;