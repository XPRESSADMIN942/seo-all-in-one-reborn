import React from 'react';
import {
    TitleIcon,
    HookIcon,
    StructureIcon,
    EeatIcon,
    LinkIcon,
    CtaIcon,
} from './Icons';

interface OnPageSuggestionsProps {
    suggestions: string | OnPageSuggestionData;
}

interface SectionProps {
    title: string;
    icon: React.ReactElement;
    children: React.ReactNode;
}

const SuggestionSection: React.FC<SectionProps> = ({ title, icon, children }) => (
    <div className="mb-4 last:mb-0">
        <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary-light text-primary p-2 rounded-full">
                {React.cloneElement(icon, { className: 'w-5 h-5' })}
            </div>
            <h5 className="font-semibold text-secondary text-sm">{title}</h5>
        </div>
        <div className="pl-12 text-sm text-base-content">
            {children}
        </div>
    </div>
);

const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.trim().split('\n').filter(line => line.trim() !== '');

    return (
        <div className="space-y-4 bg-neutral p-5 rounded-lg border border-subtle-border">
            {lines.map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('H2:')) {
                    return (
                        <div key={index} className="mt-4 first:mt-0 pb-2 border-b border-secondary/10">
                            <h6 className="font-bold text-secondary text-base">{trimmedLine.substring(3).trim()}</h6>
                        </div>
                    );
                }
                if (trimmedLine.startsWith('-')) {
                    return (
                        <div key={index} className="flex items-start gap-2 pl-2">
                            <span className="text-primary mt-1.5 text-xs">●</span>
                            <p className="text-text-main/90 leading-relaxed">{trimmedLine.substring(1).trim()}</p>
                        </div>
                    );
                }
                return <p key={index} className="text-text-main/80 italic">{trimmedLine}</p>;
            })}
        </div>
    );
};


import type { OnPageSuggestionData } from '../types';

export const OnPageSuggestions: React.FC<OnPageSuggestionsProps> = ({ suggestions }) => {
    // 1. Handle New Structured Data (Plan a Page Mode)
    if (typeof suggestions === 'object' && suggestions !== null) {
        const data = suggestions as OnPageSuggestionData;
        return (
            <div className="space-y-8">
                {/* Header Section */}
                <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Proposed H1</span>
                    <h3 className="text-2xl font-bold text-text-main mt-1 bg-neutral p-4 rounded-xl border border-subtle-border">
                        {data.h1}
                    </h3>
                </div>

                {/* Direct Answer (GEO Priority) */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        Direct Answer (GEO)
                    </div>
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Why this ranks in AI Overviews
                    </h5>
                    <p className="text-blue-800 leading-relaxed font-medium">
                        {data.direct_answer}
                    </p>
                </div>

                {/* Opening Hook */}
                <SuggestionSection title="Opening Hook" icon={<HookIcon />}>
                    <p className="bg-neutral p-4 rounded-xl border border-subtle-border text-text-main/90 italic">
                        "{data.opening_hook}"
                    </p>
                </SuggestionSection>

                {/* Content Structure */}
                <SuggestionSection title="Content Structure" icon={<StructureIcon />}>
                    <div className="space-y-6 mt-2">
                        {data.content_structure.map((section, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl border border-secondary/10 shadow-sm relative pl-6">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/20 rounded-l-xl"></div>
                                <h6 className="font-bold text-lg text-secondary mb-3">{section.header}</h6>
                                <ul className="space-y-2">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-text-main/80 text-sm">
                                            <span className="text-primary mt-1.5">●</span>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </SuggestionSection>

                {/* E-E-A-T Signals */}
                <SuggestionSection title="E-E-A-T Signals" icon={<EeatIcon />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.eeat_signals.map((signal, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span className="text-green-800 text-sm">{signal}</span>
                            </div>
                        ))}
                    </div>
                </SuggestionSection>

                {/* Schema Recommendations */}
                <SuggestionSection title="Schema Strategy" icon={<StructureIcon />}>
                    <div className="flex flex-wrap gap-2">
                        {data.schema_recommendations.map((schema, idx) => (
                            <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1">
                                {`{ }`} {schema}
                            </span>
                        ))}
                    </div>
                </SuggestionSection>

                {/* Internal Linking */}
                <SuggestionSection title="Internal Linking" icon={<LinkIcon />}>
                    <ul className="space-y-2 bg-neutral p-4 rounded-xl border border-subtle-border">
                        {data.internal_links.map((link, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-text-main/80">
                                <LinkIcon className="text-secondary w-4 h-4" />
                                <span className="underline decoration-secondary/30">{link}</span>
                            </li>
                        ))}
                    </ul>
                </SuggestionSection>

                {/* Call To Action */}
                <SuggestionSection title="Call-To-Action" icon={<CtaIcon />}>
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center">
                        <p className="text-primary font-bold text-base">
                            "{data.call_to_action}"
                        </p>
                    </div>
                </SuggestionSection>
            </div>
        );
    }

    // 2. Fallback: Parse String (Legacy / Brainstorm Mode)
    const stringSuggestions = suggestions as string;
    const parsed = React.useMemo(() => {
        const sections: { [key: string]: string } = {};
        const headers = [
            "Proposed H1:",
            "Opening Hook:",
            "Content Structure:",
            "E-E-A-T Signals:",
            "Internal Linking:",
            "Call-to-Action:"
        ];

        const regex = new RegExp(`(?=(${headers.join('|')}))`, 'g');
        const parts = stringSuggestions.split(regex).filter(p => p.trim());

        parts.forEach(part => {
            for (const header of headers) {
                if (part.startsWith(header)) {
                    const key = header.toLowerCase().replace(':', '').replace(/-/g, '_').replace(/\s+/g, '_');
                    sections[key] = part.substring(header.length).trim();
                    break;
                }
            }
        });

        return sections;
    }, [stringSuggestions]);

    const renderContent = (key: string, isMarkdown: boolean = false) => {
        const content = parsed[key];
        if (!content) return null;

        if (isMarkdown) {
            return <SimpleMarkdownRenderer content={content} />;
        }
        return <p className="bg-neutral p-4 rounded-md border border-subtle-border">{content}</p>
    }

    return (
        <div className="text-sm whitespace-normal space-y-6">
            {parsed.proposed_h1 && (
                <SuggestionSection title="Proposed H1" icon={<TitleIcon />}>
                    <p className="font-bold text-lg text-secondary bg-neutral p-4 rounded-md border border-subtle-border">{parsed.proposed_h1}</p>
                </SuggestionSection>
            )}
            {parsed.opening_hook && (
                <SuggestionSection title="Opening Hook" icon={<HookIcon />}>
                    {renderContent('opening_hook')}
                </SuggestionSection>
            )}
            {parsed.content_structure && (
                <SuggestionSection title="Content Structure" icon={<StructureIcon />}>
                    {renderContent('content_structure', true)}
                </SuggestionSection>
            )}
            {parsed.e_e_a_t_signals && (
                <SuggestionSection title="E-E-A-T Signals" icon={<EeatIcon />}>
                    {renderContent('e_e_a_t_signals', true)}
                </SuggestionSection>
            )}
            {parsed.internal_linking && (
                <SuggestionSection title="Internal Linking" icon={<LinkIcon />}>
                    {renderContent('internal_linking', true)}
                </SuggestionSection>
            )}
            {parsed.call_to_action && (
                <SuggestionSection title="Call-to-Action" icon={<CtaIcon />}>
                    {renderContent('call_to_action')}
                </SuggestionSection>
            )}
        </div>
    );
};
