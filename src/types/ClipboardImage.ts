import { Shape, type Point, type ShapeOptions } from "./ShapeTypes";

export default class ClipboardImage extends Shape {
    kind = 'image' as const;

    center: boolean;
    keepDimensions: boolean;
    position: Point | null;
    img: HTMLImageElement;
    
    width: number = 0;
    height: number = 0;

    constructor(image: HTMLImageElement, opts: ShapeOptions & {
        center?: boolean, 
        keepDimensions?: boolean
    } = {}) {
        super(opts);
        this.img = image;
        this.position = null;
        this.center = opts.center ?? false;
        this.keepDimensions = opts.keepDimensions ?? true;
    }

    private render(ctx: CanvasRenderingContext2D): void {
        let fittedW = this.img.width;
        let fittedH = this.img.height;
        const aspect = this.img.width / this.img.height;

        if (fittedW > ctx.canvas.width) {
            fittedW = ctx.canvas.width;
            fittedH = fittedW / aspect;
        }

        if (fittedH > ctx.canvas.height) {
            fittedH = ctx.canvas.height;
            fittedW = fittedH * aspect;
        }

        const drawW = this.keepDimensions
            ? (this.width === 0 ? fittedW : this.width)
            : fittedW;
        const drawH = this.keepDimensions
            ? (this.height === 0 ? fittedH : this.height)
            : fittedH;

        this.width = drawW;
        this.height = drawH;

        if (this.center || !this.position) {
            this.position = {
                x: (ctx.canvas.width - drawW) / 2,
                y: (ctx.canvas.height - drawH) / 2,
            };
        }

        ctx.drawImage(this.img, this.position.x, this.position.y, drawW, drawH);
    }

    pixelatedDraw(ctx: CanvasRenderingContext2D): void {
        this.render(ctx);
    }

    standardDraw(ctx: CanvasRenderingContext2D): void {
        this.render(ctx);
    }

    contains(p: Point): boolean {
        if (!this.position) return false;

        const w = this.width || this.img.width;
        const h = this.height || this.img.height;

        return (
            p.x >= this.position.x &&
            p.x <= this.position.x + w &&
            p.y >= this.position.y &&
            p.y <= this.position.y + h
        );
    }

    moveBy(dx: number, dy: number): void {
        if (this.position) {
            this.position.x += dx;
            this.position.y += dy;
        }
    }
}