import React from 'react';
import type { GroundingChunk } from '../types/index';
import { LinkIcon } from './Icons';

interface SourceListProps {
    sources: GroundingChunk[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
    if (sources.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 pt-6 border-t border-subtle-border">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Sources:</h4>
            <ul className="space-y-2">
                {sources.map((source, index) => {
                    const uri = source.web?.uri || source.maps?.uri;
                    const title = source.web?.title || source.maps?.title;
                    if (!uri || !title) return null;

                    return (
                        <li key={index} className="flex items-start group">
                            <LinkIcon className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0 group-hover:text-primary transition-colors" />
                            <a
                                href={uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline break-all"
                                title={title}
                            >
                                {title}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
