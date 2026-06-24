import React, { useState, useEffect } from 'react';
import { getContentIdeas, generatePageStructure } from '../services/geminiService';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import { ContentIcon } from './Icons';
import type { ContentIdeas, WebsitePageSuggestion } from '../types';
import { OnPageSuggestions } from './OnPageSuggestions';

interface ContentIdeationProps {
    initialKeywords?: string;
    onBack: () => void;
}

type Mode = 'brainstorm' | 'plan';

export const ContentIdeation: React.FC<ContentIdeationProps> = ({ initialKeywords, onBack }) => {
    const [mode, setMode] = useState<Mode>('brainstorm');

    // Brainstorm Mode State
    const [keywords, setKeywords] = useState(initialKeywords || '');
    const [targetUrls, setTargetUrls] = useState<string[]>(['']);
    const [location, setLocation] = useState('');
    const [contentIdeas, setContentIdeas] = useState<ContentIdeas | null>(null);

    // Plan Mode State
    const [pageTopic, setPageTopic] = useState('');
    const [pageStructure, setPageStructure] = useState<WebsitePageSuggestion | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialKeywords) {
            setKeywords(initialKeywords);
            // Do NOT automatically trigger generation. User wants to add URLs first.
        }
    }, [initialKeywords]);

    const handleGenerateIdeas = async (keywordsToUse?: string) => {
        const currentKeywords = keywordsToUse || keywords;
        if (!currentKeywords) {
            setError('Please provide some keywords.');
            return;
        }
        setError('');
        setLoading(true);
        setContentIdeas(null);

        try {
            // Filter out empty URLs
            const validUrls = targetUrls.filter(url => url.trim() !== '');
            const ideas = await getContentIdeas(currentKeywords, validUrls.length > 0 ? validUrls : undefined, location);
            setContentIdeas(ideas);
        } catch (err: any) {
            console.error("Error generating ideas:", err);
            setError(err.message || 'Failed to generate content ideas. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePagePlan = async () => {
        if (!pageTopic) {
            setError('Please enter a topic for the page.');
            return;
        }
        setError('');
        setLoading(true);
        setPageStructure(null);

        try {
            const structure = await generatePageStructure(pageTopic, location);
            setPageStructure(structure);
        } catch (err: any) {
            console.error("Error generating page structure:", err);
            setError(err.message || 'Failed to generate page structure. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Card title="Content Ideation" icon={<ContentIcon />} onBack={onBack}>
            <div className="space-y-6">

                {/* Mode Toggle */}
                <div className="flex p-1 bg-surface border border-secondary/20 rounded-xl">
                    <button
                        onClick={() => { setMode('brainstorm'); setError(''); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'brainstorm' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-neutral'}`}
                        disabled={loading}
                    >
                        Brainstorm Ideas
                    </button>
                    <button
                        onClick={() => { setMode('plan'); setError(''); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'plan' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:bg-neutral'}`}
                        disabled={loading}
                    >
                        Plan a Page
                    </button>
                </div>

                {mode === 'brainstorm' ? (
                    <>
                        <p className="text-base-content text-sm">Enter keywords to brainstorm <strong>new</strong> content ideas for your website, blog, or social media channels.</p>
                        <div>
                            <label htmlFor="keywords" className="block text-sm font-bold text-secondary mb-2">Keywords</label>
                            <textarea
                                id="keywords"
                                rows={3}
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="e.g., dental implants cost, best teeth whitening"
                                className="w-full px-4 py-2.5 bg-surface border border-secondary/20 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main transition-all outline-none"
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-secondary mb-2">Target Page URLs (Optional)</label>
                                <div className="space-y-2">
                                    {targetUrls.map((url, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="url"
                                                value={url}
                                                onChange={(e) => {
                                                    const newUrls = [...targetUrls];
                                                    newUrls[index] = e.target.value;
                                                    setTargetUrls(newUrls);
                                                }}
                                                placeholder="https://..."
                                                className="w-full px-4 py-2.5 bg-surface border border-secondary/20 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main transition-all outline-none"
                                                disabled={loading}
                                            />
                                            {targetUrls.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        const newUrls = targetUrls.filter((_, i) => i !== index);
                                                        setTargetUrls(newUrls);
                                                    }}
                                                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove URL"
                                                    disabled={loading}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setTargetUrls([...targetUrls, ''])}
                                        className="text-sm text-primary font-semibold hover:text-primary-hover flex items-center gap-1"
                                        disabled={loading}
                                    >
                                        + Add another URL
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Provide URLs to compare against competitors.</p>
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-bold text-secondary mb-2">Location (Optional)</label>
                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., Miami, FL"
                                    className="w-full px-4 py-2.5 bg-surface border border-secondary/20 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main transition-all outline-none"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">Required for competitor analysis.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleGenerateIdeas()}
                            disabled={loading}
                            className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-focus disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm"
                        >
                            {loading ? 'Generating...' : 'Generate Ideas'}
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-base-content text-sm">Enter a topic to generate a comprehensive <strong>structure and content plan</strong> for a new page.</p>
                        <div>
                            <label htmlFor="page-topic" className="block text-sm font-bold text-secondary mb-2">Page Topic</label>
                            <input
                                id="page-topic"
                                type="text"
                                value={pageTopic}
                                onChange={(e) => setPageTopic(e.target.value)}
                                placeholder="e.g., Dental Implants Guide"
                                className="w-full px-4 py-2.5 bg-surface border border-secondary/20 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main transition-all outline-none"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="page-location" className="block text-sm font-bold text-secondary mb-2">Page Location (Optional)</label>
                            <input
                                id="page-location"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Miami, FL"
                                className="w-full px-4 py-2.5 bg-surface border border-secondary/20 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main transition-all outline-none"
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 mt-1">If set, the plan will be optimized for local SEO in this area.</p>
                        </div>
                        <button
                            onClick={handleGeneratePagePlan}
                            disabled={loading}
                            className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-focus disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm"
                        >
                            {loading ? 'Generating...' : 'Generate Page Plan'}
                        </button>
                    </>
                )}

                {error && <p className="text-error text-sm text-center">{error}</p>}
            </div>

            {(loading || contentIdeas || pageStructure) && (
                <div className="mt-6 pt-6 border-t border-subtle-border">
                    {loading ? (
                        <div className="py-10"><LoadingSpinner /></div>
                    ) : (
                        <>
                            {mode === 'brainstorm' && contentIdeas && (
                                <div className="space-y-8 animate-fadeIn">
                                    {contentIdeas.optimization_suggestions && contentIdeas.optimization_suggestions.length > 0 && (
                                        <div>
                                            <h3 className="text-base font-semibold mb-4 text-secondary">Optimization Suggestions for Target Page</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {contentIdeas.optimization_suggestions.map((suggestion, index) => (
                                                    <div key={index} className="bg-white p-5 rounded-xl border border-secondary/10 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-secondary text-sm">{suggestion.category}</span>
                                                                {suggestion.related_url && (
                                                                    <span className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]" title={suggestion.related_url}>
                                                                        {suggestion.related_url}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${suggestion.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                                suggestion.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>{suggestion.priority}</span>
                                                        </div>
                                                        <p className="text-sm text-text-main/80 leading-relaxed">{suggestion.suggestion}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-base font-semibold mb-4 text-secondary">Website Page Suggestions</h3>
                                        <div className="space-y-4">
                                            {contentIdeas.website_pages.map((page, index) => (
                                                <details key={index} className="bg-white p-4 rounded-lg border border-subtle-border group shadow-sm" open>
                                                    <summary className="font-semibold text-primary list-none cursor-pointer flex justify-between items-center">
                                                        <span>Proposed Title: {page.meta_title}</span>
                                                        <span className="text-gray-400 group-open:rotate-90 transition-transform duration-300">&#9654;</span>
                                                    </summary>
                                                    <div className="mt-4 pt-4 border-t border-subtle-border space-y-4">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-600 text-sm mb-2">Suggested Meta Description:</h4>
                                                            <p className="text-sm text-base-content font-mono bg-neutral p-3 rounded">{page.meta_description}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-600 text-sm mb-2">On-Page SEO Plan:</h4>
                                                            <OnPageSuggestions suggestions={page.on_page_suggestions} />

                                                            {page.why_it_matters && (
                                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                                    <h5 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        Why this matters
                                                                    </h5>
                                                                    <p className="text-sm text-blue-700 leading-relaxed">
                                                                        {page.why_it_matters}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-semibold mb-4 text-secondary">Blog Ideas</h3>
                                        <div className="space-y-4">
                                            {contentIdeas.blog_ideas.map((blog, index) => (
                                                <details key={index} className="bg-white p-4 rounded-lg border border-subtle-border group shadow-sm">
                                                    <summary className="font-semibold text-primary list-none cursor-pointer flex justify-between items-center">
                                                        <span>{blog.title}</span>
                                                        <span className="text-gray-400 group-open:rotate-90 transition-transform duration-300">&#9654;</span>
                                                    </summary>
                                                    <div className="mt-4 pt-4 border-t border-subtle-border">
                                                        <p className="text-sm text-base-content">{blog.description}</p>
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mode === 'plan' && pageStructure && (
                                <div className="mt-6 space-y-6 animate-fadeIn">
                                    <div>
                                        <h3 className="text-lg font-semibold text-secondary mb-2">New Page Structure for: <span className="text-primary">"{pageTopic}"</span></h3>
                                        <p className="text-sm text-base-content">Use this outline to build your new page.</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-subtle-border shadow-sm space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-600 text-sm mb-1">Meta Title</h4>
                                            <p className="font-mono bg-neutral p-3 rounded text-sm">{pageStructure.meta_title}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-600 text-sm mb-1">Meta Description</h4>
                                            <p className="font-mono bg-neutral p-3 rounded text-sm">{pageStructure.meta_description}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-600 text-sm mb-3">On-Page Content Strategy:</h4>
                                        <OnPageSuggestions suggestions={pageStructure.on_page_suggestions} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </Card>
    );
};
