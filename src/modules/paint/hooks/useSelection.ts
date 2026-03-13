import { useCallback, useContext, useRef } from "react";
import { PaintContext } from "../context/PaintContext";
import type { Point } from "../types/Graphics";
import { ReplacementContext } from "../context/ReplacementContext";
import { SettingsContext } from "../context/SettingsContext";
import { ClipboardImageLoader } from "../utils/ClipboardImageLoader";

const useSelection = () => {
    const {
        contextRef,
        pixelated,
        renderViewport,
    } = useContext(PaintContext)!;

    const { pixelSize } = useContext(SettingsContext)!;
    const { replacementContextRef } = useContext(ReplacementContext)!;

    const selectionStart = useRef<Point | null>(null);
    const selectionEnd = useRef<Point | null>(null);

    const snap = useCallback((value: number): number => {
        return pixelated ? Math.floor(value / pixelSize) * pixelSize : value;
    }, [pixelated, pixelSize]);

    const drawSelectionRect = useCallback((x: number, y: number, w: number, h: number) => {
        const overlay = replacementContextRef.current;
        if (!overlay) return;

        const sx = snap(x);
        const sy = snap(y);

        // renderViewport updates the viewport AND clears+redraws the grid on the overlay.
        // Drawing the selection rect AFTER renderViewport ensures it appears on top of the grid.
        renderViewport();

        overlay.save();
        overlay.setLineDash([4, 4]);
        overlay.lineWidth = 1;
        overlay.strokeStyle = '#1d4ed8';
        overlay.fillStyle = 'rgba(59,130,246,0.15)';
        overlay.beginPath();
        overlay.rect(sx, sy, w, h);
        overlay.fill();
        overlay.stroke();
        overlay.restore();
    }, [replacementContextRef, snap, renderViewport]);

    const clearSelectionOverlay = useCallback(() => {
        // renderViewport already clears the overlay and redraws the grid
        renderViewport();
    }, [renderViewport]);

    const startSelection = useCallback((point: Point) => {
        const snappedPoint = { x: snap(point.x), y: snap(point.y) };
        selectionStart.current = snappedPoint;
        selectionEnd.current = snappedPoint;
        drawSelectionRect(snappedPoint.x, snappedPoint.y, 1, 1);
    }, [snap, drawSelectionRect]);

    const updateSelection = useCallback((point: Point) => {
        if (selectionStart.current) {
            const nx = snap(point.x);
            const ny = snap(point.y);
            selectionEnd.current = { x: nx, y: ny };
            const sx = Math.min(selectionStart.current.x, nx);
            const sy = Math.min(selectionStart.current.y, ny);
            const w = Math.abs(nx - selectionStart.current.x);
            const h = Math.abs(ny - selectionStart.current.y);
            drawSelectionRect(sx, sy, w, h);
        }
    }, [snap, drawSelectionRect]);

    const stopSelection = useCallback(() => {
        const ctx = contextRef.current;
        if (ctx && selectionStart.current && selectionEnd.current) {
            const sx = Math.min(selectionStart.current.x, selectionEnd.current.x);
            const sy = Math.min(selectionStart.current.y, selectionEnd.current.y);
            const sw = Math.abs(selectionEnd.current.x - selectionStart.current.x);
            const sh = Math.abs(selectionEnd.current.y - selectionStart.current.y);

            if (sw > 1 && sh > 1) {
                const imageData = ctx.getImageData(sx, sy, sw, sh);
                const temp = document.createElement('canvas');
                temp.width = sw;
                temp.height = sh;
                const tctx = temp.getContext('2d');
                if (tctx) {
                    tctx.putImageData(imageData, 0, 0);
                    temp.toBlob(async (blob) => {
                        if (!blob) return;
                        try {
                            await ClipboardImageLoader.copyImageToClipboard(blob);
                            alert('Seleção copiada para a área de transferência');
                        } catch {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'recorte.png';
                            a.click();
                            URL.revokeObjectURL(url);
                        } finally {
                            clearSelectionOverlay();
                        }
                    }, 'image/png');
                }
            }
        }

        selectionStart.current = null;
        selectionEnd.current = null;
        renderViewport();
    }, [clearSelectionOverlay, contextRef, renderViewport]);

    return {
        startSelection,
        updateSelection,
        stopSelection,
    };
};

export default useSelection;
