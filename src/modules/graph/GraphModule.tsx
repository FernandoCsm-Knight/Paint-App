const GraphModule = () => {
    return (
        <section className="flex h-full min-h-[70vh] items-center justify-center p-6 lg:p-10">
            <div className="module-card max-w-2xl rounded-[28px] p-8 text-slate-100">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-200">Planned module</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Graph workspace</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                    Use this module for graph editing, adjacency tools, shortest path visualizations, or layout algorithms. The module boundary is already in place, so the implementation can be added here without changing the paint feature.
                </p>
            </div>
        </section>
    );
};

export default GraphModule;
