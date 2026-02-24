import React from 'react';

interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', headerAction, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-card-bg rounded-2xl border border-border-color shadow-sm transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
        >
            {(title || headerAction) && (
                <div className="flex justify-between items-center mb-6 last:mb-0">
                    <div className="flex flex-col">
                        {title && <h3 className="font-bold text-base text-slate-800 dark:text-white leading-tight">{title}</h3>}
                        {subtitle && <span className="text-xs text-gray-500 mt-1">{subtitle}</span>}
                    </div>
                    {headerAction && <div className="flex items-center">{headerAction}</div>}
                </div>
            )}
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default Card;
