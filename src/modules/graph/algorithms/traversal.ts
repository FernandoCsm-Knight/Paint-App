import type { AlgorithmStep, GraphAlgorithm, GraphAlgorithmResult, GraphEdge, GraphVertex } from '../types/graph';

type Neighbor = {
    vertexId: string;
    edgeId: string;
};

const traversalColor = '--ui-menu-control-active-surface';
const traversalEdgeColor = '--app-accent-text';
const topoColor = '--app-status-available-text';
const topoEdgeColor = '--app-status-available-text';
const componentPalette = [
    '--ui-menu-control-active-surface',
    '--app-accent-text',
    '--app-status-available-text',
    '--app-status-soon-text',
    '--ui-menu-text-strong',
    '--ui-menu-text'
];

const buildAdjacency = (vertices: GraphVertex[], edges: GraphEdge[]) => {
    const adjacency = new Map<string, Neighbor[]>();

    vertices.forEach((vertex) => adjacency.set(vertex.id, []));

    edges.forEach((edge) => {
        adjacency.get(edge.source)?.push({ vertexId: edge.target, edgeId: edge.id });
        if (!edge.directed) adjacency.get(edge.target)?.push({ vertexId: edge.source, edgeId: edge.id });
    });

    return adjacency;
};

const createErrorResult = (algorithm: GraphAlgorithm, message: string): GraphAlgorithmResult => ({
    algorithm,
    status: 'error',
    message,
    order: [],
    steps: [],
    vertexAccents: {},
    vertexBadges: {},
    edgeAccents: {},
});

