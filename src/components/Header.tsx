import React from 'react';
import { LogoIcon } from './Icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-40 border-b border-secondary/10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="w-8 h-8 text-primary" />
                        <h1 className="text-xl sm:text-2xl font-bold text-secondary tracking-tight">
                            XP SEO All in One Assistant
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};
