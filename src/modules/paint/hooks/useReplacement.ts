import { useCallback, useContext } from "react";
import { ReplacementContext } from "../context/ReplacementContext";

const useReplacement = () => {
    const { replacementContextRef } = useContext(ReplacementContext)!;

    const clearGrid = useCallback((width: number, height: number) => {
        const ctx = replacementContextRef.current;
        if(!ctx) return;
        
        ctx.clearRect(0, 0, width, height);
    }, [replacementContextRef]);

    const drawGrid = useCallback((width: number, height: number) => {
        const ctx = replacementContextRef.current;
        if(!ctx) return;
        ctx.clearRect(0, 0, width, height);
    }, [replacementContextRef]);

    return {
        drawGrid,
        clearGrid
    };
};

export default useReplacement;
