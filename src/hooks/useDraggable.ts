import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { type Point } from "../types/Graphics";
import type React from "react";

type DraggableHandle = (e: React.PointerEvent<HTMLElement>) => void;

export type DraggableOptions = {
  initial?: Point | "center";
  clamp?: boolean;

  onDragStart?: () => void;
  onDragEnd?: (pos: Point) => void;
};

export type UseDraggableReturn = {
    ref: RefObject<HTMLDivElement>;
    position: Point;
    setPosition: React.Dispatch<React.SetStateAction<Point>>;
    onPointerDown: DraggableHandle;
    style: React.CSSProperties;
}

export const useDraggable = (options: DraggableOptions = {}) => {
    const { initial = { x: 0, y: 0 }, clamp = true, onDragStart, onDragEnd } = options;

    const [position, setPosition] = useState<Point>(() => (initial === "center" ? { x: 0, y: 20 } : initial));
    const targetRef = useRef<HTMLDivElement | null>(null);
    const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
    const posRef = useRef<Point>(position);

    const clampToViewport = useCallback((x: number, y: number): Point => {
        if (!clamp) return { x, y };
        const el = targetRef.current;
        const w = el?.offsetWidth ?? 0;
        const h = el?.offsetHeight ?? 0;
        const maxX = Math.max(0, window.innerWidth - w);
        const maxY = Math.max(0, window.innerHeight - h);
        return {
            x: Math.min(Math.max(0, x), maxX),
            y: Math.min(Math.max(0, y), maxY),
        };
    }, [clamp]);

    useEffect(() => {
        posRef.current = position;
    }, [position]);

    useEffect(() => {
        if (initial !== "center") return;
        const el = targetRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, Math.round(window.innerWidth / 2 - rect.width / 2));
        const y = 20; 
        setPosition({ x, y });
    }, [initial]);

    useEffect(() => {
        const element = targetRef.current;
        if (!element) return;

        const adjustPosition = () => {
            setPosition((prev: Point) => clampToViewport(prev.x, prev.y));
        };

        const resizeObserver = new ResizeObserver(() => {
            adjustPosition();
        });

        resizeObserver.observe(document.body);

        return () => resizeObserver.disconnect();
    }, [clampToViewport]);

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
            const nx = ev.clientX - dragOffsetRef.current.dx;
            const ny = ev.clientY - dragOffsetRef.current.dy;
            const next = clampToViewport(nx, ny);
            setPosition(next);
        };

        const handlePointerUp = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            onDragEnd?.(posRef.current);
        };

        onDragStart?.();
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    }, [clampToViewport, onDragEnd, onDragStart]);

    return {
        ref: targetRef as RefObject<HTMLDivElement>,
        position,
        setPosition,
        onPointerDown,
        style: { left: position.x, top: position.y } as const,
    };
};
