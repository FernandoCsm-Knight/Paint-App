import { createContext } from 'react';

export type GraphSettingsContextType = {
    isDirected: boolean;
    setIsDirected: (value: boolean) => void;
    snapToGrid: boolean;
    setSnapToGrid: (value: boolean) => void;
    showLabels: boolean;
    setShowLabels: (value: boolean) => void;
    gridSize: number;
    vertexRadius: number;
};

export const GraphSettingsContext = createContext<GraphSettingsContextType | undefined>(undefined);

