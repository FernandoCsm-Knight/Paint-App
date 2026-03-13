import { useContext } from "react";
import { LuHand } from "react-icons/lu";
import { PaintContext } from "../../context/PaintContext";
import PaintButton from "../PaintButton";

const PanButton = () => {
    const { isPanModeActive, setPanModeActive } = useContext(PaintContext)!;

    return (
        <PaintButton
            onClick={() => setPanModeActive(!isPanModeActive)}
            stayActive
            active={isPanModeActive}
            ariaLabel={isPanModeActive ? "Desativar arraste do canvas" : "Ativar arraste do canvas"}
        >
            <LuHand className="w-4 h-4 sm:w-5 sm:h-5" />
        </PaintButton>
    );
};

export default PanButton;
