/**
 * A placed image in the scene graph.
 *
 * Stores an HTMLImageElement with its position and dimensions on the document
 * canvas. Like SnapshotShape, it does NOT extend Shape — images have no
 * stroke/fill/lineWidth/pixelated semantics.
 *
 * The `kind` field mirrors the 'image' Geometric type so consumers can
 * discriminate ImageShape from SnapshotShape when needed.
 */
export default class ImageShape {
    readonly kind = 'image' as const;
    readonly image: HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(
        image: HTMLImageElement,
        x: number,
        y: number,
        width: number,
        height: number,
    ) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    moveBy(dx: number, dy: number): void {
        this.x += dx;
        this.y += dy;
    }
}
