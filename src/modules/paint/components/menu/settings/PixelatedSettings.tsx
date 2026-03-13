import { useContext } from "react";
import { SettingsContext, type LineAlgorithm } from "../../../context/SettingsContext";
import GridSettings from "./GridSettings";
import Settings from "./ui/Settings";

const PixelatedSettings = () => {
    const {
        pixelSize,
        setPixelSize,
        lineAlgorithm,
        setLineAlgorithm
    } = useContext(SettingsContext)!;
    
    const handlePixelSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const size = parseInt(event.target.value);
        if(size >= 1 && size <= 100) setPixelSize(size);
    };

    const handleLineAlgorithmChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLineAlgorithm(event.target.value as LineAlgorithm);
    };

    return (
        <Settings>
            <li>
                <label className="block mb-2">
                    Tamanho do Pixel
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="5"
                        max="50"
                        step="1"
                        value={pixelSize}
                        onChange={handlePixelSizeChange}
                        className="slider flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="paint-value-chip text-sm font-mono px-2 py-1 rounded min-w-[3rem] text-center">
                        {pixelSize}px
                    </span>
                </div>
            </li>

            <li>
                <label className="block mb-2">
                    Algoritmo de Linha
                </label>
                <select
                    value={lineAlgorithm}
                    onChange={handleLineAlgorithmChange}
                    className="paint-input w-full p-2 rounded-md text-sm"
                >
                    <option value="bresenham">Bresenham</option>
                    <option value="dda">DDA (Digital Differential Analyzer)</option>
                </select>
                <div className="paint-panel-muted-on-dark text-xs mt-1">
                    {lineAlgorithm === 'bresenham' 
                        ? 'Algoritmo mais preciso e eficiente para rasterização'
                        : 'Algoritmo simples baseado em interpolação linear'
                    }
                </div>
            </li>
            <GridSettings descriptionPrefix="dos pixels desenhados" />
        </Settings>
    );
};

export default PixelatedSettings;
