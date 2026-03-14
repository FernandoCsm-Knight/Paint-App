import type { ReactNode } from 'react';
import { LuGripHorizontal } from 'react-icons/lu';
import { useDraggable, type DraggableOptions } from '../hooks/useDraggable';
import type { Point } from '../functions/geometry';

type GlassCardProps = {
    initial: () => Point;
    children?: ReactNode;
    className?: string;
    referenceFrame?: DraggableOptions['referenceFrame'];
    showHandle?: boolean;
};

const GlassCard = ({ initial, children, className = '', referenceFrame = 'offsetParent', showHandle = true }: GlassCardProps) => {
    const draggable = useDraggable({ initial, clamp: true, referenceFrame });

    return (
        <section
            ref={draggable.ref}
            className={`ui-floating-card absolute min-w-fit z-15 overflow-hidden rounded-xl backdrop-blur-sm ${className}`.trim()}
            style={draggable.style}
        >
            {!showHandle && (
                <div
                    onPointerDown={draggable.onPointerDown}
                    className="absolute top-0 left-0 right-0 h-5 cursor-grab active:cursor-grabbing touch-none select-none z-10"
                />
            )}
            {children}
            {showHandle && (
                <div className="flex items-center justify-end">
                    <div className="ui-drag-line mx-4 grow rounded-xl border" />
                    <button
                        type="button"
                        onPointerDown={draggable.onPointerDown}
                        className="block cursor-grab select-none pr-2 pb-2 touch-none active:cursor-grabbing"
                        aria-label="Mover card"
                    >
                        <LuGripHorizontal className="workspace-drag-handle workspace-icon" />
                    </button>
                </div>
            )}
        </section>
    );
};

export default GlassCard;
