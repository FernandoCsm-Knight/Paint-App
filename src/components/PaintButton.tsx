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
            className={`cursor-pointer p-1.5 sm:p-2.5 rounded-md transition-colors duration-200 flex-shrink-0 border-0 outline-none no-underline ${
                isActive && stayActive 
                    ? 'bg-gray-400 hover:bg-gray-300 ring-2 ring-gray-500'
                    : 'bg-gray-300 hover:bg-gray-200 active:outline-none active:ring-2 active:ring-gray-400'
            } ${className}`}
        >
            {children}
        </button>
    );
};

export default PaintButton;
