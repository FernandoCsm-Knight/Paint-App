import { useContext } from "react";
import { MenuContext } from "../../context/MenuContext";
import { LuSettings } from "react-icons/lu";

const SettingsButton = () => {
    const { settingButtonRef, setSettingsMenu, settingsMenu } = useContext(MenuContext)!;

    return (
        <button
            ref={settingButtonRef}
            onClick={() => setSettingsMenu(!settingsMenu)}
            className="block cursor-pointer"
            aria-label="Open settings"
        >
            <LuSettings className="text-gray-500 sm:h-5 sm:w-5 h-4 w-4"/>
        </button>
    );
};

export default SettingsButton;
