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
                <div className="relative  flex flex-col gap-[var(--pm-gap)] p-[var(--pm-pad)]">
                    <div className="ui-menu-title-card flex min-w-0 flex-col gap-[var(--pm-gap)] rounded-xl px-[var(--pm-pad)] py-[var(--pm-btn-pad)] shadow-sm">
                        <div className="flex items-center justify-between gap-[var(--pm-gap)]">
                            <div>
                                <h1 className="text-sm sm:text-base md:text-lg ui-menu-title-heading font-bold uppercase tracking-[0.24em]">
                                    Graph
                                </h1>
                                <p className="ui-panel-muted mt-1 text-xs sm:text-sm">
                                    {vertices.length} vertice(s) e {edges.length} aresta(s)
                                </p>
                            </div>

                            <span className="ui-menu-title-badge rounded-full px-[var(--pm-btn-pad)] py-0.5 text-xs font-semibold uppercase tracking-[0.22em] sm:text-sm">
                                {isDirected ? 'Digrafo' : 'Grafo'}
                            </span>
                        </div>

                        <div className="ui-menu-segmented flex items-center gap-1 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setIsDirected(false)}
                                className={`ui-menu-segment flex-1 rounded-md px-[var(--pm-btn-pad)] py-1.5 text-xs font-semibold transition duration-200 sm:text-sm ${
                                    !isDirected ? 'ui-menu-segment-active shadow-sm' : ''
                                }`}
                            >
                                Grafo
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsDirected(true)}
                                className={`ui-menu-segment flex-1 rounded-md px-[var(--pm-btn-pad)] py-1.5 text-xs font-semibold transition duration-200 sm:text-sm ${
                                    isDirected ? 'ui-menu-segment-active shadow-sm' : ''
                                }`}
                            >
                                Digrafo
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[var(--pm-gap)] md:grid-cols-4">
                        <WorkspaceToolButton
                            onClick={() => setActiveTool('vertex')}
                            stayActive
                            active={activeTool === 'vertex'}
                            ariaLabel="Ferramenta de vertice"
                            title="Ferramenta de vertice"
                            className="flex items-center justify-center gap-2 px-3"
                        >
                            <LuCircleDot className="workspace-icon" />
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm">
                                Vertice
                            </span>
                        </WorkspaceToolButton>

                        <WorkspaceToolButton
                            onClick={clearGraph}
                            ariaLabel="Limpar grafo"
                            title="Limpar grafo"
                            className="flex items-center justify-center gap-2 px-3"
                        >
                            <LuTrash2 className="workspace-icon" />
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm">
                                Limpar
                            </span>
                        </WorkspaceToolButton>

                        <label className="ui-input col-span-2 flex w-full items-center gap-2 rounded-lg px-3 py-2">
                            <span className="ui-panel-muted text-xs font-semibold uppercase tracking-[0.16em] sm:text-sm">
                                Algoritmo
                            </span>

                            <select
                                value={algorithm}
                                onChange={(event) => setAlgorithm(event.target.value as GraphAlgorithm)}
                                className="w-full bg-transparent text-xs font-medium outline-none sm:text-sm"
                            >
                                {algorithmOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <WorkspaceToolButton
                            onClick={() => {
                                if (isPlayerVisible) {
                                    setIsPlayerVisible(false);
                                    clearExecution();
                                } else {
                                    runAlgorithm();
                                }
                            }}
                            stayActive
                            active={isPlayerVisible}
                            ariaLabel="Executar algoritmo"
                            title="Executar algoritmo"
                            className="flex items-center justify-center gap-2 px-3"
                        >
                            <LuPlay className="workspace-icon" />
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm">
                                Rodar
                            </span>
                        </WorkspaceToolButton>

                        <WorkspaceToolButton
                            onClick={() => setIsStatusCardVisible(!isStatusCardVisible)}
                            stayActive
                            active={isStatusCardVisible}
                            ariaLabel={isStatusCardVisible ? 'Ocultar status' : 'Mostrar status'}
                            title={isStatusCardVisible ? 'Ocultar status' : 'Mostrar status'}
                            className="flex items-center justify-center gap-2 px-3"
                        >
                            <LuPanelRight className="workspace-icon" />
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm">
                                Status
                            </span>
                        </WorkspaceToolButton>

                        <WorkspaceToolButton
                            onClick={exportImage}
                            ariaLabel="Exportar imagem"
                            title="Exportar imagem"
                            className="col-span-2 flex items-center justify-center gap-2 px-3"
                        >
                            <LuDownload className="workspace-icon" />
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm">
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