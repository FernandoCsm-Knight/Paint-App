const AutomatonModule = () => {
    return (
        <section className="flex h-full min-h-[70vh] items-center justify-center p-6 lg:p-10">
            <div className="module-card max-w-2xl rounded-[28px] p-8 text-slate-100">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200">Planned module</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Automaton workspace</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                    This area is reserved for automata editors, state transitions, and validation workflows. Build the new feature here and register it once it has its own module surface and internal state.
                </p>
            </div>
        </section>
    );
};

export default AutomatonModule;
