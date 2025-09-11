import { LuGripHorizontal } from "react-icons/lu";
import { useDraggable } from "../../hooks/useDraggable";
import type { ReactNode } from "react";
import type { Point } from "../../types/Graphics";

type GlassCardProps = {
    initial: Point
    children?: ReactNode;
}

const GlassCard = ({ initial, children }: GlassCardProps) => {
    const draggable = useDraggable({ initial: initial, clamp: true });

    return(
        <section 
            ref={draggable.ref}
            className="absolute z-50 rounded-xl shadow-lg bg-gray-200/30 backdrop-blur-sm max-w-[95vw] max-h-[95vh] overflow-hidden"
            style={draggable.style}
        >
            {children}
            <div className="w-full flex justify-end items-center ">
                <div className="grow border-1 border-gray-700 rounded-xl mx-4"></div>
                <button
                    onPointerDown={draggable.onPointerDown}
                    className="block cursor-grab pr-2 pb-2 active:cursor-grabbing touch-none select-none"
                    aria-label="Drag to move"
                >
                    <LuGripHorizontal className="text-gray-500 sm:h-5 sm:w-5 h-4 w-4"/>
                </button>
            </div>
        </section>
    );
};


export default GlassCard;