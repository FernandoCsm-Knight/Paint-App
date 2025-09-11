import { createContext, type RefObject } from "react";

export type MenuContextType = {
    shapeButtonRef: RefObject<HTMLButtonElement | null>;
    settingButtonRef: RefObject<HTMLButtonElement | null>;

    shapeMenu: boolean;
    setShapeMenu: (value: boolean) => void;
}

export const MenuContext = createContext<MenuContextType | undefined>(undefined);
