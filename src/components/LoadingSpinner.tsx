import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex justify-center items-center">
            <div
                className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
                role="status"
                aria-label="loading"
            ></div>
        </div>
    );
};
