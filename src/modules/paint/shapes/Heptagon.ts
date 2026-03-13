import { Shape, type ShapeOptions } from "./ShapeTypes";
import { rasterizePixelatedPolygon, rasterizePolygon } from "../algorithms/PolygonRasterization";
import { createPolygon, type Point } from "../types/Graphics";

export default class Heptagon extends Shape {
    kind = 'heptagon' as const;

    points: Point[];

    constructor(start: Point, end: Point, opts: ShapeOptions) {
        super(opts);
        this.points = createPolygon(7, start, end);
    }

    pixelatedDraw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.strokeStyle;
        rasterizePixelatedPolygon(this.points, this.drawPixel.bind(this), ctx);
    }

    standardDraw(ctx: CanvasRenderingContext2D): void {
        rasterizePolygon(this.points, this.lineWidth, this.strokeStyle, ctx);
    }

    moveBy(dx: number, dy: number): void {
        for(const point of this.points) {
            point.x += dx;
            point.y += dy;
        }
    }
};