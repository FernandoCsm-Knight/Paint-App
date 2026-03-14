import { useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { GraphContext, type GraphContextType } from '../GraphContext';
import { GraphSettingsContext } from '../GraphSettingsContext';
import { runGraphAlgorithm } from '../../algorithms/traversal';
import type { GraphEdge, GraphVertex } from '../../types/graph';
import type { Point } from '../../../../functions/geometry';

type GraphProviderProps = {
    children: ReactNode;
};

const GraphProvider = ({ children }: GraphProviderProps) => {
    const settings = useContext(GraphSettingsContext);
    if (!settings) throw new Error('GraphProvider must be used within GraphSettingsProvider.');

    const { gridSize, isDirected, snapToGrid, vertexRadius } = settings;
    const vertexCounterRef = useRef(0);
    const edgeCounterRef = useRef(0);

    const [vertices, setVertices] = useState<GraphVertex[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);
    const [activeTool, setActiveTool] = useState<'vertex'>('vertex');
    const [selectedVertexId, setSelectedVertexId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [pendingEdgeStartId, setPendingEdgeStartId] = useState<string | null>(null);
    const [isStatusCardVisible, setIsStatusCardVisible] = useState(false);
    const [isPlayerVisible, setIsPlayerVisible] = useState(false);
    const [algorithm, setAlgorithm] = useState<GraphContextType['algorithm']>('bfs');
    const [lastRun, setLastRun] = useState<GraphContextType['lastRun']>(null);
    const [stepIndex, setStepIndex] = useState<number | null>(null);
    const exportImageRef = useRef<() => void>(() => undefined);

    const clearExecution = useCallback(() => {
        setLastRun(null);
        setStepIndex(null);
    }, []);

    const snapPoint = useCallback((point: Point) => {
        if (!snapToGrid) return point;

        return {
            x: Math.round(point.x / gridSize) * gridSize,
            y: Math.round(point.y / gridSize) * gridSize,
        };
    }, [gridSize, snapToGrid]);

    const createVertex = useCallback((position: Point) => {
        const snapped = snapPoint(position);
        vertexCounterRef.current += 1;

        const vertex: GraphVertex = {
            id: `v-${vertexCounterRef.current}`,
            label: `V${vertexCounterRef.current}`,
            position: snapped,
            radius: vertexRadius,
        };

        setVertices((current) => [...current, vertex]);
        clearExecution();
    }, [clearExecution, snapPoint, vertexRadius]);

    const edgeExists = useCallback((sourceId: string, targetId: string) => {
        return edges.some((edge) => {
            if (edge.source === sourceId && edge.target === targetId) return true;
            return !edge.directed && edge.source === targetId && edge.target === sourceId;
        });
    }, [edges]);

    const selectVertex = useCallback((vertexId: string) => {
        setSelectedVertexId(vertexId);
        setSelectedEdgeId(null);
    }, []);

    const connectVertex = useCallback((vertexId: string) => {
        setPendingEdgeStartId((currentStart) => {
            if (!currentStart || currentStart === vertexId) return vertexId;
            if (edgeExists(currentStart, vertexId)) return vertexId;

            edgeCounterRef.current += 1;
            const edge: GraphEdge = {
                id: `e-${edgeCounterRef.current}`,
                source: currentStart,
                target: vertexId,
                directed: isDirected,
                label: 0,
            };

            setEdges((currentEdges) => [...currentEdges, edge]);
            clearExecution();
            return null;
        });
    }, [clearExecution, edgeExists, isDirected]);

    const selectEdge = useCallback((edgeId: string) => {
        setSelectedEdgeId(edgeId);
        setSelectedVertexId(null);
        setPendingEdgeStartId(null);
    }, []);

    const moveVertex = useCallback((vertexId: string, position: Point) => {
        const nextPosition = snapPoint(position);

        setVertices((current) => current.map((vertex) => {
            if (vertex.id !== vertexId) return vertex;
            return { ...vertex, position: nextPosition };
        }));
        clearExecution();
    }, [clearExecution, snapPoint]);

    const updateVertexLabel = useCallback((vertexId: string, label: string) => {
        setVertices((current) => current.map((vertex) => {
            if (vertex.id !== vertexId) return vertex;
            return { ...vertex, label };
        }));
        clearExecution();
    }, [clearExecution]);

    const updateEdgeLabel = useCallback((edgeId: string, label: number) => {
        setEdges((current) => current.map((edge) => {
            if (edge.id !== edgeId) return edge;
            return { ...edge, label };
        }));
        clearExecution();
    }, [clearExecution]);

    const cancelPendingEdge = useCallback(() => {
        setPendingEdgeStartId(null);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedVertexId(null);
        setSelectedEdgeId(null);
        setPendingEdgeStartId(null);
    }, []);

    const clearGraph = useCallback(() => {
        setVertices([]);
        setEdges([]);
        clearSelection();
        clearExecution();
    }, [clearExecution, clearSelection]);

    const removeSelectedElement = useCallback(() => {
        if (selectedVertexId) {
            setVertices((current) => current.filter((vertex) => vertex.id !== selectedVertexId));
            setEdges((current) => current.filter((edge) => edge.source !== selectedVertexId && edge.target !== selectedVertexId));
            clearSelection();
            clearExecution();
            return;
        }

        if (!selectedEdgeId) return;

        setEdges((current) => current.filter((edge) => edge.id !== selectedEdgeId));
        setSelectedEdgeId(null);
        clearExecution();
    }, [clearExecution, clearSelection, selectedEdgeId, selectedVertexId]);

    const runAlgorithm = useCallback(() => {
        const result = runGraphAlgorithm({
            algorithm,
            vertices,
            edges,
            startVertexId: selectedVertexId,
        });
        setLastRun(result);
        if (result.status !== 'error') {
            setStepIndex(0);
            setIsPlayerVisible(true);
        }
    }, [algorithm, edges, selectedVertexId, vertices]);

    const setExportImage = useCallback((callback: () => void) => {
        exportImageRef.current = callback;
    }, []);

    const exportImage = useCallback(() => {
        exportImageRef.current();
    }, []);

    const value = useMemo<GraphContextType>(() => ({
        vertices,
        edges,
        activeTool,
        setActiveTool,
        selectedVertexId,
        selectedEdgeId,
        pendingEdgeStartId,
        isStatusCardVisible,
        setIsStatusCardVisible,
        isPlayerVisible,
        setIsPlayerVisible,
        algorithm,
        setAlgorithm,
        lastRun,
        stepIndex,
        setStepIndex,
        createVertex,
        selectVertex,
        connectVertex,
        selectEdge,
        moveVertex,
        updateVertexLabel,
        updateEdgeLabel,
        cancelPendingEdge,
        clearSelection,
        clearGraph,
        removeSelectedElement,
        runAlgorithm,
        clearExecution,
        exportImage,
        setExportImage,
    }), [
        activeTool,
        algorithm,
        cancelPendingEdge,
        clearExecution,
        clearGraph,
        clearSelection,
        connectVertex,
        createVertex,
        edges,
        exportImage,
        isPlayerVisible,
        isStatusCardVisible,
        lastRun,
        moveVertex,
        pendingEdgeStartId,
        removeSelectedElement,
        runAlgorithm,
        selectEdge,
        selectVertex,
        selectedEdgeId,
        selectedVertexId,
        setExportImage,
        stepIndex,
        updateEdgeLabel,
        updateVertexLabel,
        vertices,
    ]);

    return (
        <GraphContext.Provider value={value}>
            {children}
        </GraphContext.Provider>
    );
};

export default GraphProvider;
