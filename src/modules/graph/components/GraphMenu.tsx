import { useContext, useMemo } from 'react';
import { LuCircleDot, LuDownload, LuPanelRight, LuPlay, LuTrash2 } from 'react-icons/lu';
import GlassCard from '../../../components/GlassCard';
import WorkspaceToolButton from '../../../components/WorkspaceToolButton';
import { GraphContext } from '../context/GraphContext';
import { GraphSettingsContext } from '../context/GraphSettingsContext';
import type { GraphAlgorithm } from '../types/graph';

const GraphMenu = () => {
    const graph = useContext(GraphContext);
    const settings = useContext(GraphSettingsContext);

    const algorithmOptions = useMemo<Array<{ value: GraphAlgorithm; label: string }>>(() => {
        const isDirected = settings?.isDirected ?? false;

        return isDirected
            ? [
                { value: 'bfs', label: 'BFS' },
                { value: 'dfs', label: 'DFS' },
                { value: 'topological', label: 'Topologica' },
            ]
            : [
                { value: 'bfs', label: 'BFS' },
                { value: 'dfs', label: 'DFS' },
                { value: 'components', label: 'Componentes' },
            ];
    }, [settings?.isDirected]);

    if (!graph || !settings) return null;

    const {
        algorithm,
        clearGraph,
        runAlgorithm,
        setAlgorithm,
        activeTool,
        setActiveTool,
        vertices,
        edges,
        isStatusCardVisible,
        setIsStatusCardVisible,
        isPlayerVisible,
        setIsPlayerVisible,
        clearExecution,
        exportImage,
    } = graph;
    const { isDirected, setIsDirected } = settings;

    const initialPosition = () => ({ x: 24, y: 24 });

    return (
        <header>
            <GlassCard initial={initialPosition} className="workspace-menu-shell">
                <div className="relative flex w-150 flex-col gap-[var(--pm-gap)] p-[var(--pm-pad)]">
                    <div className="ui-menu-title-card flex min-w-0 flex-col gap-[var(--pm-gap)] rounded-xl px-[var(--pm-pad)] py-[var(--pm-btn-pad)] shadow-sm">
                        <div className="flex items-center justify-between gap-[var(--pm-gap)]">
                            <div>
                                <h1 className="ui-menu-title-heading text-[var(--pm-text-sm)] font-bold uppercase tracking-[0.24em]">
                                    Graph
                                </h1>
                                <p className="ui-panel-muted mt-1 text-[var(--pm-text-sm)]">
                                    {vertices.length} vertice(s) e {edges.length} aresta(s)
                                </p>
                            </div>
                            <span className="ui-menu-title-badge rounded-full px-[var(--pm-btn-pad)] py-0.5 text-[var(--pm-text-xs)] font-semibold uppercase tracking-[0.22em]">
                                {isDirected ? 'Digrafo' : 'Grafo'}
                            </span>
                        </div>
                        <div className="ui-menu-segmented flex items-center gap-1 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setIsDirected(false)}
                                className={`ui-menu-segment flex-1 cursor-pointer rounded-md px-[var(--pm-btn-pad)] py-1.5 text-[var(--pm-text-sm)] font-semibold transition duration-200 ${
                                    !isDirected ? 'ui-menu-segment-active shadow-sm' : ''
                                }`}
                            >
                                Grafo
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDirected(true)}
                                className={`ui-menu-segment flex-1 cursor-pointer rounded-md px-[var(--pm-btn-pad)] py-1.5 text-[var(--pm-text-sm)] font-semibold transition duration-200 ${
                                    isDirected ? 'ui-menu-segment-active shadow-sm' : ''
                                }`}
                            >
                                Digrafo
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-[var(--pm-gap)] md:grid-cols-4">
                        <WorkspaceToolButton
                            onClick={() => setActiveTool('vertex')}
                            stayActive
                            active={activeTool === 'vertex'}
                            ariaLabel="Ferramenta de vertice"
                            title="Ferramenta de vertice"
                            className="flex min-h-[3.25rem] w-full items-center justify-center gap-2 px-3"
                        >
                            <LuCircleDot className="workspace-icon" />
                            <span className="text-[var(--pm-text-sm)] font-semibold uppercase tracking-[0.18em]">
                                Vertice
                            </span>
                        </WorkspaceToolButton>
                        <label className="ui-input col-start-2 col-end-4 flex min-h-[3.25rem] w-full items-center gap-2 rounded-lg px-3 py-2">
                            <span className="ui-panel-muted shrink-0 text-[var(--pm-text-sm)] font-semibold uppercase tracking-[0.16em]">
                                Algoritmo
                            </span>
                            <select
                                value={algorithm}
                                onChange={(event) => setAlgorithm(event.target.value as GraphAlgorithm)}
                                className="w-full cursor-pointer bg-transparent text-[var(--pm-text-sm)] font-medium outline-none"
                            >
                                {algorithmOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <WorkspaceToolButton
                            onClick={() => { if (isPlayerVisible) { setIsPlayerVisible(false); clearExecution(); } else { runAlgorithm(); } }}
                            stayActive
                            active={isPlayerVisible}
                            className="flex min-h-[3.25rem] w-full items-center justify-center gap-2 px-3"
                            ariaLabel="Executar algoritmo"
                            title="Executar algoritmo"
                        >
                            <LuPlay className="workspace-icon" />
                            <span className="text-[var(--pm-text-sm)] font-semibold uppercase tracking-[0.18em]">
                                Rodar
                            </span>
                        </WorkspaceToolButton>
                        <WorkspaceToolButton
                            onClick={clearGraph}
                            className="flex min-h-[3.25rem] w-full items-center justify-center gap-2 px-3"
                            ariaLabel="Limpar grafo"
                            title="Limpar grafo"
                        >
                            <LuTrash2 className="workspace-icon" />
                            <span className="text-[var(--pm-text-sm)] font-semibold uppercase tracking-[0.18em]">
                                Limpar
                            </span>
                        </WorkspaceToolButton>
                        <WorkspaceToolButton
                            onClick={() => setIsStatusCardVisible(!isStatusCardVisible)}
                            stayActive
                            active={isStatusCardVisible}
                            className="flex min-h-[3.25rem] w-full items-center justify-center gap-2 px-3"
                            ariaLabel={isStatusCardVisible ? 'Ocultar status' : 'Mostrar status'}
                            title={isStatusCardVisible ? 'Ocultar status' : 'Mostrar status'}
                        >
                            <LuPanelRight className="workspace-icon" />
                            <span className="text-[var(--pm-text-sm)] font-semibold uppercase tracking-[0.18em]">
                                Status
                            </span>
                        </WorkspaceToolButton>
                        <WorkspaceToolButton
                            onClick={exportImage}
                            className="col-start-3 col-end-5 flex min-h-[3.25rem] w-full items-center justify-center gap-2 px-3"
                            ariaLabel="Exportar imagem"
                            title="Exportar imagem"
                        >
                            <LuDownload className="workspace-icon" />
                            <span className="text-[var(--pm-text-sm)] font-semibold uppercase tracking-[0.18em]">
                                Exportar
                            </span>
                        </WorkspaceToolButton>
                    </div>
                </div>
            </GlassCard>
        </header>
    );
};

export default GraphMenu;
