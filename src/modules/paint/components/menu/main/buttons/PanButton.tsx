import { useContext } from "react";
import { LuHand } from "react-icons/lu";
import { PaintContext } from "../../../../context/PaintContext";
import { MenuContext } from "../../../../context/MenuContext";
import PaintButton from "../../../PaintButton";

const PanButton = () => {
    const { isPanModeActive, setPanModeActive, setEraser, setFill, setSelectionActive, setSelectedShape } = useContext(PaintContext)!;
    const { setShapeMenu } = useContext(MenuContext)!;

    const handleClick = () => {
        const next = !isPanModeActive;
        setPanModeActive(next);
        if (next) {
            setEraser(false);
            setFill(false);
            setSelectionActive(false);
            setSelectedShape('freeform');
            setShapeMenu(false);
            document.body.style.cursor = 'default';
        }
    };

    return (
        <PaintButton
            onClick={handleClick}
            stayActive
            active={isPanModeActive}
            ariaLabel={isPanModeActive ? "Desativar arraste do canvas" : "Ativar arraste do canvas"}
        >
            <LuHand className="paint-icon" />
        </PaintButton>
    );
};

export default PanButton;
