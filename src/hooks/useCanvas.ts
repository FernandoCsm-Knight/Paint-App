import { useEffect, useRef, useCallback, type PointerEvent, useContext } from "react";
import { PaintContext } from "../context/PaintContext";
import { Shape } from "../types/ShapeTypes";
import generator from "../types/ShapeGenerator";
import FreeForm from "../types/FreeForm";
import ClipboardImage from "../types/ClipboardImage";
import FloodFill from "../algorithms/FloodFill";
import { map, type Point } from "../types/Graphics";

const useCanvas = (pixelSize: number = 20) => {
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
        pixelated,
        selectedShape
    } = useContext(PaintContext)!;

    const isDrawing = useRef(false);
    const start = useRef<Point>({x: 0, y: 0});

    const drawnShapes = useRef<Shape[]>([]);
    const redoStackRef = useRef<Shape[]>([]);
    const currentShape = useRef<Shape | null>(null);

    const lastPixelatedMode = useRef<boolean>(pixelated);

    const pasteImage = (image: HTMLImageElement) => {
        drawnShapes.current.push(new ClipboardImage(image));
        redrawAllShapes();
    };

    const copyImage = (): Promise<Blob | null> => {
        const canvas = canvasRef.current;

        return new Promise((resolve) => {
            if(canvas) canvas.toBlob((blob) => resolve(blob));
            else resolve(null);
        });
    }

    const redrawAllShapes = useCallback(() => {
        const ctx = contextRef.current;
        if(!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        if(lastPixelatedMode.current !== pixelated) {
            drawnShapes.current = [];
            redoStackRef.current = [];
            lastPixelatedMode.current = pixelated;
        }

        drawnShapes.current.forEach(shape => shape.draw(ctx));
    }, [drawnShapes, pixelated, contextRef]);

    const redrawGrid = useCallback((width: number, height: number) => {
        const ctx = replacementContextRef.current;
        if(!ctx) return;

        const xCount = Math.floor(width / pixelSize);
        const yCount = Math.floor(height / pixelSize);

        ctx.clearRect(0, 0, width, height);
        
        ctx.globalCompositeOperation = 'destination-over';
        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 1;

        for(let i = 0; i <= xCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * pixelSize, 0);
            ctx.lineTo(i * pixelSize, height);
            ctx.stroke();
        }

        for(let i = 0; i <= yCount; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * pixelSize);
            ctx.lineTo(width, i * pixelSize);
            ctx.stroke();
        }
    }, [pixelated, pixelSize, replacementContextRef]);

    const clearGrid = useCallback((width: number, height: number) => {
        const ctx = replacementContextRef.current;
        if(!ctx) return;
        
        ctx.clearRect(0, 0, width, height);
        ctx.stroke();
    }, [replacementContextRef]);

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

                const ctx = canvas.getContext("2d");
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

                if(pixelated) redrawGrid(cssWidth, cssHeight);
                else clearGrid(cssWidth, cssHeight);

                redrawAllShapes();
            }
        };

        setupCanvas();
        const ro = new ResizeObserver(() => setupCanvas());
        if(containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [pixelated, pixelSize, thickness, currentColor, canvasRef, replacementCanvasRef, containerRef, contextRef, replacementContextRef, redrawAllShapes, redrawGrid]);

    const undo = useCallback(() => {
        if(drawnShapes.current.length === 0) return;

        const current = drawnShapes.current.pop();
        if(current) {
            redoStackRef.current.push(current);
            redrawAllShapes();
        }
    }, [redrawAllShapes]);

    const redo = useCallback(() => {
        if(redoStackRef.current.length === 0) return;

        const current = redoStackRef.current.pop();
        if(current) {
            drawnShapes.current.push(current);
            redrawAllShapes();
        }
    }, [redrawAllShapes]);

    const handlePointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        
        if(ctx && canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if(isFillActive && pixelated) {
                FloodFill.fill(ctx, map({ x: x, y: y }, pixelSize), currentColor.current, pixelSize, isEraserActive);
                return;
            }

            isDrawing.current = true;
            start.current = (pixelated) ? map({ x: x, y: y }, pixelSize) : { x: x, y: y };

            if(selectedShape.current === 'freeform') {
                const form = new FreeForm([start.current], {
                    strokeStyle: currentColor.current,
                    lineWidth: thickness.current,
                    isEraser: isEraserActive,
                    filled: isFillActive,
                    pixelated: pixelated,
                    pixelSize: pixelSize
                });

                currentShape.current = form;
            }
        }
    }, [start, selectedShape, isEraserActive, isFillActive, pixelated, pixelSize, currentColor, thickness, canvasRef, contextRef]);

    const handlePointerMove = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
        if(isDrawing.current) {
            const ctx = contextRef.current;
            const canvas = canvasRef.current;
            
            if(ctx && canvas) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const point = (pixelated) ? map({ x: x, y: y }, pixelSize) : { x: x, y: y };

                if(selectedShape.current === 'freeform') {
                    if(currentShape.current instanceof FreeForm) {
                        currentShape.current.lineTo(point, ctx);
                    }
                } else {
                    if(currentShape.current) redrawAllShapes();

                    const shape = generator({ 
                        start: start.current, 
                        end: point,
                        color: currentColor.current,
                        thickness: thickness.current,
                        kind: selectedShape.current,
                        pixelated: pixelated,
                        pixelSize: pixelSize
                    });

                    currentShape.current = shape;
                    shape.draw(ctx);
                } 
            }
        }
    }, [selectedShape, redrawAllShapes, pixelated, pixelSize, currentColor, thickness, canvasRef, contextRef]);

    const handlePointerUp = useCallback(() => {
        if(currentShape.current) {
            drawnShapes.current.push(currentShape.current);
            redoStackRef.current = [];
        }

        isDrawing.current = false;
        currentShape.current = null;
        const ctx = contextRef.current;
        if(ctx) {
            ctx.beginPath();
            ctx.globalCompositeOperation = 'source-over';
        }
    }, [contextRef]);

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        undo,
        redo,
        pasteImage,
        copyImage
    };
};

export default useCanvas;