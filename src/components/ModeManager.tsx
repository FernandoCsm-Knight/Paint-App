import { useEffect, useContext } from "react";
import { PaintContext } from "../context/PaintContext";
import { SettingsContext } from "../context/SettingsContext";

const ModeManager = () => {
    const { 
        pixelated, 
        setEraser, 
        setFill, 
        setSelectionActive,
        setSelectedShape 
    } = useContext(PaintContext)!;
    
    const { 
        setPageSizeEraser, 
        setGridDisplayMode 
    } = useContext(SettingsContext)!;

    useEffect(() => {
        if (pixelated) {
            setPageSizeEraser(false);
            
            setEraser(false);
            setFill(false);
            setSelectionActive(false);
        } 
    }, [pixelated, setPageSizeEraser, setEraser, setFill, setSelectionActive, setGridDisplayMode, setSelectedShape]);

    return null;
};

export default ModeManager;
