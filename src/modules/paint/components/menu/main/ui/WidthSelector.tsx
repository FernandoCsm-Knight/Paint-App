import { useCallback, useContext, useState } from "react";
import { PaintContext } from "../../../../context/PaintContext";

const WidthSelector = () => {
    const { thickness, pixelated } = useContext(PaintContext)!;

    const [lastMode, setLastMode] = useState<boolean>(pixelated);

    const [lineWidth, setLineWidth] = useState<number>(thickness.current);

    if(lastMode !== pixelated) {
        const width = pixelated ? 1 : 5;
        thickness.current = width;
        setLineWidth(width);
        setLastMode(pixelated);
    }

    const onLineWidthChange = useCallback((lineWidth: number) => {
        thickness.current = lineWidth;
        setLineWidth(lineWidth);
    }, [thickness]);

    return(
        <label className="flex items-center gap-[var(--pm-gap)] min-w-0 w-full">
            <span className="ui-value-chip px-[var(--pm-btn-pad)] py-0.5 text-center rounded-md w-15 text-[var(--pm-text-xs)] whitespace-nowrap text-xs">{lineWidth}</span>
            <input type="range" min="1" max={pixelated ? "5" :"100"} step="1" value={lineWidth} onChange={(e) => {onLineWidthChange(Number.parseInt(e.target.value))}} className="grow slider h-2 rounded-lg cursor-pointer" />
        </label>
    );
};

export default WidthSelector;
