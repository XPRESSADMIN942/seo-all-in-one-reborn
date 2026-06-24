import React, { useState, useEffect } from 'react';
import { getPageContent, analyzePageContent } from '../services/geminiService';
import type { OnPageSeoAnalysisResult } from '../types';
import { Card } from './Card';
import { PageSeoIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

interface OnPageSeoAnalyzerProps {
    onBack: () => void;
}

const ScoreArc: React.FC<{ score: number }> = ({ score }) => {
    const size = 120;
    const strokeWidth = 10;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;

    // We want a 270 degree arc (from -135 to 135)
    const arcLength = circumference * (270 / 360);
    const dashOffset = arcLength - (score / 100) * arcLength;

    const getColor = (s: number) => {
        if (s < 50) return 'text-error';
        if (s < 80) return 'text-warning';
        return 'text-success';
    };

    return (
        <div className="relative" style={{ width: size, height: size * 0.75 }}>
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size * 0.8}`}>
                <path
                    d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 1 1 ${size - strokeWidth} ${center}`}
                    className="text-neutral"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    strokeLinecap="round"
                    transform={`rotate(135 ${center} ${center})`}
                />
                <path
                    d={`M ${strokeWidth} ${center} A ${radius} ${radius} 0 1 1 ${size - strokeWidth} ${center}`}
                    className={`${getColor(score)} transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={arcLength}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    transform={`rotate(135 ${center} ${center})`}
                />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getColor(score)}`}>{score}</span>
                <span className="text-xs text-gray-500">/ 100</span>
            </div>
        </div>
    );
};

