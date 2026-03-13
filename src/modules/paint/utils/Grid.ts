export const STANDARD_GRID_SIZE = 32;
export const GRID_LINE_COLOR = "#d5d9e2";

export const getGridCellSize = (pixelated: boolean, pixelSize: number) => {
    return pixelated ? pixelSize : STANDARD_GRID_SIZE;
};
