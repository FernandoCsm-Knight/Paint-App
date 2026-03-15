import type { ReactNode } from 'react';

type FloatingInfoBadgeProps = {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    align?: 'start' | 'center' | 'end';
};

const alignMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
} as const;

const FloatingInfoBadge = ({
    children,
    className = '',
    contentClassName = '',
    align = 'end',
}: FloatingInfoBadgeProps) => {
    return (
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-15 flex px-4 pb-6 ${alignMap[align]} ${className}`.trim()}>
            <div className={`workspace-overlay-badge rounded-2xl px-4 py-3 ${contentClassName}`.trim()}>
                {children}
            </div>
        </div>
    );
};

export default FloatingInfoBadge;
