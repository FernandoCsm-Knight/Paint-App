import { LuEraser } from "react-icons/lu";
import { useContext } from "react";
import WorkspaceToolButton from "../../../../../../components/WorkspaceToolButton";
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
        <WorkspaceToolButton
            onClick={handleClick}
            stayActive
            active={isEraserActive}
            ariaLabel={isEraserActive ? "Desativar borracha" : "Ativar borracha"}
        >
            <LuEraser className="ui-icon" />
        </WorkspaceToolButton>
    );
};

export default EraserButton
