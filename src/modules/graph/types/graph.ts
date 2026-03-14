import type { Point } from '../../../functions/geometry';

export type GraphVertex = {
    id: string;
    label: string;
    position: Point;
    radius: number;
};

export type GraphEdge = {
    id: string;
    source: string;
    target: string;
    directed: boolean;
    label: number;
};

export type GraphTool = 'vertex';

export type GraphAlgorithm = 'bfs' | 'dfs' | 'components' | 'topological';

export type AlgorithmStep = {
    vertexId: string;
    edgeId?: string;
    color: string;
    edgeColor?: string;
    badge: string;
};

export type GraphAlgorithmResult = {
    algorithm: GraphAlgorithm;
    status: 'success' | 'error' | 'info';
    message: string;
    order: string[];
    steps: AlgorithmStep[];
    vertexAccents: Record<string, string>;
    vertexBadges: Record<string, string>;
    edgeAccents: Record<string, string>;
};
