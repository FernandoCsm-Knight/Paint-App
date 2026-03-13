import { LuEraser } from "react-icons/lu";
import { useContext } from "react";
import PaintButton from "../../../PaintButton";
import { PaintContext } from "../../../../context/PaintContext";

const EraserButton = () => {
    const { isEraserActive, setEraser, setFill, setSelectionActive, setPanModeActive } = useContext(PaintContext)!;

    const handleClick = () => {
        const next = !isEraserActive;
        setEraser(next);
        if (next) {
            setFill(false);
            setSelectionActive(false);
            setPanModeActive(false);
        }
    };

    return (
        <PaintButton
            onClick={handleClick}
            stayActive
            active={isEraserActive}
            ariaLabel={isEraserActive ? "Desativar borracha" : "Ativar borracha"}
        >
            <LuEraser className="w-4 h-4 sm:w-5 sm:h-5" />
        </PaintButton>
    );
};

export default EraserButton