export const OnPageSeoAnalyzer: React.FC<OnPageSeoAnalyzerProps> = ({ onBack }) => {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState<OnPageSeoAnalysisResult | null>(null);
    const [fetchedContent, setFetchedContent] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setFetchedContent(null);
        setResult(null);
        setError('');
    }, [url]);

    const handleFetch = async () => {
        if (!url) {
            setError('Please enter a website URL.');
            return;
        }
        try {
            new URL(url);
        } catch (_) {
            setError('Please enter a valid website URL (e.g., https://example.com).');
            return;
        }

        setError('');
        setIsFetching(true);
        setFetchedContent(null);
        setResult(null);

        try {
            const content = await getPageContent(url);
            if (!content.trim()) {
                setError('Failed to fetch content from the URL. The page may be inaccessible to the AI, protected, or requires JavaScript to render. Please try a different page.');
            } else {
                setFetchedContent(content);
            }
        } catch (err) {
            setError('An error occurred while trying to fetch the page content.');
            console.error(err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAnalyze = async () => {
        if (!fetchedContent) return;

        setError('');
        setIsAnalyzing(true);
        setResult(null);

        try {
            const data = await analyzePageContent(url, fetchedContent);
            setResult(data);
        } catch (err) {
            setError('Failed to analyze the page content. The AI may be experiencing issues. Please try again.');
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const loading = isFetching || isAnalyzing;

    return (
        <Card title="On-Page SEO Analyzer" icon={<PageSeoIcon />} onBack={onBack}>
            <div className="space-y-6">
                <p className="text-base-content text-sm">Enter the URL of a specific webpage (e.g., a service page or blog post) to get a detailed on-page SEO audit.</p>
                <div>
                    <label htmlFor="seo-url" className="block text-sm font-medium text-gray-700 mb-1">Webpage URL</label>
                    <input
                        id="seo-url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.yourdentalpractice.com/services/teeth-whitening"
                        className="w-full px-3 py-2 bg-white border border-subtle-border rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary text-secondary transition-all"
                        disabled={loading}
                    />
                </div>
                <button
                    onClick={handleFetch}
                    disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-focus disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm"
                >
                    {isFetching ? 'Fetching Content...' : 'Fetch Page Content'}
                </button>
                {error && <p className="text-error text-sm text-center">{error}</p>}
            </div>

            {isFetching && (
                <div className="mt-6 pt-6 border-t border-subtle-border">
                    <div className="py-10"><LoadingSpinner /></div>
                </div>
            )}

            {fetchedContent && !result && !isAnalyzing && (
                <div className="mt-6 pt-6 border-t border-subtle-border space-y-4 animate-fadeIn">
                    <div>
                        <h3 className="text-base font-semibold text-secondary">Confirm Page Content</h3>
                        <p className="text-sm text-gray-500 mt-1">Review the content fetched from your URL below. If it looks correct, proceed with the analysis. If not, the page may be difficult for the AI to access.</p>
                    </div>
                    <textarea
                        readOnly
                        value={fetchedContent}
                        className="w-full h-48 p-3 bg-neutral border border-subtle-border rounded-lg font-mono text-xs text-gray-700"
                    />
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setFetchedContent(null)}
                            className="bg-white text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 border border-subtle-border transition-all shadow-sm"
                            disabled={isAnalyzing}
                        >
                            Change URL
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="bg-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze This Content'}
                        </button>
                    </div>
                </div>
            )}

            {isAnalyzing && (
                <div className="mt-6 pt-6 border-t border-subtle-border">
                    <div className="py-10"><LoadingSpinner /></div>
                </div>
            )}

            {result && (
                <div className="mt-6 pt-6 border-t border-subtle-border animate-fadeIn">
                    <div className="space-y-6">
                        <div className="p-4 bg-neutral rounded-xl border border-subtle-border flex flex-col md:flex-row items-center gap-6">
                            <ScoreArc score={result.overall_score} />
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-base font-semibold text-secondary mb-1">Overall On-Page Score</h3>
                                <p className="text-sm text-base-content italic">"{result.overall_summary}"</p>
                            </div>
                        </div>

                        <details className="p-4 bg-white rounded-lg border border-subtle-border group shadow-sm" open>
                            <summary className="font-semibold text-primary list-none cursor-pointer flex justify-between">Meta Tags Analysis <span className="text-gray-400 group-open:rotate-90 transition-transform">&#9654;</span></summary>
                            <div className="mt-4 pt-4 border-t border-subtle-border space-y-4 text-sm">
                                <div>
                                    <h4 className="font-semibold text-gray-600">Meta Title</h4>
                                    <p className="font-mono bg-neutral p-2 rounded mt-1 text-gray-800">{result.meta_title.text || 'Not found'}</p>
                                    <p className="mt-1 text-base-content">{result.meta_title.feedback}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-600">Meta Description</h4>
                                    <p className="font-mono bg-neutral p-2 rounded mt-1 text-gray-800">{result.meta_description.text || 'Not found'}</p>
                                    <p className="mt-1 text-base-content">{result.meta_description.feedback}</p>
                                </div>
                            </div>
                        </details>

                        <details className="p-4 bg-white rounded-lg border border-subtle-border group shadow-sm">
                            <summary className="font-semibold text-primary list-none cursor-pointer flex justify-between">Headings Structure <span className="text-gray-400 group-open:rotate-90 transition-transform">&#9654;</span></summary>
                            <div className="mt-4 pt-4 border-t border-subtle-border space-y-4 text-sm">
                                <p className="mb-2 text-base-content">{result.headings.feedback}</p>
                                <div>
                                    <h4 className="font-semibold text-gray-600">H1 Tags</h4>
                                    <ul className="list-disc list-inside font-mono bg-neutral p-2 rounded mt-1 text-gray-800">
                                        {result.headings.h1_tags.length > 0 ? result.headings.h1_tags.map((h, i) => <li key={`h1-${i}`}>{h}</li>) : <li>No H1 tags found.</li>}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-600">H2 Tags</h4>
                                    <ul className="list-disc list-inside font-mono bg-neutral p-2 rounded mt-1 text-gray-800">
                                        {result.headings.h2_tags.length > 0 ? result.headings.h2_tags.map((h, i) => <li key={`h2-${i}`}>{h}</li>) : <li>No H2 tags found.</li>}
                                    </ul>
                                </div>
                            </div>
                        </details>

                        <details className="p-4 bg-white rounded-lg border border-subtle-border group shadow-sm">
                            <summary className="font-semibold text-primary list-none cursor-pointer flex justify-between">Content Analysis <span className="text-gray-400 group-open:rotate-90 transition-transform">&#9654;</span></summary>
                            <div className="mt-4 pt-4 border-t border-subtle-border space-y-4 text-sm text-base-content">
                                <p><strong className="text-gray-600 font-semibold">Keyword Usage:</strong> {result.content_analysis.keyword_usage}</p>
                                <p><strong className="text-gray-600 font-semibold">Readability:</strong> {result.content_analysis.readability}</p>
                                <p><strong className="text-gray-600 font-semibold">Search Intent:</strong> {result.content_analysis.search_intent_alignment}</p>
                            </div>
                        </details>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <details className="p-4 bg-white rounded-lg border border-subtle-border group shadow-sm h-full">
                                <summary className="font-semibold text-primary list-none cursor-pointer flex justify-between">E-E-A-T Signals <span className="text-gray-400 group-open:rotate-90 transition-transform">&#9654;</span></summary>
                                <div className="mt-4 pt-4 border-t border-subtle-border space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-gray-600">Signals Found:</h4>
                                        <ul className="list-disc list-inside mt-1 text-base-content space-y-1">
                                            {result.eeat_signals.present.map((s, i) => <li key={`eeat-p-${i}`}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-600">Suggestions:</h4>
                                        <ul className="list-disc list-inside mt-1 text-base-content space-y-1">
                                            {result.eeat_signals.suggestions.map((s, i) => <li key={`eeat-s-${i}`}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </details>
                            <details className="p-4 bg-white rounded-lg border border-subtle-border group shadow-sm h-full">
                                <summary className="font-semibold text-primary list-none cursor-pointer flex justify-between">Internal Linking <span className="text-gray-400 group-open:rotate-90 transition-transform">&#9654;</span></summary>
                                <div className="mt-4 pt-4 border-t border-subtle-border space-y-2 text-sm">
                                    <h4 className="font-semibold text-gray-600">Suggestions:</h4>
                                    <ul className="list-disc list-inside text-base-content space-y-1">
                                        {result.internal_linking_suggestions.map((s, i) => <li key={`link-${i}`}>{s}</li>)}
                                    </ul>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};
