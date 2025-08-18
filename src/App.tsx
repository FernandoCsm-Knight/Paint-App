import { useContext, useEffect } from 'react';
import Menu from './components/Menu'
import useCanvas from './hooks/useCanvas';
import MenuProvider from './providers/MenuProvider';
import { PaintContext } from './context/PaintContext';
import { ClipboardImageLoader } from './utils/ClipboardImageLoader';

function App() {
    const { canvasRef, containerRef } = useContext(PaintContext)!;

    const {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        undo,
        redo,
        pasteImage,
        copyImage
    } = useCanvas();

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
                    ClipboardImageLoader.loadImageFromClipboard().then(img => {
                        pasteImage(img);
                    });
                    break;
                case 'c':
                    e.preventDefault();
                    copyImage().then(img => {
                        if(img) {
                            ClipboardImageLoader.copyImageToClipboard(img).then(() => {
                                alert('Image copied to clipboard');
                            });
                        }
                    });
                    break;
                default:
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [undo, redo, pasteImage, copyImage]);

    return (
        <>
            <MenuProvider>
                <Menu />
            </MenuProvider>
            <main ref={containerRef} className='h-full w-full flex items-center justify-center'>
                <canvas
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    style={{ border: '1px solid #ccc' }}
                ></canvas>
            </main>
        </>
    );
};

export default App
