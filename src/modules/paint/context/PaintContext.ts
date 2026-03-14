import { createContext, type Dispatch, type RefObject, type SetStateAction } from "react";
import type { Geometric } from "../types/Graphics";
import type { Point } from "../../../functions/geometry";

export type PaintContextType = {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    containerRef: RefObject<HTMLDivElement | null>;
    contextRef: RefObject<CanvasRenderingContext2D | null>;
    currentColor: RefObject<string>;
    thickness: RefObject<number>;
    
    pixelated: boolean;
    setPixelated: (value: boolean) => void;
    isEraserActive: boolean;
    setEraser: (value: boolean) => void;
    isFillActive: boolean;
    setFill: (value: boolean) => void;
    isSelectionActive: boolean;
    setSelectionActive: (value: boolean) => void;
    selectedShape: Geometric;
    setSelectedShape: (value: Geometric) => void;
    isPanModeActive: boolean;
    setPanModeActive: (value: boolean) => void;
    isCanvasPanning: boolean;
    setCanvasPanning: (value: boolean) => void;
    viewOffset: Point;
    setViewOffset: Dispatch<SetStateAction<Point>>;
    zoom: number;
    setZoom: (value: number) => void;
    canvasSize: { width: number; height: number };
    setCanvasSize: Dispatch<SetStateAction<{ width: number; height: number }>>;
    renderViewport: () => void;
    setRenderViewport: (callback: () => void) => void;
    
    saveSnapshot?: () => void;
};

export const PaintContext = createContext<PaintContextType | undefined>(undefined);

