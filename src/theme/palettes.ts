export type AppPalette = {
    id: string;
    name: string;
    shell: {
        appText: string;
        bodyAccentPrimary: string;
        bodyAccentSecondary: string;
        sidebarOverlay: string;
        sidebarSurface: string;
        sidebarBorder: string;
        sidebarTitle: string;
        sidebarText: string;
        sidebarTextMuted: string;
        accentText: string;
        accentTextStrong: string;
        accentSoft: string;
        accentSoftStrong: string;
        accentBorder: string;
        accentBorderStrong: string;
        accentShadow: string;
        moduleSurface: string;
        moduleHoverSurface: string;
        moduleActiveSurface: string;
        moduleBorder: string;
        toggleSurface: string;
        toggleHoverSurface: string;
        toggleBorder: string;
        toggleText: string;
        toggleShadow: string;
        currentModuleSurface: string;
        statusAvailableBg: string;
        statusAvailableText: string;
        statusSoonBg: string;
        statusSoonText: string;
        mobilePillSurface: string;
        mobilePillBorder: string;
        workspaceGradient: string;
    };
    paint: {
        menuSurface: string;
        menuCardSurface: string;
        menuBorder: string;
        menuBorderStrong: string;
        menuText: string;
        menuTextMuted: string;
        menuTextStrong: string;
        menuHandle: string;
        menuControlSurface: string;
        menuControlHoverSurface: string;
        menuControlActiveSurface: string;
        menuControlRing: string;
        menuControlText: string;
        menuControlTextActive: string;
        menuSegmentSurface: string;
        menuSegmentHoverSurface: string;
        menuSegmentActiveSurface: string;
        menuSegmentText: string;
        menuSegmentTextActive: string;
        inputSurface: string;
        inputSurfaceMuted: string;
        inputBorder: string;
        inputText: string;
        inputMuted: string;
        focusRing: string;
        sliderThumb: string;
        sliderThumbHover: string;
    };
};

export const emberSlatePalette: AppPalette = {
    id: "ember-slate",
    name: "Ember Slate",
    shell: {
        appText: "#f8fafc",
        bodyAccentPrimary: "rgba(249, 115, 22, 0.18)",
        bodyAccentSecondary: "rgba(251, 191, 36, 0.14)",
        sidebarOverlay: "rgba(2, 6, 23, 0.55)",
        sidebarSurface: "rgba(2, 6, 23, 0.90)",
        sidebarBorder: "rgba(71, 85, 105, 0.60)",
        sidebarTitle: "#ffffff",
        sidebarText: "#f1f5f9",
        sidebarTextMuted: "#cbd5e1",
        accentText: "#fdba74",
        accentTextStrong: "#ffedd5",
        accentSoft: "rgba(249, 115, 22, 0.10)",
        accentSoftStrong: "rgba(249, 115, 22, 0.16)",
        accentBorder: "rgba(253, 186, 116, 0.35)",
        accentBorderStrong: "rgba(251, 146, 60, 0.70)",
        accentShadow: "rgba(249, 115, 22, 0.18)",
        moduleSurface: "rgba(15, 23, 42, 0.72)",
        moduleHoverSurface: "rgba(15, 23, 42, 0.82)",
        moduleActiveSurface: "rgba(17, 24, 39, 0.95)",
        moduleBorder: "rgba(148, 163, 184, 0.18)",
        toggleSurface: "rgba(15, 23, 42, 0.78)",
        toggleHoverSurface: "rgba(30, 41, 59, 0.94)",
        toggleBorder: "rgba(148, 163, 184, 0.28)",
        toggleText: "#e2e8f0",
        toggleShadow: "rgba(2, 6, 23, 0.28)",
        currentModuleSurface: "rgba(15, 23, 42, 0.35)",
        statusAvailableBg: "rgba(16, 185, 129, 0.15)",
        statusAvailableText: "#d1fae5",
        statusSoonBg: "rgba(56, 189, 248, 0.15)",
        statusSoonText: "#dbeafe",
        mobilePillSurface: "rgba(2, 6, 23, 0.75)",
        mobilePillBorder: "rgba(71, 85, 105, 0.70)",
        workspaceGradient: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(226,232,240,0.94))",
    },
    paint: {
        menuSurface: "rgba(15, 23, 42, 0.82)",
        menuCardSurface: "rgba(255, 247, 237, 0.92)",
        menuBorder: "rgba(148, 163, 184, 0.26)",
        menuBorderStrong: "rgba(100, 116, 139, 0.55)",
        menuText: "#334155",
        menuTextMuted: "#64748b",
        menuTextStrong: "#0f172a",
        menuHandle: "#94a3b8",
        menuControlSurface: "rgba(255, 247, 237, 0.92)",
        menuControlHoverSurface: "rgba(255, 237, 213, 0.96)",
        menuControlActiveSurface: "rgba(249, 115, 22, 0.92)",
        menuControlRing: "rgba(251, 146, 60, 0.55)",
        menuControlText: "#334155",
        menuControlTextActive: "#fff7ed",
        menuSegmentSurface: "rgba(255, 255, 255, 0.72)",
        menuSegmentHoverSurface: "rgba(255, 255, 255, 0.92)",
        menuSegmentActiveSurface: "rgba(249, 115, 22, 0.90)",
        menuSegmentText: "#475569",
        menuSegmentTextActive: "#fff7ed",
        inputSurface: "#ffffff",
        inputSurfaceMuted: "#fff7ed",
        inputBorder: "#cbd5e1",
        inputText: "#334155",
        inputMuted: "#64748b",
        focusRing: "rgba(249, 115, 22, 0.45)",
        sliderThumb: "#f97316",
        sliderThumbHover: "#ea580c",
    },
};

export const defaultAppPalette = emberSlatePalette;
