import { useContext } from "react";
import { SettingsContext } from "../../../context/SettingsContext";
import Settings from "./Settings";

const StandardSettings = () => {
    const { pageSizeEraser, setPageSizeEraser } = useContext(SettingsContext)!;

    return (
        <Settings>
            <li className="flex items-center justify-between">
                <label className="block m-0" htmlFor="pageSizeEraserInput">
                    Borracha Suavizada
                </label>
                <input 
                    id="pageSizeEraserInput"
                    onChange={() => setPageSizeEraser(!pageSizeEraser)} 
                    type="checkbox" 
                    checked={pageSizeEraser} 
                    className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
                />
            </li>
        </Settings>
    );
}

export default StandardSettings;
