import type { Point } from "../types/Graphics";

export const STANDARD_GRID_SIZE = 32;
export const GRID_LINE_COLOR = "#d5d9e2";

export const getGridCellSize = (pixelated: boolean, pixelSize: number, zoom: number = 1) => {
    return (pixelated ? pixelSize : STANDARD_GRID_SIZE) * zoom;
};

export const drawGrid = (
    ctx: CanvasRenderingContext2D, 
    viewOffset: Point, 
    cellSize: number, 
    width: number, 
    height: number, 
    dpr: number
) => {
    const startX = ((viewOffset.x % cellSize) + cellSize) % cellSize;
    const startY = ((viewOffset.y % cellSize) + cellSize) % cellSize;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = startX; x <= width; x += cellSize) {
        const alignedX = Math.round(x) + 0.5;
        ctx.moveTo(alignedX, 0);
        ctx.lineTo(alignedX, height);
    }

    for (let y = startY; y <= height; y += cellSize) {
        const alignedY = Math.round(y) + 0.5;
        ctx.moveTo(0, alignedY);
        ctx.lineTo(width, alignedY);
    }

    ctx.stroke();
    ctx.restore();
};