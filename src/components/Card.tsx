import React from 'react';
import { BackIcon } from './Icons';

interface CardProps {
    title: string;
    icon: React.ReactElement;
    children: React.ReactNode;
    onBack?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, onBack }) => {
    return (
        <div className="bg-surface rounded-2xl shadow-sm h-full flex flex-col border border-secondary/10 overflow-hidden">
            <div className="p-5 flex items-center gap-4 border-b border-secondary/10 bg-secondary/5">
                {onBack && (
                    <button onClick={onBack} className="text-text-main/40 hover:text-primary p-2 -ml-2 rounded-full transition-colors">
                        <BackIcon className="w-5 h-5" />
                        <span className="sr-only">Back to Tools</span>
                    </button>
                )}
                <div className="bg-white text-secondary p-2.5 rounded-full shadow-sm border border-secondary/10">
                    {React.cloneElement(icon, { className: "w-5 h-5" })}
                </div>
                <h2 className="text-lg font-bold text-secondary">{title}</h2>
            </div>
            <div className="p-6 flex-grow">
                {children}
            </div>
        </div>
    );
};
