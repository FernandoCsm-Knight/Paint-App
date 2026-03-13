import { useContext } from "react";
import { LuShapes } from "react-icons/lu";
import { MenuContext } from "../../../../context/MenuContext";
import { PaintContext } from "../../../../context/PaintContext";
import PaintButton from "../../../PaintButton";

const ShapesButton = () => {
    const { shapeButtonRef, shapeMenu, setShapeMenu } = useContext(MenuContext)!;
    const { setSelectedShape } = useContext(PaintContext)!;

    const onMenuToggle = () => {
        if(shapeMenu) setSelectedShape('freeform');
        setShapeMenu(!shapeMenu);
    };

    return (
        <PaintButton ref={shapeButtonRef} onClick={onMenuToggle} stayActive>
            <LuShapes className="w-4 h-4 sm:w-5 sm:h-5"/>
        </PaintButton>
    );
};

export default ShapesButton;
