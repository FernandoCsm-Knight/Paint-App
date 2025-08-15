import { useContext, useState, useCallback } from "react";
import GlassCard from "./GlassCard";
import { MenuContext } from "../../context/MenuContext";
import PaintButton from "../PaintButton";
import {
    Circle,
    Square,
    Triangle,
    Hexagon,
    Octagon,
    Diamond,
    Pentagon,
    Star,
    RectangleHorizontal,
    ArrowUpRight,
    Slash,
} from "lucide-react";
import { PaintContext } from "../../context/PaintContext";
import type { Geometric } from "../../types/ShapeTypes";

const ShapeSelector = () => {
    const { shapeButtonRef } = useContext(MenuContext)!;
    const {x, y} = shapeButtonRef.current?.getBoundingClientRect() ?? { x: 0, y: 0 };
    const height = shapeButtonRef.current?.offsetHeight ?? 0;

    const { selectedShape } = useContext(PaintContext)!;

    const [selected, setSelected] = useState<Geometric>(selectedShape.current);
    const onSelect = useCallback((key: Geometric) => {
        if(selected !== key) {
            setSelected(key);
            selectedShape.current = key;
        } else {
            setSelected('freeform');
            selectedShape.current = 'freeform';
        }
    }, [selected]);

    return (
        <GlassCard initial={{ x: x, y: y + height + 10 }}>
            <div className="px-3 pt-3 sm:px-4 sm:pt-4">
                <div className="p-3 bg-gray-200 shadow-lg rounded-xl grid grid-cols-3 gap-2 sm:gap-3 max-h-48 sm:max-h-50 overflow-y-auto">
                    {[
                        { key: 'circle', icon: <Circle className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { key: 'square', icon: <Square className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { key: 'triangle', icon: <Triangle className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { key: 'diamond', icon: <Diamond className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { key: 'pentagon', icon: <Pentagon className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { key: 'hexagon', icon: <Hexagon className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { key: 'octagon', icon: <Octagon className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { key: 'star', icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" /> },
                        { key: 'rect', icon: <RectangleHorizontal className="w-4 h-4 sm:w-5 sm:h-5" /> }
                    ].map(({ key, icon }) => (
                        <PaintButton
                            key={key}
                            ariaLabel={`Selecionar forma ${key}`}
                            onClick={() => onSelect(key as Geometric)}
                            active={selected === key}
                            stayActive
                        >
                            {icon}
                        </PaintButton>
                    ))}
                </div>
                <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 sm:gap-3">
                    <PaintButton
                        ariaLabel="Selecionar reta"
                        onClick={() => onSelect('line')}
                        active={selected === 'line'}
                        stayActive
                    >
                        <Slash className="w-4 h-4 sm:w-5 sm:h-5" /> 
                    </PaintButton>
                    <PaintButton
                        ariaLabel="Selecionar seta diagonal"
                        onClick={() => onSelect('arrow')}
                        active={selected === 'arrow'}
                        stayActive
                    >
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </PaintButton>
                </div>
            </div>
        </GlassCard>
    );
};

export default ShapeSelector;