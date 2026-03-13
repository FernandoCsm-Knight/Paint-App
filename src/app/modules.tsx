import type { ComponentType } from 'react';
import AutomatonModule from '../modules/automaton/AutomatonModule';
import GraphModule from '../modules/graph/GraphModule';
import PaintModule from '../modules/paint';

export type GraphicsModule = {
    id: string;
    name: string;
    description: string;
    summary: string;
    status: 'available' | 'planned';
    surface: ComponentType;
};

export const graphicsModules: GraphicsModule[] = [
    {
        id: 'paint',
        name: 'Paint',
        description: 'Canvas drawing with smooth and pixelated modes, shape tools, filling, selection, and history.',
        summary: 'The existing prototype now lives in its own module, so new graphics work can be added without tangling with paint state and rendering code.',
        status: 'available',
        surface: PaintModule,
    },
    {
        id: 'graph',
        name: 'Graph',
        description: 'Reserved workspace for graph creation, editing, and visual algorithms.',
        summary: 'This module is a placeholder. Add graph-specific UI, state, and algorithms inside src/modules/graph when you are ready to implement it.',
        status: 'planned',
        surface: GraphModule,
    },
    {
        id: 'automaton',
        name: 'Automaton',
        description: 'Reserved workspace for finite automata, state diagrams, and formal-language tooling.',
        summary: 'This module is a placeholder. Add automaton-specific editors and validators inside src/modules/automaton without touching paint internals.',
        status: 'planned',
        surface: AutomatonModule,
    },
];
