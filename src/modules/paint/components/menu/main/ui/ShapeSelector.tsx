import { useContext, useCallback } from "react";
import { MenuContext } from "../../../../context/MenuContext";
import PaintButton from "../../../PaintButton";
import {
    LuCircle,
    LuSquare,
    LuTriangle,
    LuHexagon,
    LuOctagon,
    LuDiamond,
    LuPentagon,
    LuStar,
    LuRectangleHorizontal,
    LuArrowUpRight,
    LuSlash,
} from "react-icons/lu";
import { PaintContext } from "../../../../context/PaintContext";
import type { Geometric, Point } from "../../../../types/Graphics";
import { BsHeptagon } from "react-icons/bs";
import { TbOvalVertical } from "react-icons/tb";
import GlassCard from "./GlassCard";

const ShapeSelector = () => {
    const { shapeButtonRef } = useContext(MenuContext)!;
    const { selectedShape, setSelectedShape, setPanModeActive, setFill, setSelectionActive } = useContext(PaintContext)!;

    const getInitialPos = (): Point => {
        const btn = shapeButtonRef.current;
        if (!btn) return { x: 0, y: 60 };
        const btnRect = btn.getBoundingClientRect();
        const offsetParent = btn.offsetParent instanceof HTMLElement ? btn.offsetParent : document.documentElement;
        const parentRect = offsetParent.getBoundingClientRect();
        return {
            x: btnRect.left - parentRect.left,
            y: btnRect.bottom - parentRect.top + 10
        };
    };

    const onSelect = useCallback((key: Geometric) => {
        const next = selectedShape !== key ? key : 'freeform';
        setSelectedShape(next);
        if (next !== 'freeform') {
            setPanModeActive(false);
            setFill(false);
            setSelectionActive(false);
        }
    }, [selectedShape, setSelectedShape, setPanModeActive, setFill, setSelectionActive]);

    return (
        <GlassCard initial={getInitialPos}>
            <div className="p-[var(--pm-pad)]">
                <div className="paint-floating-card-inner shadow-lg rounded-xl overflow-hidden p-[var(--pm-btn-pad)]">
                    <div className="scrollbar overflow-y-auto grid grid-cols-3 gap-[var(--pm-gap)] p-[var(--pm-btn-pad)] max-h-[clamp(7rem,20vh,10.25rem)]">
                        {[
                            { key: 'circle', icon: <LuCircle className="paint-icon" /> },
                            { key: 'square', icon: <LuSquare className="paint-icon" /> },
                            { key: 'triangle', icon: <LuTriangle className="paint-icon" /> },
                            { key: 'diamond', icon: <LuDiamond className="paint-icon" /> },
                            { key: 'pentagon', icon: <LuPentagon className="paint-icon" /> },
                            { key: 'hexagon', icon: <LuHexagon className="paint-icon" /> },
                            { key: 'heptagon', icon: <BsHeptagon className="paint-icon"/>},
                            { key: 'octagon', icon: <LuOctagon className="paint-icon" /> },
                            { key: 'star', icon: <LuStar className="paint-icon" /> },
                            { key: 'rect', icon: <LuRectangleHorizontal className="paint-icon" /> },
                            { key: 'ellipse', icon: <TbOvalVertical className="paint-icon" />}
                        ].map(({ key, icon }) => (
                            <PaintButton
                                key={key}
                                ariaLabel={`Selecionar forma ${key}`}
                                onClick={() => onSelect(key as Geometric)}
                                active={selectedShape === key}
                                stayActive
                            >
                                {icon}
                            </PaintButton>
                        ))}
                    </div>
                </div>
                <div className="mt-[var(--pm-gap)] flex items-center justify-center gap-[var(--pm-gap)]">
                    <PaintButton
                        ariaLabel="Selecionar reta"
                        onClick={() => onSelect('line')}
                        active={selectedShape === 'line'}
                        stayActive
                    >
                        <LuSlash className="paint-icon" /> 
                    </PaintButton>
                    <PaintButton
                        ariaLabel="Selecionar seta diagonal"
                        onClick={() => onSelect('arrow')}
                        active={selectedShape === 'arrow'}
                        stayActive
                    >
                        <LuArrowUpRight className="paint-icon" />
                    </PaintButton>
                </div>
            </div>
        </GlassCard>
    );
};

export default ShapeSelector;
