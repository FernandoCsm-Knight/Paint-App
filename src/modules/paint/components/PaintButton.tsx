import { useState, type ReactNode } from "react";

type PaintButtonProps = {
    ref?: React.Ref<HTMLButtonElement>;
    children?: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    stayActive?: boolean;
    className?: string;
    ariaLabel?: string;
    active?: boolean; 
};

const PaintButton = ({ ref, children, onClick, stayActive = false, className = "", ariaLabel, active }: PaintButtonProps) => {
    const [buttonActive, setButtonActive] = useState<boolean>(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if(active === undefined) setButtonActive(!buttonActive);
        if(onClick) onClick(e);
    };

    const isActive = active ?? buttonActive;

    return (
        <button
            ref={ref}
            onClick={handleClick}
            aria-label={ariaLabel}
            className={`paint-button cursor-pointer p-1.5 sm:p-2.5 rounded-md flex-shrink-0 border-0 outline-none no-underline ${
                isActive && stayActive 
                    ? 'paint-button-active'
                    : ''
            } ${className}`}
        >
            {children}
        </button>
    );
};

export default PaintButton;
