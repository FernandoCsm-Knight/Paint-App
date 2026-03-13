# Graphic-Paint

Graphic-Paint is a reorganized version of the original paint prototype. The current app ships with one fully working module, `paint`, which contains the two existing drawing modes:

- smooth painting
- pixelated painting

The project is now structured so new graphics tools can be added as independent modules without mixing their code into the paint implementation.

## Structure

```text
src/
  app/                 # top-level shell and module registry
  modules/
    paint/             # current drawing feature and canvas engine
    graph/             # placeholder for future graph tooling
    automaton/         # placeholder for future automaton tooling
```

## Extension model

To add a new tool in the future:

1. Create a folder in `src/modules/<tool-name>/`.
2. Export a module surface component from that folder.
3. Register it in `src/app/modules.tsx`.

This keeps each graphics tool isolated while the main shell handles navigation and presentation.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
