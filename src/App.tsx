import { useContext, useEffect } from 'react';
import Menu from './components/Menu'
import useCanvas from './hooks/useCanvas';
import MenuProvider from './providers/MenuProvider';
import { PaintContext } from './context/PaintContext';

function App() {
  const { canvasRef, containerRef } = useContext(PaintContext)!;

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    undo,
    redo,
  } = useCanvas();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (!isCtrlOrMeta) return;

      if(e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if(e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  return (
    <>
      <MenuProvider>
        <Menu/>
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
