import { useContext } from "react";
import { SettingsContext, type GridDisplayMode } from "../../../context/SettingsContext";

const GridSettings = ({ descriptionPrefix }: { descriptionPrefix: string }) => {
    const { gridDisplayMode, setGridDisplayMode } = useContext(SettingsContext)!;

    const handleGridDisplayModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setGridDisplayMode(event.target.value as GridDisplayMode);
    };

    return (
        <li>
            <label className="block mb-2">
                Exibicao do Grid
            </label>
            <select
                value={gridDisplayMode}
                onChange={handleGridDisplayModeChange}
                className="paint-input w-full p-2 rounded-md text-sm"
            >
                <option value="behind">Atras do desenho</option>
                <option value="front">A frente do desenho</option>
                <option value="none">Sem grid</option>
            </select>
            <div className="paint-panel-muted-on-dark text-xs mt-1">
                {gridDisplayMode === 'behind' && `Grid aparece atras ${descriptionPrefix}`}
                {gridDisplayMode === 'front' && `Grid aparece a frente ${descriptionPrefix}`}
                {gridDisplayMode === 'none' && 'Grid nao e exibido'}
            </div>
        </li>
    );
};

export default GridSettings;
