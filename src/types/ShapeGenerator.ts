import type { Point } from "./ShapeTypes";
import { Line, Rectangle, Circle, Square, Arrow, Triangle, Diamond, Pentagon, Hexagon, Octagon, Star } from "./ShapeGenerators";

type ShapeGeneratorProps = {
    start: Point;
    end: Point;
    color: string;
    thickness: number;
    kind: string;
    pixelated?: boolean;
    pixelSize?: number;
};

const generator = ({ start, end, color, thickness, kind, pixelated = false, pixelSize = 20 }: ShapeGeneratorProps) => {
    switch (kind) {
        case "line":
            return new Line(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "square":
            return new Square(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "rect":
            return new Rectangle(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "circle":
            return new Circle(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "arrow":
            return new Arrow(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "triangle":
            return new Triangle(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "diamond":
            return new Diamond(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "pentagon":
            return new Pentagon(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "hexagon":
            return new Hexagon(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "octagon":
            return new Octagon(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        case "star":
            return new Star(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize
            });
        default:
            throw new Error(`Unknown shape kind: ${kind}`);
    }
};

export default generator;
