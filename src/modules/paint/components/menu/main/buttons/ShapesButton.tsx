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
            <LuShapes className="paint-icon"/>
        </PaintButton>
    );
};

export default ShapesButton;
