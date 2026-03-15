import { useMemo, useState } from "react";
import { SettingsContext, type ClipAlgorithm, type GridDisplayMode, type LineAlgorithm } from "../SettingsContext";

const SettingsProvider = ( { children }: { children: React.ReactNode } ) => {

    const [pixelSize, setPixelSize] = useState<number>(20);
    const [lineAlgorithm, setLineAlgorithm] = useState<LineAlgorithm>("bresenham");
    const [gridDisplayMode, setGridDisplayMode] = useState<GridDisplayMode>("behind");
    const [pageSizeEraser, setPageSizeEraser] = useState<boolean>(false);
    const [clipAlgorithm, setClipAlgorithm] = useState<ClipAlgorithm>("cohen-sutherland");

    const settingsContext = useMemo(() => ({
        pixelSize,
        setPixelSize,
        lineAlgorithm,
        setLineAlgorithm,
        gridDisplayMode,
        setGridDisplayMode,
        pageSizeEraser,
        setPageSizeEraser,
        clipAlgorithm,
        setClipAlgorithm,
    }), [pixelSize, lineAlgorithm, gridDisplayMode, pageSizeEraser, clipAlgorithm]);

    return (
        <SettingsContext.Provider value={settingsContext}>
            { children }
        </SettingsContext.Provider>
    );
};


export default SettingsProvider;