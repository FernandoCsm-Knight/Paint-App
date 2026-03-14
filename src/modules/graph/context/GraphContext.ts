import { createContext } from 'react';
import type { GraphAlgorithm, GraphAlgorithmResult, GraphEdge, GraphTool, GraphVertex } from '../types/graph';
import type { Point } from '../../../functions/geometry';

export type GraphContextType = {
    vertices: GraphVertex[];
    edges: GraphEdge[];
    activeTool: GraphTool;
    setActiveTool: (tool: GraphTool) => void;
    selectedVertexId: string | null;
    selectedEdgeId: string | null;
    pendingEdgeStartId: string | null;
    isStatusCardVisible: boolean;
    setIsStatusCardVisible: (value: boolean) => void;
    isPlayerVisible: boolean;
    setIsPlayerVisible: (value: boolean) => void;
    algorithm: GraphAlgorithm;
    setAlgorithm: (algorithm: GraphAlgorithm) => void;
    lastRun: GraphAlgorithmResult | null;
    stepIndex: number | null;
    setStepIndex: (index: number | null) => void;
    createVertex: (position: Point) => void;
    selectVertex: (vertexId: string) => void;
    connectVertex: (vertexId: string) => void;
    selectEdge: (edgeId: string) => void;
    moveVertex: (vertexId: string, position: Point) => void;
    updateVertexLabel: (vertexId: string, label: string) => void;
    updateEdgeLabel: (edgeId: string, label: number) => void;
    cancelPendingEdge: () => void;
    clearSelection: () => void;
    clearGraph: () => void;
    removeSelectedElement: () => void;
    runAlgorithm: () => void;
    clearExecution: () => void;
    exportImage: () => void;
    setExportImage: (callback: () => void) => void;
};

export const GraphContext = createContext<GraphContextType | undefined>(undefined);
