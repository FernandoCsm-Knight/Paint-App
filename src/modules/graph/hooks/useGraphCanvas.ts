import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { GraphContext } from '../context/GraphContext';
import { GraphSettingsContext } from '../context/GraphSettingsContext';
import { distanceBetween, type Point } from '../../../functions/geometry';
import type { GraphEdge, GraphVertex } from '../types/graph';

const resolveCssVariable = (styles: CSSStyleDeclaration, name: string, fallback: string) => {
    const value = styles.getPropertyValue(name).trim();
    return value || fallback;
};

const resolveTokenColor = (styles: CSSStyleDeclaration, token: string, fallback: string) => {
    if (!token.startsWith('--')) return token || fallback;
    return resolveCssVariable(styles, token, fallback);
};

const distanceToSegment = (point: Point, start: Point, end: Point) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (dx === 0 && dy === 0) return distanceBetween(point, start);

    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
    const projection = {
        x: start.x + t * dx,
        y: start.y + t * dy,
    };

    return distanceBetween(point, projection);
};

type DragState = {
    vertexId: string;
    startPointer: Point;
    moved: boolean;
};

const getPointer = (event: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
};

const getMousePoint = (event: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
};

const findVertexAtPoint = (vertices: GraphVertex[], point: Point) => {
    return vertices.find((vertex) => distanceBetween(vertex.position, point) <= vertex.radius) ?? null;
};

const findEdgeAtPoint = (edges: GraphEdge[], vertexMap: Map<string, GraphVertex>, point: Point) => {
    const threshold = 8;

    for (let index = edges.length - 1; index >= 0; index -= 1) {
        const edge = edges[index];
        const source = vertexMap.get(edge.source);
        const target = vertexMap.get(edge.target);
        if (!source || !target) continue;

        if (distanceToSegment(point, source.position, target.position) <= threshold) return edge;
    }

    return null;
};

const drawArrowHead = (context: CanvasRenderingContext2D, source: Point, target: Point, color: string) => {
    const angle = Math.atan2(target.y - source.y, target.x - source.x);
    const size = 11;

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(target.x, target.y);
    context.lineTo(
        target.x - size * Math.cos(angle - Math.PI / 6),
        target.y - size * Math.sin(angle - Math.PI / 6)
    );
    context.lineTo(
        target.x - size * Math.cos(angle + Math.PI / 6),
        target.y - size * Math.sin(angle + Math.PI / 6)
    );
    context.closePath();
    context.fill();
};

const drawEdge = (
    context: CanvasRenderingContext2D,
    edge: GraphEdge,
    source: GraphVertex,
    target: GraphVertex,
    color: string,
    emphasized: boolean
) => {
    const angle = Math.atan2(target.position.y - source.position.y, target.position.x - source.position.x);
    const start = {
        x: source.position.x + Math.cos(angle) * source.radius,
        y: source.position.y + Math.sin(angle) * source.radius,
    };
    const endOffset = target.radius + (edge.directed ? 10 : 0);
    const end = {
        x: target.position.x - Math.cos(angle) * endOffset,
        y: target.position.y - Math.sin(angle) * endOffset,
    };

    context.lineWidth = emphasized ? 3 : 2;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();

    if (edge.directed) drawArrowHead(context, start, end, color);
};

