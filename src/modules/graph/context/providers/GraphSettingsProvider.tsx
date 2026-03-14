import { useMemo, useState, type ReactNode } from 'react';
import { GraphSettingsContext, type GraphSettingsContextType } from '../GraphSettingsContext';

type GraphSettingsProviderProps = {
    children: ReactNode;
};

const GraphSettingsProvider = ({ children }: GraphSettingsProviderProps) => {
    const [isDirected, setIsDirected] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [showLabels, setShowLabels] = useState(true);

    const value = useMemo<GraphSettingsContextType>(() => ({
        isDirected,
        setIsDirected,
        snapToGrid,
        setSnapToGrid,
        showLabels,
        setShowLabels,
        gridSize: 32,
        vertexRadius: 20,
    }), [isDirected, showLabels, snapToGrid]);

    return (
        <GraphSettingsContext.Provider value={value}>
            {children}
        </GraphSettingsContext.Provider>
    );
};

export default GraphSettingsProvider;

