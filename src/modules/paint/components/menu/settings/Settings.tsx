
import type { ReactNode } from "react";
import GlassCard from "../GlassCard";

const Settings = ({ children }: { children: ReactNode }) => {
    return (
        <GlassCard initial={() => ({ 
            x: window.scrollX || window.pageXOffset, 
            y: window.scrollY || window.pageYOffset
        })}>
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
