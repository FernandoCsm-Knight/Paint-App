import { useContext } from "react";
import { PaintContext } from "../../../../context/PaintContext";

const MenuTitle = () => {
    const { pixelated, setPixelated } = useContext(PaintContext)!;

    return (
        <div className="ui-menu-title-card flex min-w-0 flex-col gap-[var(--pm-gap)] rounded-xl px-[var(--pm-pad)] py-[var(--pm-btn-pad)] shadow-sm">
            <div className="flex items-center justify-between gap-[var(--pm-gap)]">
                <h1 className="text-sm sm:text-base md:text-lg ui-menu-title-heading font-bold uppercase tracking-[0.24em]">Paint</h1>
                <span className="ui-menu-title-badge text-xs sm:text-sm md:text-base rounded-full px-[var(--pm-btn-pad)] py-0.5 font-semibold uppercase tracking-[0.22em]">
                    {pixelated ? "Pixel" : "Livre"}
                </span>
            </div>
            <div className="ui-menu-segmented flex items-center gap-1 rounded-lg p-1">
                <button
                    type="button"
                    onClick={() => setPixelated(false)}
                    className={`text-xs sm:text-sm md:text-base ui-menu-segment flex-1 cursor-pointer rounded-md px-[var(--pm-btn-pad)] py-1.5 font-semibold transition duration-200 ${
                        !pixelated
                            ? "ui-menu-segment-active shadow-sm"
                            : ""
                    }`}
                >
                    Freehand
                </button>
                <button
                    type="button"
                    onClick={() => setPixelated(true)}
                    className={`text-xs sm:text-sm md:text-base ui-menu-segment flex-1 cursor-pointer rounded-md px-[var(--pm-btn-pad)] py-1.5 font-semibold transition duration-200 ${
                        pixelated
                            ? "ui-menu-segment-active shadow-sm"
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
