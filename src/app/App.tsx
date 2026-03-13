import { startTransition, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { LuChevronLeft, LuChevronRight, LuMenu, LuPanelsTopLeft } from 'react-icons/lu';
import { graphicsModules } from './modules';

type Ripple = {
    controlId: string;
    key: number;
    x: number;
    y: number;
};

const App = () => {
    const [activeModuleId, setActiveModuleId] = useState('paint');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [pressedControl, setPressedControl] = useState<string | null>(null);
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const feedbackTimeoutRef = useRef<number | null>(null);
    const rippleTimeoutsRef = useRef<number[]>([]);

    const activeModule = graphicsModules.find((module) => module.id === activeModuleId) ?? graphicsModules[0];
    const ActiveSurface = activeModule.surface;
    const availableModules = useMemo(
        () => graphicsModules.filter((module) => module.status === 'available'),
        [],
    );

    const triggerControlFeedback = (controlId: string, callback: () => void) => {
        setPressedControl(controlId);
        callback();

        if (feedbackTimeoutRef.current !== null) {
            window.clearTimeout(feedbackTimeoutRef.current);
        }

        feedbackTimeoutRef.current = window.setTimeout(() => {
            setPressedControl((current) => (current === controlId ? null : current));
            feedbackTimeoutRef.current = null;
        }, 260);
    };

    const spawnRipple = (controlId: string, event: MouseEvent<HTMLButtonElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const key = window.performance.now();
        const timeoutId = window.setTimeout(() => {
            setRipples((current) => current.filter((ripple) => ripple.key !== key));
            rippleTimeoutsRef.current = rippleTimeoutsRef.current.filter((id) => id !== timeoutId);
        }, 620);

        rippleTimeoutsRef.current.push(timeoutId);
        setRipples((current) => [
            ...current,
            {
                controlId,
                key,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            },
        ]);
    };

    const renderRipples = (controlId: string) =>
        ripples
            .filter((ripple) => ripple.controlId === controlId)
            .map((ripple) => (
                <span
                    key={ripple.key}
                    className="click-ripple"
                    style={{ left: ripple.x, top: ripple.y }}
                />
            ));

    useEffect(() => {
        return () => {
            if (feedbackTimeoutRef.current !== null) {
                window.clearTimeout(feedbackTimeoutRef.current);
            }

            rippleTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
        };
    }, []);

    return (
        <div className="h-screen overflow-hidden">
            <div className="flex h-full min-h-0">
                <div
                    className={`theme-sidebar-overlay fixed inset-0 z-30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
                        isMobileSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    onClick={() => setIsMobileSidebarOpen(false)}
                />

                <aside
                    className={`app-sidebar-shell theme-sidebar-shell fixed inset-y-0 left-0 z-40 flex h-screen w-[min(86vw,340px)] flex-col overflow-x-hidden border-r backdrop-blur-xl lg:static lg:z-auto lg:translate-x-0 ${
                        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${isSidebarCollapsed ? 'lg:w-24' : 'lg:w-80'}`}
                >
                    <div className={`border-b border-slate-800/80 ${isSidebarCollapsed ? 'px-4 py-4 lg:px-3 lg:py-3' : 'px-4 py-4 lg:px-5'}`}>
                        <div className={`items-start justify-between gap-3 ${isSidebarCollapsed ? 'lg:hidden' : 'flex'}`}>
                            <div>
                                <p className="theme-sidebar-kicker text-xs font-semibold uppercase tracking-[0.35em]">Graphic-Paint</p>
                                <h1 className="theme-sidebar-title mt-2 text-2xl font-semibold">Graphics workspace</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        spawnRipple('sidebar-collapse', event);
                                        triggerControlFeedback('sidebar-collapse', () => {
                                            if (window.innerWidth < 1024) {
                                                setIsMobileSidebarOpen(false);
                                                return;
                                            }

                                            setIsSidebarCollapsed((current) => !current);
                                        });
                                    }}
                                    className={`sidebar-toggle ${pressedControl === 'sidebar-collapse' ? 'sidebar-toggle-pressed' : ''}`}
                                    aria-label={isMobileSidebarOpen ? 'Fechar barra lateral' : isSidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                                >
                                    {isMobileSidebarOpen || !isSidebarCollapsed ? <LuChevronLeft className="h-5 w-5" /> : <LuChevronRight className="h-5 w-5" />}
                                    {renderRipples('sidebar-collapse')}
                                </button>
                            </div>
                        </div>

                        <div className={`${isSidebarCollapsed ? 'hidden lg:flex lg:flex-col lg:items-center lg:gap-3' : 'hidden'}`}>
                            <div className="theme-sidebar-brand-mark flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold uppercase tracking-[0.2em]">
                                G
                            </div>
                            <button
                                type="button"
                                onClick={(event) => {
                                    spawnRipple('sidebar-collapse', event);
                                    triggerControlFeedback('sidebar-collapse', () => {
                                        setIsSidebarCollapsed(false);
                                    });
                                }}
                                className={`sidebar-toggle ${pressedControl === 'sidebar-collapse' ? 'sidebar-toggle-pressed' : ''}`}
                                aria-label="Expandir barra lateral"
                            >
                                <LuChevronRight className="h-5 w-5" />
                                {renderRipples('sidebar-collapse')}
                            </button>
                        </div>
                    </div>

                    <div className="scrollbar flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 lg:px-5">
                        <div className="space-y-6">
                            <div className={`sidebar-panel-copy space-y-3 ${isSidebarCollapsed ? 'lg:pointer-events-none lg:max-h-0 lg:-translate-y-2 lg:opacity-0' : 'lg:max-h-28 lg:translate-y-0 lg:opacity-100'}`}>
                                <p className="theme-sidebar-copy text-sm leading-6">
                                    The app shell is separated from each graphics tool. Add future features as modules instead of folding everything into one canvas implementation.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className={`sidebar-panel-copy theme-sidebar-copy-muted flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] ${isSidebarCollapsed ? 'lg:pointer-events-none lg:max-h-0 lg:-translate-y-2 lg:opacity-0' : 'lg:max-h-10 lg:translate-y-0 lg:opacity-100'}`}>
                                    <LuPanelsTopLeft className="h-4 w-4" />
                                    Modules
                                </div>

                                {graphicsModules.map((module) => {
                                    const isActive = module.id === activeModule.id;
                                    const controlId = `module-${module.id}`;

                                    return (
                                        <button
                                            key={module.id}
                                            type="button"
                                            onClick={(event) => {
                                                spawnRipple(controlId, event);
                                                triggerControlFeedback(controlId, () => {
                                                    startTransition(() => setActiveModuleId(module.id));
                                                    setIsMobileSidebarOpen(false);
                                                });
                                            }}
                                            className={`module-card module-card-button w-full rounded-3xl text-left transition duration-200 ${
                                                isSidebarCollapsed
                                                    ? 'lg:flex lg:min-h-16 lg:items-center lg:justify-center lg:px-0 lg:py-4'
                                                    : 'px-4 py-4'
                                            } ${
                                                isActive
                                                    ? 'theme-module-card-active ring-1'
                                                    : 'theme-module-card-idle'
                                            } ${pressedControl === controlId ? 'module-card-pressed' : ''}`}
                                            aria-label={isSidebarCollapsed ? `Abrir modulo ${module.name}` : undefined}
                                            title={isSidebarCollapsed ? module.name : undefined}
                                        >
                                            {isSidebarCollapsed ? (
                                                <span className={`text-sm font-semibold uppercase tracking-[0.28em] ${isActive ? 'theme-module-accent-text' : 'theme-sidebar-copy-muted'}`}>
                                                    {module.name.slice(0, 2)}
                                                </span>
                                            ) : (
                                                <>
                                                    <div className="mb-2 flex items-center justify-between gap-3">
                                                        <span className="theme-sidebar-title text-lg font-medium">{module.name}</span>
                                                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${
                                                            module.status === 'available'
                                                                ? 'theme-status-available'
                                                                : 'theme-status-soon'
                                                        }`}>
                                                            {module.status}
                                                        </span>
                                                    </div>
                                                    <p className="theme-sidebar-copy text-sm leading-6">{module.description}</p>
                                                </>
                                            )}
                                            {renderRipples(controlId)}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className={`sidebar-panel-copy overflow-hidden ${isSidebarCollapsed ? 'lg:pointer-events-none lg:max-h-0 lg:-translate-y-2 lg:opacity-0' : 'lg:max-h-56 lg:translate-y-0 lg:opacity-100'}`}>
                                <div className="module-card theme-current-module-card rounded-3xl p-4">
                                    <p className="theme-sidebar-copy-muted text-xs font-semibold uppercase tracking-[0.28em]">Current module</p>
                                    <h2 className="theme-sidebar-title mt-2 text-xl font-semibold">{activeModule.name}</h2>
                                    <p className="theme-sidebar-copy mt-2 text-sm leading-6">{activeModule.summary}</p>
                                </div>
                            </div>

                            {availableModules.length > 0 && (
                                <div className={`sidebar-panel-copy overflow-hidden ${isSidebarCollapsed ? 'lg:pointer-events-none lg:max-h-0 lg:-translate-y-2 lg:opacity-0' : 'lg:max-h-40 lg:translate-y-0 lg:opacity-100'}`}>
                                    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/35 p-4">
                                        <p className="theme-sidebar-copy-muted text-xs font-semibold uppercase tracking-[0.28em]">Available now</p>
                                        <p className="theme-sidebar-copy mt-2 text-sm leading-6">
                                            {availableModules.map((module) => module.name).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                <main className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4 lg:hidden">
                        <button
                            type="button"
                            onClick={(event) => {
                                spawnRipple('mobile-open', event);
                                triggerControlFeedback('mobile-open', () => setIsMobileSidebarOpen(true));
                            }}
                            className={`sidebar-toggle ${pressedControl === 'mobile-open' ? 'sidebar-toggle-pressed' : ''}`}
                            aria-label="Abrir menu lateral"
                        >
                            <LuMenu className="h-5 w-5" />
                            {renderRipples('mobile-open')}
                        </button>
                        <div className="theme-mobile-pill rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] backdrop-blur-xl">
                            {activeModule.name}
                        </div>
                    </div>

                    <div className="theme-workspace-gradient absolute inset-0" />
                    <div className="relative h-full min-h-0 pt-16 lg:pt-0">
                        <ActiveSurface />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
