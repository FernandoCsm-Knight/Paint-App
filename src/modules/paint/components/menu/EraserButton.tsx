import { LuEraser } from "react-icons/lu";
import { useContext } from "react";
import { PaintContext } from "../../context/PaintContext";
import PaintButton from "../PaintButton";

const EraserButton = () => {
    const { isEraserActive, setEraser } = useContext(PaintContext)!;

    return (
        <PaintButton
            onClick={() => setEraser(!isEraserActive)}
            stayActive
            active={isEraserActive}
            aria-label={isEraserActive ? "Desativar borracha" : "Ativar borracha"}
        >
            <LuEraser className="w-4 h-4 sm:w-5 sm:h-5" />
        </PaintButton>
    );
};

export default EraserButton
