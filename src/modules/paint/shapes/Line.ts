import bresenham from "../algorithms/BresenhamLine";
import dda from "../algorithms/DDA";
import type { Point } from "../types/Graphics";
import { Shape, type ShapeOptions } from "./ShapeTypes";

export default class Line extends Shape {
    kind = 'line' as const;

    start: Point;
    end: Point;

    constructor(start: Point, end: Point, opts: ShapeOptions) {
        super(opts);
        this.start = start;
        this.end = end;
    }

    pixelatedDraw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.strokeStyle;
        
        const algorithm = this.lineAlgorithm === 'dda' ? dda : bresenham;
        algorithm(this.start, this.end, this.drawPixel.bind(this), ctx);
    }

    standardDraw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
    }

    moveBy(dx: number, dy: number): void {
        this.start.x += dx;
        this.start.y += dy;
        this.end.x += dx;
        this.end.y += dy;
    }
};
