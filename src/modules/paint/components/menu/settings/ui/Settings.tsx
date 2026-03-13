
import { useContext, type ReactNode } from "react";
import { MenuContext } from "../../../../context/MenuContext";
import type { Point } from "../../../../types/Graphics";
import GlassCard from "../../main/ui/GlassCard";

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
            <section className="p-4">
                <h3 className="paint-panel-title-on-dark text-sm sm:text-lg font-semibold mb-4">Configurações</h3>
                <div className="px-2 max-h-64 max-w-64 sm:max-h-80 sm:max-w-80 min-w-50 overflow-y-auto">
                    <ul className="paint-panel-text-on-dark flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
                        {children}
                    </ul>
                </div>
            </section>
        </GlassCard>
    );
}

export default Settings;
