import { Shape, type ShapeOptions } from "../types/ShapeTypes";
import { rasterizePixelatedPolygon, rasterizePolygon } from "../algorithms/PolygonRasterization";
import { createPolygon, type Point } from "../types/Graphics";

export default class Hexagon extends Shape {
    kind = 'hexagon' as const;

    points: Point[];

    constructor(start: Point, end: Point, opts: ShapeOptions) {
        super(opts);
        this.points = createPolygon(6, start, end);
    }

    pixelatedDraw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.strokeStyle;
        rasterizePixelatedPolygon(this.points, this.drawPixel.bind(this), ctx);
    }

    standardDraw(ctx: CanvasRenderingContext2D): void {
        rasterizePolygon(this.points, this.lineWidth, this.strokeStyle, ctx);
    }

    contains(p: Point): boolean {
        return p.x >= this.points[0].x && p.x <= this.points[2].x && p.y >= this.points[0].y && p.y <= this.points[2].y;
    }

    moveBy(dx: number, dy: number): void {
        for(const point of this.points) {
            point.x += dx;
            point.y += dy;
        }
    }
};