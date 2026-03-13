import { LuGripHorizontal } from "react-icons/lu";
import { useDraggable } from "../../../../hooks/useDraggable";
import ColorSelector from "./ColorSelector";
import WidthSelector from "./WidthSelector";
import MenuTitle from "./MenuTitle";
import { useContext } from "react";
import ShapeSelector from "./ShapeSelector";
import { MenuContext } from "../../../../context/MenuContext";
import SettingsButton from "../../settings/ui/SettingsButton";
import SettingsMenu from "../../settings/ui/SettingsMenu";
import EraserButton from "../buttons/EraserButton";
import ShapesButton from "../buttons/ShapesButton";
import SelectionButton from "../buttons/SelectionButton";
import PanButton from "../buttons/PanButton";
import FillButton from "../buttons/FillButton";

const Menu = () => {
    const { shapeMenu, settingsMenu } = useContext(MenuContext)!;
    const draggable = useDraggable({ clamp: true, referenceFrame: "offsetParent" });

    return(
        <header>
            <div
                data-paint-menu="true"
                ref={draggable.ref}
                className="paint-menu-shell absolute z-50 rounded-xl backdrop-blur-sm max-w-[95vw] max-h-[95vh] overflow-hidden"
                style={draggable.style}
            >
                <div className="relative flex items-center gap-2 sm:gap-3 p-2 sm:p-4 flex-wrap sm:flex-nowrap">
                    <MenuTitle/>
                    <ColorSelector/>
                    <EraserButton/>
                    <ShapesButton/>
                    <SelectionButton/>
                    <PanButton/>
                    <FillButton/>
                    <WidthSelector/>
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onPointerDown={draggable.onPointerDown}
                            className="block cursor-grab active:cursor-grabbing touch-none select-none"
                            aria-label="Drag to move"
                        >
                            <LuGripHorizontal className="paint-drag-handle sm:h-5 sm:w-5 h-4 w-4"/>
                        </button>
                        <SettingsButton/>
                    </div>
                </div>
            </div>

            { shapeMenu ? <ShapeSelector /> : null }
            { settingsMenu ? <SettingsMenu /> : null }
        </header>
    );
};

export default Menu;
