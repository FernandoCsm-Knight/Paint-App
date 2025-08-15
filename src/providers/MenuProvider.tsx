import { useRef, type ReactNode } from "react";
import { MenuContext, type MenuContextType } from "../context/MenuContext";

type MenuProviderProps = {
    children: ReactNode;
};

const MenuProvider = ({ children }: MenuProviderProps) => {
    
    const menuDefaults: MenuContextType = {
        shapeButtonRef: useRef(null),
        settingButtonRef: useRef(null)
    };

    return(
        <MenuContext.Provider value={menuDefaults}>
            {children}
        </MenuContext.Provider>
    );
};

export default MenuProvider;
