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
            <div className="px-3 pt-3 sm:px-4 sm:pt-4">
                <div className="paint-floating-card-inner shadow-lg rounded-xl overflow-hidden p-3">
                    <div className="scrollbar overflow-y-auto grid grid-cols-3 gap-2 py-2 sm:py-3 pr-2 sm:pr-3 pl-2 sm:pl-3 sm:gap-3 max-h-28 sm:max-h-41">
                        {[
                            { key: 'circle', icon: <LuCircle className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'square', icon: <LuSquare className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'triangle', icon: <LuTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'diamond', icon: <LuDiamond className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'pentagon', icon: <LuPentagon className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'hexagon', icon: <LuHexagon className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'heptagon', icon: <BsHeptagon className="w-4 h-4 sm:w-5 sm:h-5"/>},
                            { key: 'octagon', icon: <LuOctagon className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'star', icon: <LuStar className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'rect', icon: <LuRectangleHorizontal className="w-4 h-4 sm:w-5 sm:h-5" /> },
                            { key: 'ellipse', icon: <TbOvalVertical className="w-4 h-4 sm:w-5 sm:h-5" />}
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
                <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-3">
                    <PaintButton
                        ariaLabel="Selecionar reta"
                        onClick={() => onSelect('line')}
                        active={selectedShape === 'line'}
                        stayActive
                    >
                        <LuSlash className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    </PaintButton>
                    <PaintButton
                        ariaLabel="Selecionar seta diagonal"
                        onClick={() => onSelect('arrow')}
                        active={selectedShape === 'arrow'}
                        stayActive
                    >
                        <LuArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </PaintButton>
                </div>
            </div>
        </GlassCard>
    );
};

export default ShapeSelector;
