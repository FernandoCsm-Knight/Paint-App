import { useRef, useState } from "react";
import { PaintContext, type PaintContextType } from "../context/PaintContext";
import type { Geometric } from "../types/Graphics";

const DEFAULT_CANVAS_SIZE = {
    width: 2400,
    height: 1600,
};

type PaintProviderProps = {
    children: React.ReactNode;
};

const PaintProvider = ({ children }: PaintProviderProps) => {
    const [pixelated, setPixelated] = useState<boolean>(false);
    const [isEraserActive, setEraser] = useState<boolean>(false);
    const [isFillActive, setFill] = useState<boolean>(false);
    const [isSelectionActive, setSelectionActive] = useState<boolean>(false);
    const [selectedShape, setSelectedShape] = useState<Geometric>('freeform');
    const [isPanModeActive, setPanModeActive] = useState<boolean>(false);
    const [isCanvasPanning, setCanvasPanning] = useState<boolean>(false);
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);
    const renderViewportRef = useRef<() => void>(() => {});

    const paintContext: PaintContextType = {
        canvasRef: useRef<HTMLCanvasElement | null>(null),
        viewportCanvasRef: useRef<HTMLCanvasElement | null>(null),
        containerRef: useRef<HTMLDivElement | null>(null),
        contextRef: useRef<CanvasRenderingContext2D | null>(null),
        currentColor: useRef<string>('#000000'),
        thickness: useRef<number>(5),
        
        pixelated: pixelated,
        setPixelated: setPixelated,
        isEraserActive: isEraserActive,
        setEraser: setEraser,
        isFillActive: isFillActive,
        setFill: setFill,
        isSelectionActive: isSelectionActive,
        setSelectionActive: setSelectionActive,
        selectedShape: selectedShape,
        setSelectedShape: setSelectedShape,
        isPanModeActive: isPanModeActive,
        setPanModeActive: setPanModeActive,
        isCanvasPanning: isCanvasPanning,
        setCanvasPanning: setCanvasPanning,
        viewOffset: viewOffset,
        setViewOffset: setViewOffset,
        zoom: zoom,
        setZoom: setZoom,
        canvasSize: canvasSize,
        setCanvasSize: setCanvasSize,
        renderViewport: () => renderViewportRef.current(),
        setRenderViewport: (callback: () => void) => {
            renderViewportRef.current = callback;
        },
    };

    return (
        <PaintContext.Provider value={paintContext}>
            { children }
        </PaintContext.Provider>
    );
};

export default PaintProvider;
