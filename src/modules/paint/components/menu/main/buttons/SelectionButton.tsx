import { useContext } from "react";
import { LuCrop } from "react-icons/lu";
import { PaintContext } from "../../../../context/PaintContext";
import { MenuContext } from "../../../../context/MenuContext";
import PaintButton from "../../../PaintButton";


const SelectionButton = () => {
    const { isSelectionActive, setSelectionActive, setFill, setEraser, setPanModeActive, setSelectedShape } = useContext(PaintContext)!;
    const { setShapeMenu } = useContext(MenuContext)!;

    const handleClick = () => {
        const next = !isSelectionActive;
        setSelectionActive(next);
        document.body.style.cursor = next ? 'crosshair' : 'default';
        if (next) {
            setFill(false);
            setEraser(false);
            setPanModeActive(false);
            setSelectedShape('freeform');
            setShapeMenu(false);
        }
    };

    return (
        <PaintButton onClick={handleClick} stayActive active={isSelectionActive} ariaLabel={isSelectionActive ? 'Desativar seleção' : 'Ativar seleção'}>
            <LuCrop className="w-4 h-4 sm:w-5 sm:h-5"/>
        </PaintButton>
    );
};

export default SelectionButton;
