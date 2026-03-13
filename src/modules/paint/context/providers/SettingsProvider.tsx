import { useMemo, useState } from "react";
import { SettingsContext, type GridDisplayMode, type LineAlgorithm } from "../SettingsContext";

const SettingsProvider = ( { children }: { children: React.ReactNode } ) => {

    const [pixelSize, setPixelSize] = useState<number>(20);
    const [lineAlgorithm, setLineAlgorithm] = useState<LineAlgorithm>("bresenham");
    const [gridDisplayMode, setGridDisplayMode] = useState<GridDisplayMode>("behind");
    const [pageSizeEraser, setPageSizeEraser] = useState<boolean>(false);

    const settingsContext = useMemo(() => ({
        pixelSize,
        setPixelSize,
        lineAlgorithm,
        setLineAlgorithm,
        gridDisplayMode,
        setGridDisplayMode,
        pageSizeEraser,
        setPageSizeEraser
    }), [pixelSize, lineAlgorithm, gridDisplayMode, pageSizeEraser]);

    return (
        <SettingsContext.Provider value={settingsContext}>
            { children }
        </SettingsContext.Provider>
    );
};


export default SettingsProvider;