export const runGraphAlgorithm = ({
    algorithm,
    vertices,
    edges,
    startVertexId,
}: {
    algorithm: GraphAlgorithm;
    vertices: GraphVertex[];
    edges: GraphEdge[];
    startVertexId: string | null;
}): GraphAlgorithmResult => {
    if (!vertices.length) return createErrorResult(algorithm, 'Crie ao menos um vertice para executar um algoritmo.');

    const adjacency = buildAdjacency(vertices, edges);

    // ── BFS ────────────────────────────────────────────────────────────────────
    if (algorithm === 'bfs') {
        if (!startVertexId) return createErrorResult(algorithm, 'Selecione um vertice inicial antes de executar a busca.');

        type QueueItem = { vertexId: string; viaEdgeId?: string };
        const visited = new Set<string>();
        const order: string[] = [];
        const steps: AlgorithmStep[] = [];
        const edgeAccents: Record<string, string> = {};

        const queue: QueueItem[] = [{ vertexId: startVertexId }];
        visited.add(startVertexId);

        while (queue.length) {
            const item = queue.shift()!;
            order.push(item.vertexId);

            steps.push({
                vertexId: item.vertexId,
                edgeId: item.viaEdgeId,
                color: traversalColor,
                edgeColor: item.viaEdgeId ? traversalEdgeColor : undefined,
                badge: String(order.length),
            });

            for (const neighbor of adjacency.get(item.vertexId) ?? []) {
                if (visited.has(neighbor.vertexId)) continue;
                visited.add(neighbor.vertexId);
                queue.push({ vertexId: neighbor.vertexId, viaEdgeId: neighbor.edgeId });
                edgeAccents[neighbor.edgeId] = traversalEdgeColor;
            }
        }

        const vertexAccents = Object.fromEntries(order.map((id) => [id, traversalColor]));
        const vertexBadges = Object.fromEntries(order.map((id, i) => [id, String(i + 1)]));

        return {
            algorithm: 'bfs',
            status: 'success',
            message: `BFS concluido com ${order.length} vertice(s) visitado(s).`,
            order,
            steps,
            vertexAccents,
            vertexBadges,
            edgeAccents,
        };
    }

    // ── DFS ────────────────────────────────────────────────────────────────────
    if (algorithm === 'dfs') {
        if (!startVertexId) return createErrorResult(algorithm, 'Selecione um vertice inicial antes de executar a busca.');

        const visited = new Set<string>();
        const order: string[] = [];
        const steps: AlgorithmStep[] = [];
        const edgeAccents: Record<string, string> = {};

        const stack: Array<{ vertexId: string; viaEdgeId?: string }> = [{ vertexId: startVertexId }];

        while (stack.length) {
            const current = stack.pop()!;
            if (visited.has(current.vertexId)) continue;

            visited.add(current.vertexId);
            order.push(current.vertexId);
            if (current.viaEdgeId) edgeAccents[current.viaEdgeId] = traversalEdgeColor;

            steps.push({
                vertexId: current.vertexId,
                edgeId: current.viaEdgeId,
                color: traversalColor,
                edgeColor: current.viaEdgeId ? traversalEdgeColor : undefined,
                badge: String(order.length),
            });

            const neighbors = [...(adjacency.get(current.vertexId) ?? [])].reverse();
            neighbors.forEach((neighbor) => {
                if (!visited.has(neighbor.vertexId)) {
                    stack.push({ vertexId: neighbor.vertexId, viaEdgeId: neighbor.edgeId });
                }
            });
        }

        const vertexAccents = Object.fromEntries(order.map((id) => [id, traversalColor]));
        const vertexBadges = Object.fromEntries(order.map((id, i) => [id, String(i + 1)]));

        return {
            algorithm: 'dfs',
            status: 'success',
            message: `DFS concluido com ${order.length} vertice(s) visitado(s).`,
            order,
            steps,
            vertexAccents,
            vertexBadges,
            edgeAccents,
        };
    }

    // ── Components ─────────────────────────────────────────────────────────────
    if (algorithm === 'components') {
        const visited = new Set<string>();
        const vertexAccents: Record<string, string> = {};
        const vertexBadges: Record<string, string> = {};
        const order: string[] = [];
        const steps: AlgorithmStep[] = [];
        let componentIndex = 0;

        vertices.forEach((vertex) => {
            if (visited.has(vertex.id)) return;

            componentIndex += 1;
            const color = componentPalette[(componentIndex - 1) % componentPalette.length];
            const queue = [vertex.id];
            visited.add(vertex.id);

            while (queue.length) {
                const current = queue.shift()!;
                order.push(current);
                vertexAccents[current] = color;
                vertexBadges[current] = `C${componentIndex}`;
                steps.push({ vertexId: current, color, badge: `C${componentIndex}` });

                for (const neighbor of adjacency.get(current) ?? []) {
                    if (visited.has(neighbor.vertexId)) continue;
                    visited.add(neighbor.vertexId);
                    queue.push(neighbor.vertexId);
                }
            }
        });

        return {
            algorithm: 'components',
            status: 'success',
            message: `${componentIndex} componente(s) detectado(s) no grafo atual.`,
            order,
            steps,
            vertexAccents,
            vertexBadges,
            edgeAccents: {},
        };
    }

    // ── Topological ────────────────────────────────────────────────────────────
    if (edges.some((edge) => !edge.directed)) {
        return createErrorResult('topological', 'A ordenacao topologica exige apenas arestas direcionadas.');
    }

    const indegree = new Map<string, number>(vertices.map((vertex) => [vertex.id, 0]));

    edges.forEach((edge) => {
        indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1);
    });

    const queue = vertices
        .filter((vertex) => (indegree.get(vertex.id) ?? 0) === 0)
        .map((vertex) => vertex.id);
    const order: string[] = [];
    const steps: AlgorithmStep[] = [];

    while (queue.length) {
        const current = queue.shift()!;
        order.push(current);
        steps.push({ vertexId: current, color: topoColor, badge: String(order.length) });

        for (const neighbor of adjacency.get(current) ?? []) {
            const nextIndegree = (indegree.get(neighbor.vertexId) ?? 0) - 1;
            indegree.set(neighbor.vertexId, nextIndegree);
            if (nextIndegree === 0) queue.push(neighbor.vertexId);
        }
    }

    if (order.length !== vertices.length) {
        return createErrorResult('topological', 'O grafo direcionado possui ciclo e nao admite ordenacao topologica.');
    }

    const vertexAccents = Object.fromEntries(order.map((id) => [id, topoColor]));
    const vertexBadges = Object.fromEntries(order.map((id, i) => [id, String(i + 1)]));
    const edgeAccents = Object.fromEntries(edges.map((e) => [e.id, topoEdgeColor]));

    return {
        algorithm: 'topological',
        status: 'success',
        message: 'Ordenacao topologica concluida.',
        order,
        steps,
        vertexAccents,
        vertexBadges,
        edgeAccents,
    };
};
