import type { Point } from "./Graphics";
import type { LineAlgorithm } from "../context/PaintContext";
import Line from "../shapes/Line";
import Circle from "../shapes/Circle";
import Octagon from "../shapes/Octagon";
import Hexagon from "../shapes/Hexagon";
import Star from "../shapes/Star";
import Triangle from "../shapes/Triangle";
import Square from "../shapes/Square";
import Rectangle from "../shapes/Rectangle";
import Pentagon from "../shapes/Pentagon";
import Diamond from "../shapes/Diamond";
import Arrow from "../shapes/Arrow";
import Heptagon from "../shapes/Heptagon";

type ShapeGeneratorProps = {
    start: Point;
    end: Point;
    color: string;
    thickness: number;
    kind: string;
    pixelated?: boolean;
    pixelSize?: number;
    lineAlgorithm?: LineAlgorithm;
};

const generator = ({ start, end, color, thickness, kind, pixelated = false, pixelSize = 20, lineAlgorithm = 'bresenham' }: ShapeGeneratorProps) => {
    switch (kind) {
        case "line":
            return new Line(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "square":
            return new Square(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "rect":
            return new Rectangle(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "circle":
            return new Circle(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "arrow":
            return new Arrow(start, end, { 
                strokeStyle: color, 
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "triangle":
            return new Triangle(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "diamond":
            return new Diamond(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "pentagon":
            return new Pentagon(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "hexagon":
            return new Hexagon(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "heptagon":
            return new Heptagon(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "octagon":
            return new Octagon(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        case "star":
            return new Star(start, end, {
                strokeStyle: color,
                lineWidth: thickness,
                pixelated: pixelated,
                pixelSize: pixelSize,
                lineAlgorithm: lineAlgorithm
            });
        default:
            throw new Error(`Unknown shape kind: ${kind}`);
    }
};

export default generator;
