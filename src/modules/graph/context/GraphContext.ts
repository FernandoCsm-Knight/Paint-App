import { createContext, useContext } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { GraphState, GraphAction } from '../types/graph';
import type { Point } from '../../../functions/geometry';

type WorkspaceSize = {
    width: number;
    height: number;
};

export interface GraphContextValue {
    state: GraphState;
    dispatch: Dispatch<GraphAction>;
    containerRef: RefObject<HTMLElement | null>;
    viewOffset: Point;
    setViewOffset: Dispatch<SetStateAction<Point>>;
    zoom: number;
    setZoom: (value: number) => void;
    worldSize: WorkspaceSize;
    setWorldSize: Dispatch<SetStateAction<WorkspaceSize>>;
    isPanModeActive: boolean;
    setPanModeActive: (value: boolean) => void;
    isCanvasPanning: boolean;
    setCanvasPanning: (value: boolean) => void;
}

export const GraphContext = createContext<GraphContextValue | null>(null);

export function useGraphContext(): GraphContextValue {
    const ctx = useContext(GraphContext);
    if (!ctx) throw new Error('useGraphContext must be used within GraphProvider');
    return ctx;
}
