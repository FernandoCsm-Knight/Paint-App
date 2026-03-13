import { useMemo, useRef, useState, type ReactNode } from "react";
import { MenuContext, type MenuContextType } from "../MenuContext";

type MenuProviderProps = {
    children: ReactNode;
};

const MenuProvider = ({ children }: MenuProviderProps) => {
    const shapeButtonRef = useRef<HTMLButtonElement | null>(null);
    const settingButtonRef = useRef<HTMLButtonElement | null>(null);

    const [shapeMenu, setShapeMenu] = useState<boolean>(false);
    const [settingsMenu, setSettingsMenu] = useState<boolean>(false);

    const menuDefaults = useMemo((): MenuContextType => ({
        shapeButtonRef,
        settingButtonRef,
        shapeMenu,
        setShapeMenu,
        settingsMenu,
        setSettingsMenu
    }), [shapeMenu, settingsMenu]);

    return(
        <MenuContext.Provider value={menuDefaults}>
            {children}
        </MenuContext.Provider>
    );
};

export default MenuProvider;
