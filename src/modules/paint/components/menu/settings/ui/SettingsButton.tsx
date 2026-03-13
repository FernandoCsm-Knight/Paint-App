import { useContext, useState } from "react";
import { MenuContext } from "../../../../context/MenuContext";
import { LuSettings } from "react-icons/lu";

const SettingsButton = () => {
    const { settingButtonRef, setSettingsMenu, settingsMenu } = useContext(MenuContext)!;
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        setIsAnimating(true);
        
        setTimeout(() => {
            setIsAnimating(false);
        }, 400);
        
        setSettingsMenu(!settingsMenu);
    };

    return (
        <button
            ref={settingButtonRef}
            onClick={handleClick}
            className={`
                settings-button block cursor-pointer p-1 rounded-lg
                ${settingsMenu ? 'settings-button-active' : ''}
                ${isAnimating ? 'scale-110' : ''}
            `}
            aria-label="Open settings"
            title={settingsMenu ? "Fechar configurações" : "Abrir configurações"}
        >
            <LuSettings 
                className={`
                    settings-gear sm:h-5 sm:w-5 h-4 w-4
                    ${settingsMenu 
                        ? 'settings-gear-active' 
                        : 'paint-menu-handle'
                    }
                `}
            />
        </button>
    );
};

export default SettingsButton;
