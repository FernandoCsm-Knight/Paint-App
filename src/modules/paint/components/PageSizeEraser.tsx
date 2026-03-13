import { LuGripHorizontal } from "react-icons/lu";
import { useDraggable } from "../hooks/useDraggable";
import { useContext, useState } from "react";
import { PaintContext } from "../context/PaintContext";
import type { Point } from "../types/Graphics";

const PageSizeEraser = () => {
    const { canvasRef, contextRef, renderViewport, saveSnapshot, viewOffset, zoom } = useContext(PaintContext)!;
    const [isActive, setIsActive] = useState(false);
    const [previewHeight, setPreviewHeight] = useState(0);

    const getInitialPosition = (): Point => ({
        x: window.scrollX || window.pageXOffset,
        y: Math.abs(window.scrollY || window.pageYOffset) + window.innerHeight - 40
    });

    const eraseFromBottom = (pointPage: Point) => {
        const viewportCanvas = canvasRef.current;   // on-screen canvas (for position)
        const ctx = contextRef.current;
        if(!viewportCanvas || !ctx) return;

        const docCanvas = ctx.canvas;               // off-screen document canvas (for dimensions)

        const scrollY = window.scrollY || window.pageYOffset;
        const handleYViewport = pointPage.y - scrollY;
        const viewportBottom = window.innerHeight - 40;

        const previewH = Math.max(0, viewportBottom - handleYViewport);
        setPreviewHeight(previewH);

        // Intersect the erase band [handleYViewport, viewportBottom] with the canvas rect
        const rect = viewportCanvas.getBoundingClientRect();
        const bandTop = Math.max(handleYViewport, rect.top);
        const bandBottom = Math.min(viewportBottom, rect.bottom);
        const overlapViewport = Math.max(0, bandBottom - bandTop);
        if (overlapViewport <= 0) return; // nothing to clear on the canvas

        const localTop = bandTop - rect.top;
        const localBottom = bandBottom - rect.top;
        const worldTop = Math.max(0, (-viewOffset.y + localTop) / zoom);
        const worldBottom = Math.min(docCanvas.height, (-viewOffset.y + localBottom) / zoom);
        const clearHeight = Math.max(0, worldBottom - worldTop);

        if (clearHeight > 0) {
            ctx.clearRect(0, worldTop, docCanvas.width, clearHeight);
            renderViewport();
        }
    };

    const handleDrag = (point: Point) => {
        const minY = window.scrollY || window.pageYOffset;
        const maxY = (window.scrollY || window.pageYOffset) + window.innerHeight - 40;
        const clampedY = Math.min(Math.max(minY, point.y), maxY);

        if(clampedY !== point.y) setPosition((prev) => ({ x: prev.x, y: clampedY }));

        eraseFromBottom({ x: point.x, y: clampedY });
    };

    const handleResizeAndScroll = (): Point => {
        return getInitialPosition();
    };

    const handleDragEnd = () => {
        setIsActive(false);
        setPreviewHeight(0);
        setPosition(getInitialPosition());
        if(saveSnapshot) saveSnapshot();
    }

    const { ref, onPointerDown, style, setPosition } = useDraggable({
        initial: getInitialPosition,
        axis: "y",
        clamp: true,
        onDragStart: () => setIsActive(true),
        onDrag: handleDrag,
        onDragEnd: handleDragEnd,
        onResize: handleResizeAndScroll,
        onScroll: handleResizeAndScroll
    });

    return (
        <>
            {isActive && previewHeight > 0 && (
                <div 
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${previewHeight}px`,
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        pointerEvents: 'none',
                        zIndex: 49,
                        border: '2px dashed rgb(239, 68, 68)',
                    }}
                />
            )}

            <div
            ref={ref}
            onPointerDown={onPointerDown}
            style={{...style, transition: isActive ? 'none' : 'top 0.3s ease-out, left 0.3s ease-out'}}
            className="flex items-center justify-center w-full min-w-[100vw] absolute">
                <div
                    className={`
                        w-full
                        z-50
                        flex
                        justify-between
                        items-center
                        rounded-xl
                        shadow-lg
                        backdrop-blur-sm
                        max-w-[95vw]
                        max-h-[95vh]
                        overflow-hidden
                        ${isActive ? 'bg-red-400/40 cursor-grabbing' : 'bg-gray-200/30 cursor-grab hover:bg-gray-300/40'}
                    `}>
                    <div className={`grow border-t-2 rounded-2xl mx-4 transition-colors ${isActive ? 'border-red-500' : 'border-gray-400'}`}></div>
                    <LuGripHorizontal className={`transition-colors ${isActive ? 'text-red-600' : 'text-gray-500'} sm:h-5 sm:w-5 h-4 w-4`}/>
                    <div className={`grow border-t-2 rounded-2xl mx-4 transition-colors ${isActive ? 'border-red-500' : 'border-gray-400'}`}></div>
                </div>
            </div>
        </>
    );

};

export default PageSizeEraser;
