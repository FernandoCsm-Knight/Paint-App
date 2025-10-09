
import { useContext } from "react";
import { PaintContext } from "../../context/PaintContext";
import PixelatedSettings from "./settings/PixelatedSettings";
import StandardSettings from "./settings/StandardSettings";

const SettingsMenu = () => {
    const { pixelated } = useContext(PaintContext)!;

    if(!pixelated) {
        return (
            <StandardSettings/>
        );
    }

    return (
        <PixelatedSettings/>
    );
};

export default SettingsMenu;
