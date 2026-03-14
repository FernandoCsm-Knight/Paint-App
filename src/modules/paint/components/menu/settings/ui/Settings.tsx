
import { useContext, type ReactNode } from "react";
import { MenuContext } from "../../../../context/MenuContext";
import GlassCard from "../../../../../../components/GlassCard";
import type { Point } from "../../../../../../functions/geometry";

const Settings = ({ children }: { children: ReactNode }) => {
    const { settingButtonRef } = useContext(MenuContext)!;

    const getInitialPos = (): Point => {
        const btn = settingButtonRef.current;
        if (!btn) return { x: 0, y: 60 };
        const btnRect = btn.getBoundingClientRect();
        const offsetParent = btn.offsetParent instanceof HTMLElement ? btn.offsetParent : document.documentElement;
        const parentRect = offsetParent.getBoundingClientRect();
        return {
            x: btnRect.left - parentRect.left,
            y: btnRect.bottom - parentRect.top + 10
        };
    };

    return (
        <GlassCard initial={getInitialPos}>
            <section className="p-[var(--pm-pad)]">
                <h3 className="ui-panel-title-on-dark text-[clamp(0.8rem,1.4vw,1.125rem)] font-semibold mb-[var(--pm-pad)]">Configurações</h3>
                <div className="px-[var(--pm-btn-pad)] max-h-[clamp(16rem,35vh,20rem)] max-w-[clamp(16rem,30vw,20rem)] min-w-[clamp(12rem,20vw,16rem)] overflow-y-auto">
                    <ul className="ui-panel-text-on-dark flex flex-col gap-[var(--pm-gap)] text-[var(--pm-text-sm)] font-medium">
                        {children}
                    </ul>
                </div>
            </section>
        </GlassCard>
    );
}

export default Settings;