export const useGraphCanvas = () => {
    const graph = useContext(GraphContext);
    const settings = useContext(GraphSettingsContext);

    if (!graph || !settings) throw new Error('useGraphCanvas must be used inside Graph providers.');

    const {
        vertices,
        edges,
        selectedVertexId,
        selectedEdgeId,
        pendingEdgeStartId,
        lastRun,
        stepIndex,
        createVertex,
        selectVertex,
        connectVertex,
        selectEdge,
        moveVertex,
        clearSelection,
        cancelPendingEdge,
    } = graph;
    const { gridSize, showLabels } = settings;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const dragStateRef = useRef<DragState | null>(null);
    const [hoveredVertexId, setHoveredVertexId] = useState<string | null>(null);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

    const vertexMap = useMemo(() => new Map(vertices.map((vertex) => [vertex.id, vertex])), [vertices]);

    // Compute step-filtered display accents
    const displayAccents = useMemo(() => {
        if (!lastRun) return null;
        if (stepIndex === null) {
            return {
                vertexAccents: lastRun.vertexAccents,
                vertexBadges: lastRun.vertexBadges,
                edgeAccents: lastRun.edgeAccents,
            };
        }
        const vertexAccents: Record<string, string> = {};
        const vertexBadges: Record<string, string> = {};
        const edgeAccents: Record<string, string> = {};

        for (let i = 0; i <= stepIndex && i < lastRun.steps.length; i++) {
            const step = lastRun.steps[i];
            vertexAccents[step.vertexId] = step.color;
            vertexBadges[step.vertexId] = step.badge;
            if (step.edgeId && step.edgeColor) {
                edgeAccents[step.edgeId] = step.edgeColor;
            }
        }

        return { vertexAccents, vertexBadges, edgeAccents };
    }, [lastRun, stepIndex]);

    const drawScene = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            setViewportSize({ width: rect.width, height: rect.height });
        }

        const context = canvas.getContext('2d');
        if (!context) return;
        const themeStyles = getComputedStyle(container);
        const edgeBaseColor = resolveCssVariable(themeStyles, '--ui-menu-text', '#334155');
        const vertexFill = resolveCssVariable(themeStyles, '--ui-input-surface', '#ffffff');
        const vertexStroke = resolveCssVariable(themeStyles, '--ui-menu-segment-text', '#475569');
        const selectedStroke = resolveCssVariable(themeStyles, '--ui-menu-control-active-surface', '#f97316');
        const pendingStroke = resolveCssVariable(themeStyles, '--app-status-soon-text', '#dbeafe');
        const hoverStroke = resolveCssVariable(themeStyles, '--app-accent-text', '#fdba74');
        const componentGridColor = resolveCssVariable(themeStyles, '--ui-input-border', '#cbd5e1');
        const selectedEdgeColor = resolveCssVariable(themeStyles, '--ui-menu-control-active-surface', '#f97316');
        const edgeLabelFill = resolveCssVariable(themeStyles, '--ui-menu-card-surface', 'rgba(255, 247, 237, 0.92)');
        const edgeLabelBorder = resolveCssVariable(themeStyles, '--ui-input-border', '#cbd5e1');
        const edgeLabelText = resolveCssVariable(themeStyles, '--ui-menu-text', '#334155');
        const edgePendingColor = resolveCssVariable(themeStyles, '--ui-menu-control-active-surface', '#f97316');
        const vertexText = resolveCssVariable(themeStyles, '--ui-menu-text-strong', '#0f172a');
        const badgeText = resolveCssVariable(themeStyles, '--ui-menu-control-text-active', '#fff7ed');

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, rect.width, rect.height);

        context.save();
        context.strokeStyle = componentGridColor;
        context.lineWidth = 1;
        for (let x = 0; x <= rect.width; x += gridSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, rect.height);
            context.stroke();
        }
        for (let y = 0; y <= rect.height; y += gridSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(rect.width, y);
            context.stroke();
        }
        context.restore();

        edges.forEach((edge) => {
            const source = vertexMap.get(edge.source);
            const target = vertexMap.get(edge.target);
            if (!source || !target) return;

            const highlightColor = displayAccents?.edgeAccents[edge.id];
            const isSelected = selectedEdgeId === edge.id;
            drawEdge(
                context,
                edge,
                source,
                target,
                highlightColor ? resolveTokenColor(themeStyles, highlightColor, edgeBaseColor) : (isSelected ? selectedEdgeColor : edgeBaseColor),
                Boolean(highlightColor) || isSelected
            );

            if (showLabels) {
                const centerX = (source.position.x + target.position.x) / 2;
                const centerY = (source.position.y + target.position.y) / 2;
                context.save();
                context.fillStyle = edgeLabelFill;
                context.strokeStyle = edgeLabelBorder;
                context.lineWidth = 1;
                context.beginPath();
                context.roundRect(centerX - 28, centerY - 12, 56, 24, 8);
                context.fill();
                context.stroke();
                context.fillStyle = edgeLabelText;
                context.font = '600 11px Segoe UI';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(String(edge.label), centerX, centerY);
                context.restore();
            }
        });

        if (pendingEdgeStartId && previewPoint) {
            const source = vertexMap.get(pendingEdgeStartId);
            if (source) {
                context.save();
                context.setLineDash([8, 6]);
                context.lineWidth = 3;
                context.strokeStyle = edgePendingColor;
                context.beginPath();
                context.moveTo(source.position.x, source.position.y);
                context.lineTo(previewPoint.x, previewPoint.y);
                context.stroke();
                context.restore();
            }
        }

        vertices.forEach((vertex) => {
            const accent = displayAccents?.vertexAccents[vertex.id];
            const badge = displayAccents?.vertexBadges[vertex.id];
            const isSelected = selectedVertexId === vertex.id;
            const isPending = pendingEdgeStartId === vertex.id;
            const isHovered = hoveredVertexId === vertex.id;
            const accentColor = accent ? resolveTokenColor(themeStyles, accent, selectedStroke) : null;

            context.save();
            context.beginPath();
            context.fillStyle = accentColor ? `${accentColor}20` : vertexFill;
            context.strokeStyle = accentColor ?? (isSelected ? selectedStroke : isPending ? pendingStroke : isHovered ? hoverStroke : vertexStroke);
            context.lineWidth = isSelected || isPending ? 4 : accentColor ? 3 : 2;
            context.arc(vertex.position.x, vertex.position.y, vertex.radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();

            context.fillStyle = vertexText;
            context.font = '600 13px Segoe UI';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            if (showLabels) context.fillText(vertex.label, vertex.position.x, vertex.position.y);

            if (badge) {
                context.beginPath();
                context.fillStyle = accentColor ?? selectedStroke;
                context.arc(vertex.position.x + vertex.radius - 2, vertex.position.y - vertex.radius + 2, 10, 0, Math.PI * 2);
                context.fill();
                context.fillStyle = badgeText;
                context.font = '700 10px Segoe UI';
                context.fillText(badge, vertex.position.x + vertex.radius - 2, vertex.position.y - vertex.radius + 2);
            }
            context.restore();
        });
    }, [
        displayAccents,
        edges,
        gridSize,
        hoveredVertexId,
        pendingEdgeStartId,
        previewPoint,
        selectedVertexId,
        selectedEdgeId,
        showLabels,
        vertexMap,
        vertices,
    ]);

    useEffect(() => {
        drawScene();
    }, [drawScene]);

    useEffect(() => {
        const handleResize = () => drawScene();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [drawScene]);

    // Double-click: create vertex (left-click only)
    const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const point = getMousePoint(event, canvas);
        if (findVertexAtPoint(vertices, point)) return;
        createVertex(point);
    }, [createVertex, vertices]);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const point = getPointer(event, canvas);

        if (event.button === 2) {
            // Right-click: edge creation only
            const hitVertex = findVertexAtPoint(vertices, point);
            if (hitVertex) {
                connectVertex(hitVertex.id);
            } else {
                cancelPendingEdge();
            }
            return;
        }

        if (event.button === 0) {
            // Left-click: initiate drag if on a vertex
            const hitVertex = findVertexAtPoint(vertices, point);
            if (!hitVertex) return;

            dragStateRef.current = {
                vertexId: hitVertex.id,
                startPointer: point,
                moved: false,
            };
            canvas.setPointerCapture(event.pointerId);
            setHoveredVertexId(hitVertex.id);
        }
    }, [cancelPendingEdge, connectVertex, vertices]);

    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const point = getPointer(event, canvas);
        const dragState = dragStateRef.current;

        if (dragState) {
            const hasMoved = dragState.moved || distanceBetween(dragState.startPointer, point) > 4;
            dragState.moved = hasMoved;

            if (hasMoved) moveVertex(dragState.vertexId, point);
        }

        setPreviewPoint(point);
        setHoveredVertexId(findVertexAtPoint(vertices, point)?.id ?? null);
    }, [moveVertex, vertices]);

    const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (event.button !== 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const point = getPointer(event, canvas);
        const dragState = dragStateRef.current;

        if (dragState && !dragState.moved) {
            // Click without drag → select the vertex
            selectVertex(dragState.vertexId);
        } else if (!dragState) {
            // Click on empty or edge area → select edge or clear
            const hitVertex = findVertexAtPoint(vertices, point);
            if (!hitVertex) {
                const hitEdge = findEdgeAtPoint(edges, vertexMap, point);
                if (hitEdge) {
                    selectEdge(hitEdge.id);
                } else {
                    clearSelection();
                }
            }
        }

        dragStateRef.current = null;
        setPreviewPoint(null);
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }, [clearSelection, edges, selectEdge, selectVertex, vertexMap, vertices]);

    // Context menu: only prevent default (selection is handled in pointerDown)
    const handleContextMenu = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        event.preventDefault();
    }, []);

    return {
        canvasRef,
        containerRef,
        viewportSize,
        handleDoubleClick,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleContextMenu,
    };
};
