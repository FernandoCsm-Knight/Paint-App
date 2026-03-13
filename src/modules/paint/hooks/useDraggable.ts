import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { type Point } from "../types/Graphics";
import type React from "react";

type DraggableHandle = (e: React.PointerEvent<HTMLElement>) => void;

export type DraggableOptions = {
  initial?: () => Point;
  clamp?: boolean;
  axis?: "x" | "y" | "both";
  referenceFrame?: "viewport" | "offsetParent";

  onDragStart?: () => void;
  onDragEnd?: (pos: Point) => void;
  onDrag?: (pos: Point) => void;
  onResize?: (prev: Point) => Point;
  onScroll?: (prev: Point) => Point;
};

export type UseDraggableReturn = {
    ref: RefObject<HTMLDivElement>;
    position: Point;
    setPosition: React.Dispatch<React.SetStateAction<Point>>;
    onPointerDown: DraggableHandle;
    style: React.CSSProperties;
}

export const useDraggable = (options: DraggableOptions = {}) => {
    const { initial, clamp = true, axis = "both", referenceFrame = "viewport", onDragStart, onDragEnd, onDrag, onResize, onScroll } = options;

    const initialPos: Point = initial ? initial() : { x: 0, y: 20 }; 

    const [position, setPosition] = useState<Point>(initialPos);
    const targetRef = useRef<HTMLDivElement | null>(null);
    const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

    const getBoundsRect = useCallback(() => {
        const el = targetRef.current;
        const parent = el?.offsetParent;

        if(referenceFrame === "offsetParent" && parent instanceof HTMLElement) {
            const rect = parent.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
                width: parent.clientWidth,
                height: parent.clientHeight,
            };
        }

        return {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }, [referenceFrame]);

    const clampToBounds = useCallback((x: number, y: number): Point => {
        if (!clamp) return { x, y };
        const el = targetRef.current;
        const w = el?.offsetWidth ?? 0;
        const h = el?.offsetHeight ?? 0;

        const bounds = getBoundsRect();
        const minX = referenceFrame === "viewport" ? window.scrollX || window.pageXOffset : 0;
        const minY = referenceFrame === "viewport" ? window.scrollY || window.pageYOffset : 0;
        const maxX = minX + bounds.width - w;
        const maxY = minY + bounds.height - h;
        
        return {
            x: Math.min(Math.max(minX, x), maxX),
            y: Math.min(Math.max(minY, y), maxY),
        };
    }, [clamp, getBoundsRect, referenceFrame]);

    useEffect(() => {
        if (initial) return;
        const el = targetRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();

        const bounds = getBoundsRect();
        const baseX = referenceFrame === "viewport" ? window.scrollX || window.pageXOffset : 0;
        const baseY = referenceFrame === "viewport" ? window.scrollY || window.pageYOffset : 0;
        const x = baseX + Math.max(0, Math.round(bounds.width / 2 - rect.width / 2));
        const y = baseY + 20;
        setPosition({ x, y });
    }, [initial, getBoundsRect, referenceFrame]);

    useEffect(() => {
        const element = targetRef.current;
        if (!element) return;

        const handleWindowResize = () => {
            setPosition((prev: Point) => (onResize) ? onResize(prev) : clampToBounds(prev.x, prev.y));
        };

        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, [clampToBounds, onResize]);

    useEffect(() => {
        const element = targetRef.current;
        if (!element) return;

        const handleWindowScroll = () => {
            setPosition((prev: Point) => (onScroll) ? onScroll(prev) : clampToBounds(prev.x, prev.y));
        };

        window.addEventListener('scroll', handleWindowScroll);
        return () => window.removeEventListener('scroll', handleWindowScroll);
    }, [clampToBounds, onScroll]);

    const onPointerDown: DraggableHandle = useCallback((e) => {
        e.preventDefault();
        const el = targetRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        
        dragOffsetRef.current = {
            dx: e.clientX - rect.left,
            dy: e.clientY - rect.top,
        };

        const handlePointerMove = (ev: PointerEvent) => {
            const bounds = getBoundsRect();
            const currentScrollX = window.scrollX || window.pageXOffset;
            const currentScrollY = window.scrollY || window.pageYOffset;

            let nx = referenceFrame === "viewport"
                ? ev.clientX + currentScrollX - dragOffsetRef.current.dx
                : ev.clientX - bounds.left - dragOffsetRef.current.dx;
            let ny = referenceFrame === "viewport"
                ? ev.clientY + currentScrollY - dragOffsetRef.current.dy
                : ev.clientY - bounds.top - dragOffsetRef.current.dy;

            if(axis === "x") ny = position.y;
            else if (axis === "y") nx = position.x;

            const next = clampToBounds(nx, ny);
            setPosition(next);
            onDrag?.(next);
        };

        const handlePointerUp = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            onDragEnd?.(position);
        };

        onDragStart?.();
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    }, [getBoundsRect, referenceFrame, clampToBounds, onDragEnd, onDragStart, axis, onDrag, position]);

    return {
        ref: targetRef as RefObject<HTMLDivElement>,
        position,
        setPosition,
        onPointerDown,
        style: { left: position.x, top: position.y } as const,
    };
};
