import { useContext, useEffect, useRef, useState } from 'react';
import { LuPause, LuPlay, LuSkipBack, LuSkipForward } from 'react-icons/lu';
import GlassCard from '../../../components/GlassCard';
import WorkspaceToolButton from '../../../components/WorkspaceToolButton';
import { GraphContext } from '../context/GraphContext';

const GraphPlayerCard = () => {
    const graph = useContext(GraphContext);

    const [isPlaying, setIsPlaying] = useState(false);
    const [intervalMs, setIntervalMs] = useState(800);

    if (!graph) return null;

    const { lastRun, stepIndex, setStepIndex } = graph;
    const stepCount = lastRun?.steps.length ?? 0;
    const currentStep = stepIndex ?? 0;
    const isAtStart = currentStep <= 0;
    const isAtEnd = currentStep >= stepCount - 1;

    const stepIndexRef = useRef(stepIndex);
    stepIndexRef.current = stepIndex;

    // Auto-play loop
    useEffect(() => {
        if (!isPlaying) return;

        const timer = setInterval(() => {
            const next = (stepIndexRef.current ?? -1) + 1;
            if (next >= stepCount) {
                setIsPlaying(false);
                setStepIndex(stepCount - 1);
            } else {
                setStepIndex(next);
            }
        }, intervalMs);

        return () => clearInterval(timer);
    }, [isPlaying, intervalMs, stepCount, setStepIndex]);

    // Stop playing when reaching the end
    useEffect(() => {
        if (isPlaying && isAtEnd) setIsPlaying(false);
    }, [isAtEnd, isPlaying]);

    const handlePlayPause = () => {
        if (isAtEnd) {
            // Restart from beginning
            setStepIndex(0);
            setIsPlaying(true);
            return;
        }
        setIsPlaying((prev) => !prev);
    };

    const handleStepBack = () => {
        setIsPlaying(false);
        setStepIndex(Math.max(0, currentStep - 1));
    };

    const handleStepForward = () => {
        setIsPlaying(false);
        setStepIndex(Math.min(stepCount - 1, currentStep + 1));
    };

    const initialPosition = () => ({
        x: Math.max(window.innerWidth - 320, 16),
        y: 24,
    });

    return (
        <GlassCard initial={initialPosition}>
            <div className="flex flex-col gap-3 p-4 min-w-64">
                <div className="flex items-center justify-between">
                    <h3 className="ui-panel-title-on-dark text-[var(--pm-text-sm)] font-semibold uppercase tracking-[0.22em]">
                        Player
                    </h3>
                    <span className="ui-menu-title-badge rounded-full px-2 py-0.5 text-[var(--pm-text-xs)] font-semibold tabular-nums">
                        {stepCount > 0 ? `${currentStep + 1} / ${stepCount}` : '—'}
                    </span>
                </div>

                {lastRun && (
                    <p className="ui-panel-muted-on-dark text-[var(--pm-text-xs)] leading-5">
                        {lastRun.message}
                    </p>
                )}

                {/* Progress bar */}
                <div className="ui-input rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                            width: stepCount > 0 ? `${((currentStep + 1) / stepCount) * 100}%` : '0%',
                            background: 'var(--ui-menu-control-active-surface)',
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                    <WorkspaceToolButton
                        onClick={handleStepBack}
                        ariaLabel="Passo anterior"
                        title="Passo anterior"
                        disabled={isAtStart}
                        className="flex items-center justify-center w-10 h-10"
                    >
                        <LuSkipBack className="ui-icon" />
                    </WorkspaceToolButton>

                    <WorkspaceToolButton
                        onClick={handlePlayPause}
                        ariaLabel={isPlaying ? 'Pausar' : 'Reproduzir'}
                        title={isPlaying ? 'Pausar' : 'Reproduzir'}
                        stayActive
                        active={isPlaying}
                        className="flex items-center justify-center w-12 h-12"
                    >
                        {isPlaying
                            ? <LuPause className="ui-icon" />
                            : <LuPlay className="ui-icon" />
                        }
                    </WorkspaceToolButton>

                    <WorkspaceToolButton
                        onClick={handleStepForward}
                        ariaLabel="Próximo passo"
                        title="Próximo passo"
                        disabled={isAtEnd}
                        className="flex items-center justify-center w-10 h-10"
                    >
                        <LuSkipForward className="ui-icon" />
                    </WorkspaceToolButton>
                </div>

                {/* Interval control */}
                <label className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <span className="ui-panel-muted-on-dark text-[var(--pm-text-xs)] font-medium uppercase tracking-[0.14em]">
                            Intervalo
                        </span>
                        <span className="ui-value-chip rounded-md px-2 py-0.5 text-[var(--pm-text-xs)] tabular-nums">
                            {intervalMs}ms
                        </span>
                    </div>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={intervalMs}
                        onChange={(e) => setIntervalMs(Number(e.target.value))}
                        className="slider h-2 w-full rounded-lg cursor-pointer"
                    />
                </label>
            </div>
        </GlassCard>
    );
};

export default GraphPlayerCard;
