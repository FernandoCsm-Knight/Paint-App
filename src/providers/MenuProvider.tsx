import { useRef, useState, type ReactNode } from "react";
import { MenuContext, type MenuContextType } from "../context/MenuContext";

type MenuProviderProps = {
    children: ReactNode;
};

const MenuProvider = ({ children }: MenuProviderProps) => {
    const [shapeMenu, setShapeMenu] = useState<boolean>(false);
    const [settingsMenu, setSettingsMenu] = useState<boolean>(false);

    const menuDefaults: MenuContextType = {
        shapeButtonRef: useRef(null),
        settingButtonRef: useRef(null),

        shapeMenu: shapeMenu,
        setShapeMenu: setShapeMenu,

        settingsMenu: settingsMenu,
        setSettingsMenu: setSettingsMenu
    };

    return(
        <MenuContext.Provider value={menuDefaults}>
            {children}
        </MenuContext.Provider>
    );
};

export default MenuProvider;
