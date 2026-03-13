import { useContext } from "react";
import { PaintContext } from "../../context/PaintContext";

const MenuTitle = () => {
    const { pixelated, setPixelated } = useContext(PaintContext)!;

    return (
        <div className="paint-menu-title-card flex min-w-0 flex-col gap-2 rounded-xl px-3 py-2 shadow-sm sm:px-4">
            <div className="flex items-center justify-between gap-3">
                <h1 className="paint-menu-title-heading text-sm font-bold uppercase tracking-[0.24em] sm:text-base">Paint</h1>
                <span className="paint-menu-title-badge rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]">
                    {pixelated ? "Pixel" : "Livre"}
                </span>
            </div>
            <div className="paint-menu-segmented flex items-center gap-1 rounded-lg p-1">
                <button
                    type="button"
                    onClick={() => setPixelated(false)}
                    className={`paint-menu-segment flex-1 cursor-pointer rounded-md px-2 py-1.5 text-xs font-semibold transition duration-200 sm:text-sm ${
                        !pixelated
                            ? "paint-menu-segment-active shadow-sm"
                            : ""
                    }`}
                >
                    Freehand
                </button>
                <button
                    type="button"
                    onClick={() => setPixelated(true)}
                    className={`paint-menu-segment flex-1 cursor-pointer rounded-md px-2 py-1.5 text-xs font-semibold transition duration-200 sm:text-sm ${
                        pixelated
                            ? "paint-menu-segment-active shadow-sm"
                            : ""
                    }`}
                >
                    Pixelado
                </button>
            </div>
        </div>
    );
};

export default MenuTitle;
