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

    draw(ctx: CanvasRenderingContext2D) {
        let width = this.img.width;
        let height = this.img.height;

        const aspectRatio = this.img.width / this.img.height;

        if(width > ctx.canvas.width) {
            width = ctx.canvas.width;
            height = width / aspectRatio;
        }

        if(height > ctx.canvas.height) {
            height = ctx.canvas.height;
            width = height * aspectRatio;
        }

        if(this.width === 0 && this.height === 0 && this.keepDimensions) {
            this.width = width;
            this.height = height;
        }

        if(this.center || !this.position) {
            this.position = {
                x: (ctx.canvas.width - width) / 2,
                y: (ctx.canvas.height - height) / 2
            };
        }

        if(this.keepDimensions) {
            ctx.drawImage(this.img, this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.drawImage(this.img, this.position.x, this.position.y, width, height);
        }
    }

    contains(p: Point): boolean {
        return this.position !== null && (
            p.x >= this.position.x &&
            p.x <= this.position.x + this.img.width &&
            p.y >= this.position.y &&
            p.y <= this.position.y + this.img.height
        );
    }

    moveBy(dx: number, dy: number): void {
        if (this.position) {
            this.position.x += dx;
            this.position.y += dy;
        }
    }
}