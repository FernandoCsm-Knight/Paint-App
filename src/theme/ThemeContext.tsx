import { createContext, type CSSProperties, type ReactNode, useMemo } from "react";
import { defaultAppPalette, type AppPalette } from "./palettes";

type ThemeContextType = {
    palette: AppPalette;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
    palette?: AppPalette;
    children: ReactNode;
};

const paletteToCssVariables = (palette: AppPalette): CSSProperties => ({
    "--app-shell-text": palette.shell.appText,
    "--app-body-accent-primary": palette.shell.bodyAccentPrimary,
    "--app-body-accent-secondary": palette.shell.bodyAccentSecondary,
    "--app-sidebar-overlay": palette.shell.sidebarOverlay,
    "--app-sidebar-surface": palette.shell.sidebarSurface,
    "--app-sidebar-border": palette.shell.sidebarBorder,
    "--app-sidebar-title": palette.shell.sidebarTitle,
    "--app-sidebar-text": palette.shell.sidebarText,
    "--app-sidebar-text-muted": palette.shell.sidebarTextMuted,
    "--app-accent-text": palette.shell.accentText,
    "--app-accent-text-strong": palette.shell.accentTextStrong,
    "--app-accent-soft": palette.shell.accentSoft,
    "--app-accent-soft-strong": palette.shell.accentSoftStrong,
    "--app-accent-border": palette.shell.accentBorder,
    "--app-accent-border-strong": palette.shell.accentBorderStrong,
    "--app-accent-shadow": palette.shell.accentShadow,
    "--app-module-surface": palette.shell.moduleSurface,
    "--app-module-hover-surface": palette.shell.moduleHoverSurface,
    "--app-module-active-surface": palette.shell.moduleActiveSurface,
    "--app-module-border": palette.shell.moduleBorder,
    "--app-toggle-surface": palette.shell.toggleSurface,
    "--app-toggle-hover-surface": palette.shell.toggleHoverSurface,
    "--app-toggle-border": palette.shell.toggleBorder,
    "--app-toggle-text": palette.shell.toggleText,
    "--app-toggle-shadow": palette.shell.toggleShadow,
    "--app-current-module-surface": palette.shell.currentModuleSurface,
    "--app-status-available-bg": palette.shell.statusAvailableBg,
    "--app-status-available-text": palette.shell.statusAvailableText,
    "--app-status-soon-bg": palette.shell.statusSoonBg,
    "--app-status-soon-text": palette.shell.statusSoonText,
    "--app-mobile-pill-surface": palette.shell.mobilePillSurface,
    "--app-mobile-pill-border": palette.shell.mobilePillBorder,
    "--app-workspace-gradient": palette.shell.workspaceGradient,
    "--paint-menu-surface": palette.paint.menuSurface,
    "--paint-menu-card-surface": palette.paint.menuCardSurface,
    "--paint-menu-border": palette.paint.menuBorder,
    "--paint-menu-border-strong": palette.paint.menuBorderStrong,
    "--paint-menu-text": palette.paint.menuText,
    "--paint-menu-text-muted": palette.paint.menuTextMuted,
    "--paint-menu-text-strong": palette.paint.menuTextStrong,
    "--paint-menu-handle": palette.paint.menuHandle,
    "--paint-menu-control-surface": palette.paint.menuControlSurface,
    "--paint-menu-control-hover-surface": palette.paint.menuControlHoverSurface,
    "--paint-menu-control-active-surface": palette.paint.menuControlActiveSurface,
    "--paint-menu-control-ring": palette.paint.menuControlRing,
    "--paint-menu-control-text": palette.paint.menuControlText,
    "--paint-menu-control-text-active": palette.paint.menuControlTextActive,
    "--paint-menu-segment-surface": palette.paint.menuSegmentSurface,
    "--paint-menu-segment-hover-surface": palette.paint.menuSegmentHoverSurface,
    "--paint-menu-segment-active-surface": palette.paint.menuSegmentActiveSurface,
    "--paint-menu-segment-text": palette.paint.menuSegmentText,
    "--paint-menu-segment-text-active": palette.paint.menuSegmentTextActive,
    "--paint-input-surface": palette.paint.inputSurface,
    "--paint-input-surface-muted": palette.paint.inputSurfaceMuted,
    "--paint-input-border": palette.paint.inputBorder,
    "--paint-input-text": palette.paint.inputText,
    "--paint-input-muted": palette.paint.inputMuted,
    "--paint-focus-ring": palette.paint.focusRing,
    "--paint-slider-thumb": palette.paint.sliderThumb,
    "--paint-slider-thumb-hover": palette.paint.sliderThumbHover,
} as CSSProperties);

export const ThemeProvider = ({ palette = defaultAppPalette, children }: ThemeProviderProps) => {
    const value = useMemo(() => ({ palette }), [palette]);

    return (
        <ThemeContext.Provider value={value}>
            <div className="app-theme h-full w-full" style={paletteToCssVariables(palette)}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};
