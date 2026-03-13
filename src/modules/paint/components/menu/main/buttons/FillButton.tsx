import { LuPaintBucket } from "react-icons/lu";
import { useContext } from "react";
import { PaintContext } from "../../../../context/PaintContext";
import { MenuContext } from "../../../../context/MenuContext";
import PaintButton from "../../../PaintButton";

const FillButton = () => {
    const { isFillActive, setFill, setEraser, setPanModeActive, setSelectionActive, setSelectedShape } = useContext(PaintContext)!;
    const { setShapeMenu } = useContext(MenuContext)!;

    const handleClick = () => {
        const next = !isFillActive;
        setFill(next);
        document.body.style.cursor = next ? 'crosshair' : 'default';
        if (next) {
            setEraser(false);
            setPanModeActive(false);
            setSelectionActive(false);
            setSelectedShape('freeform');
            setShapeMenu(false);
        }
    };

    return (
        <PaintButton onClick={handleClick} stayActive active={isFillActive}>
            <LuPaintBucket className="w-4 h-4 sm:w-5 sm:h-5"/>
        </PaintButton>
    );
};

export default FillButton;
