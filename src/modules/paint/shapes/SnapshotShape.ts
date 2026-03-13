/**
 * A rasterized checkpoint in the scene graph.
 *
 * Expensive-to-replay operations — freeform strokes, flood fill, eraser
 * strokes — are baked into a SnapshotShape on pointer-up instead of storing
 * thousands of intermediate points.  When the scene is replayed (e.g. after
 * undo), putImageData restores the full canvas state in O(pixels) rather than
 * re-running the original algorithm.
 *
 * SnapshotShape deliberately does NOT extend the abstract Shape class: it has
 * no start/end geometry, no moveBy(), and no pixelated/standard distinction.
 * The scene array holds the union type  Shape | SnapshotShape  (SceneItem).
 */
export default class SnapshotShape {
    readonly snapshot: ImageData;

    constructor(snapshot: ImageData) {
        this.snapshot = snapshot;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.putImageData(this.snapshot, 0, 0);
    }
}
