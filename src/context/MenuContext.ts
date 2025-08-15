import { createContext, type RefObject } from "react";

export type MenuContextType = {
    shapeButtonRef: RefObject<HTMLButtonElement | null>;
    settingButtonRef: RefObject<HTMLButtonElement | null>;
}

export const MenuContext = createContext<MenuContextType | undefined>(undefined);
