import { useContext, useEffect } from 'react';
import Menu from './components/Menu'
import useCanvas from './hooks/useCanvas';
import MenuProvider from './providers/MenuProvider';
import { PaintContext } from './context/PaintContext';
import { ReplacementContext } from './context/ReplacementContext';
import { SettingsContext } from './context/SettingsContext';
import PageSizeEraser from './components/PageSizeEraser';
import ModeManager from './components/ModeManager';

function PaintWorkspace() {
    const paintContext = useContext(PaintContext)!;
    const { viewportCanvasRef, containerRef, isSelectionActive, isPanModeActive, isCanvasPanning } = paintContext;
    const { viewportReplacementCanvasRef } = useContext(ReplacementContext)!;
    const { gridDisplayMode, pageSizeEraser } = useContext(SettingsContext)!;

    const {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleWheel,
        undo,
        redo,
        pasteSnapshot,
        copySnapshot,
        saveSnapshot
    } = useCanvas();

    useEffect(() => {
        paintContext.saveSnapshot = saveSnapshot;
    }, [paintContext, saveSnapshot]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isCtrlOrMeta = e.ctrlKey || e.metaKey;
            if (!isCtrlOrMeta) return;

            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    undo();
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
                case 'v':
                    e.preventDefault();
                    pasteSnapshot();
                    break;
                case 'c':
                    e.preventDefault();
                    copySnapshot();
                    break;
                default:
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [undo, redo, pasteSnapshot, copySnapshot]);

    return (
        <>
            <ModeManager />
            <MenuProvider>
                <Menu />
            </MenuProvider>
            <main
                ref={containerRef}
                onWheel={(e) => {
                    if ((e.target as HTMLElement).closest('[data-paint-menu]')) return;
                    handleWheel(e);
                }}
                className={`relative h-full min-h-0 w-full overflow-hidden ${isCanvasPanning ? 'cursor-grabbing' : isPanModeActive ? 'cursor-grab' : 'cursor-default'}`}
            >
                <div className="absolute inset-0 overflow-hidden">
                    <canvas
                        ref={viewportReplacementCanvasRef}
                        className={`absolute border-0 pointer-events-none inset-0 h-full w-full ${(gridDisplayMode === 'front' || isSelectionActive) ? 'z-20' : 'z-0'}`}
                    ></canvas>
                    <canvas
                        ref={viewportCanvasRef}
                        className='relative z-10 block h-full w-full touch-none border-0 select-none'
                        onMouseDown={(e) => {
                            if (e.button === 1) e.preventDefault();
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    ></canvas>
                </div>
                {(pageSizeEraser) ? <PageSizeEraser/> : null}
            </main>
        </>
    );
};

export default PaintWorkspace
