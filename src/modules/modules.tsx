import type { ComponentType } from 'react';
import AutomatonModule from './automaton/AutomatonModule';
import GraphModule from './graph/GraphModule';
import PaintModule from './paint/PaintModule';

export type GraphicsModule = {
    id: string;
    name: string;
    description: string;
    status: 'available' | 'planned';
    surface: ComponentType;
};

export const graphicsModules: GraphicsModule[] = [
    {
        id: 'paint',
        name: 'Paint',
        description: 'Canvas drawing with smooth and pixelated modes, shape tools, filling, selection, and history.',
        status: 'available',
        surface: PaintModule,
    },
    {
        id: 'graph',
        name: 'Graph',
        description: 'Reserved workspace for graph creation, editing, and visual algorithms.',
        status: 'planned',
        surface: GraphModule,
    },
    {
        id: 'automaton',
        name: 'Automaton',
        description: 'Reserved workspace for finite automata, state diagrams, and formal-language tooling.',
        status: 'planned',
        surface: AutomatonModule,
    },
];
