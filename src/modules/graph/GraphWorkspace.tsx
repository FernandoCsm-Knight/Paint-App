import { useContext, useEffect } from 'react';
import FloatingInfoBadge from '../../components/FloatingInfoBadge';
import GraphMenu from './components/GraphMenu';
import GraphPlayerCard from './components/GraphPlayerCard';
import GraphStatusCard from './components/GraphStatusCard';
import { GraphContext } from './context/GraphContext';
import { useGraphCanvas } from './hooks/useGraphCanvas';

const GraphWorkspace = () => {
    const graph = useContext(GraphContext);
    const {
        canvasRef,
        containerRef,
        viewportSize,
        handleDoubleClick,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleContextMenu
    } = useGraphCanvas();

    useEffect(() => {
        if (!graph) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Delete' && event.key !== 'Backspace') return;
            event.preventDefault();
            graph.removeSelectedElement();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [graph]);

    useEffect(() => {
        if (!graph) return;

        graph.setExportImage(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = canvas.width;
            exportCanvas.height = canvas.height;
            const exportContext = exportCanvas.getContext('2d');
            if (!exportContext) return;
            const workspace = containerRef.current;
            const themeStyles = workspace ? getComputedStyle(workspace) : null;
            const exportSurface = themeStyles?.getPropertyValue('--ui-input-surface').trim() || '#ffffff';

            exportContext.fillStyle = exportSurface;
            exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
            exportContext.drawImage(canvas, 0, 0);

            const link = document.createElement('a');
            link.href = exportCanvas.toDataURL('image/png');
            link.download = 'graph-canvas.png';
            link.click();
        });
    }, [canvasRef, containerRef, graph]);

    return (
        <>
            <GraphMenu />
            {graph?.isStatusCardVisible ? <GraphStatusCard /> : null}
            {graph?.isPlayerVisible ? <GraphPlayerCard /> : null}

            <main ref={containerRef} className="relative h-full min-h-0 w-full overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="relative z-10 block h-full w-full touch-none select-none"
                    onDoubleClick={handleDoubleClick}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onContextMenu={handleContextMenu}
                />

                <FloatingInfoBadge>
                        {Math.round(viewportSize.width)} x {Math.round(viewportSize.height)}
                </FloatingInfoBadge>
            </main>
        </>
    );
};

export default GraphWorkspace;
