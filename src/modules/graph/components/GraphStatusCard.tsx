import { useContext } from 'react';
import GlassCard from '../../../components/GlassCard';
import { GraphContext } from '../context/GraphContext';
import { GraphSettingsContext } from '../context/GraphSettingsContext';

const GraphStatusCard = () => {
    const graph = useContext(GraphContext);
    const settings = useContext(GraphSettingsContext);

    if (!graph || !settings) return null;

    const {
        lastRun,
        selectedVertexId,
        selectedEdgeId,
        pendingEdgeStartId,
        vertices,
        edges,
        updateVertexLabel,
        updateEdgeLabel
    } = graph;
    const { showLabels, setShowLabels, snapToGrid, setSnapToGrid } = settings;
    const selectedVertex = vertices.find((vertex) => vertex.id === selectedVertexId) ?? null;
    const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId) ?? null;

    const initialPosition = () => ({
        x: Math.max(window.innerWidth - 384, 16),
        y: 88,
    });

    return (
        <GlassCard initial={initialPosition}>
            <div className="flex flex-col w-100 min-w-90 gap-4 p-4">
                <div>
                    <h3 className="ui-panel-title-on-dark font-semibold uppercase tracking-[0.24em]">Status</h3>
                    <p className="ui-panel-muted-on-dark mt-1 leading-6">
                        Duplo clique cria vertice. Clique em um vertice e depois em outro para criar a aresta. Clique direito cancela a aresta pendente.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="ui-value-chip rounded-lg px-3 py-2">
                        <span className="ui-panel-muted block uppercase tracking-[0.18em]">Selecionado</span>
                        <span className="ui-panel-title font-semibold">{selectedVertexId ?? selectedEdgeId ?? 'Nenhum'}</span>
                    </div>
                    <div className="ui-value-chip rounded-lg px-3 py-2">
                        <span className="ui-panel-muted block uppercase tracking-[0.18em]">Origem</span>
                        <span className="ui-panel-title font-semibold">{pendingEdgeStartId ?? 'Nenhuma'}</span>
                    </div>
                    <div className="ui-value-chip rounded-lg px-3 py-2">
                        <span className="ui-panel-muted block uppercase tracking-[0.18em]">Vertices</span>
                        <span className="ui-panel-title font-semibold">{vertices.length}</span>
                    </div>
                    <div className="ui-value-chip rounded-lg px-3 py-2">
                        <span className="ui-panel-muted block uppercase tracking-[0.18em]">Arestas</span>
                        <span className="ui-panel-title font-semibold">{edges.length}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="ui-input flex items-center justify-between gap-3 rounded-lg px-3 py-2">
                        <span className="ui-panel-text font-medium">Mostrar labels</span>
                        <input
                            type="checkbox"
                            checked={showLabels}
                            onChange={(event) => setShowLabels(event.target.checked)}
                            className="h-4 w-4"
                            style={{ accentColor: 'var(--ui-menu-control-active-surface)' }}
                        />
                    </label>
                    <label className="ui-input flex items-center justify-between gap-3 rounded-lg px-3 py-2">
                        <span className="ui-panel-text font-medium">Snap no grid</span>
                        <input
                            type="checkbox"
                            checked={snapToGrid}
                            onChange={(event) => setSnapToGrid(event.target.checked)}
                            className="h-4 w-4"
                            style={{ accentColor: 'var(--ui-menu-control-active-surface)' }}
                        />
                    </label>
                </div>

                {selectedVertex ? (
                    <div className="ui-value-chip rounded-xl px-3 py-3">
                        <p className="ui-panel-title font-semibold uppercase tracking-[0.22em]">Vertice selecionado</p>
                        <p className="ui-panel-muted mt-1">ID {selectedVertex.id}</p>
                        <label className="mt-3 flex flex-col gap-2">
                            <span className="ui-panel-text font-medium">Label do vertice</span>
                            <input
                                type="text"
                                value={selectedVertex.label}
                                onChange={(event) => updateVertexLabel(selectedVertex.id, event.target.value)}
                                className="ui-input rounded-lg px-3 py-2"
                                placeholder="Ex.: A"
                            />
                        </label>
                    </div>
                ) : null}

                {selectedEdge ? (
                    <div className="ui-value-chip rounded-xl px-3 py-3">
                        <p className="ui-panel-title font-semibold uppercase tracking-[0.22em]">Aresta selecionada</p>
                        <p className="ui-panel-muted mt-1">
                            {selectedEdge.source} {selectedEdge.directed ? '->' : '--'} {selectedEdge.target}
                        </p>
                        <label className="mt-3 flex flex-col gap-2">
                            <span className="ui-panel-text font-medium">Label da aresta</span>
                            <input
                                type="number"
                                value={selectedEdge.label}
                                onChange={(event) => updateEdgeLabel(selectedEdge.id, parseFloat(event.target.value) || 0)}
                                className="ui-input rounded-lg px-3 py-2"
                                placeholder="Ex.: 5.0"
                            />
                        </label>
                    </div>
                ) : null}

                <div className="ui-menu-shell rounded-xl px-3 py-3">
                    <h3 className="ui-panel-title-on-dark font-semibold uppercase tracking-[0.22em]">Ultima execucao</h3>
                    {lastRun ? (
                        <>
                            <p className="mt-2 leading-6">{lastRun.message}</p>
                            {lastRun.order.length ? (
                                <p className="ui-panel-muted-on-dark mt-2">
                                    Ordem: {lastRun.order.join(' -> ')}
                                </p>
                            ) : null}
                        </>
                    ) : (
                        <p className="ui-panel-muted-on-dark mt-2 leading-6">
                            Execute um algoritmo para destacar o grafo no canvas.
                        </p>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

export default GraphStatusCard;
