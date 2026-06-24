import React, { useState, useMemo } from 'react';
import { getSeoAnalysis, getKeywordTrendAnalysis } from '../services/geminiService';
import { getKeywordTrends, type TrendData } from '../services/trendsService';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import { KeywordIcon } from './Icons';
import type { GroundingChunk } from '../types';
import { SourceList } from './SourceList';

interface KeywordData {
    keyword: string;
    category: string;
    intent: string;
    volume: string;
    groundedVolume?: string;
    trendAnalysis?: string;
    isAnalyzing?: boolean;
    // Google Trends data
    trend?: 'rising' | 'falling' | 'stable';
    trendIndicator?: '↑' | '↓' | '→';
    trendColor?: string;
    relativeVolume?: number;
}

interface KeywordGeneratorProps {
    onKeywordsSelected: (keywords: string[]) => void;
    onBack: () => void;
}

const parseVolume = (volume: string): number => {
    const lowerVolume = volume.toLowerCase();
    if (lowerVolume.includes('low')) return 10;
    if (lowerVolume.includes('medium')) return 50;
    if (lowerVolume.includes('high')) return 1000;

    const rangeMatch = lowerVolume.match(/(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
        return parseInt(rangeMatch[1], 10);
    }

    const numberMatch = lowerVolume.match(/\d+/);
    if (numberMatch) {
        return parseInt(numberMatch[0], 10);
    }

    return 0; // Default for unparseable strings
};

export const KeywordGenerator: React.FC<KeywordGeneratorProps> = ({ onKeywordsSelected, onBack }) => {
    const [location, setLocation] = useState('');
    const [practiceUrl, setPracticeUrl] = useState('');
    const [keywords, setKeywords] = useState<KeywordData[]>([]);
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'none'>('none');
    const [analyzingTrends, setAnalyzingTrends] = useState(false);

    const handleGenerate = async () => {
        if (!practiceUrl || !location) {
            setError('Please provide both a practice website URL and a location.');
            return;
        }
        setError('');
        setLoading(true);
        setKeywords([]);
        setSources([]);
        setSelectedKeywords(new Set());
        setSortOrder('none');

        const prompt = `Generate a detailed list of SEO keywords for the dental practice website ${practiceUrl} in ${location}. Analyze the website content to understand its specific services for the most relevant keywords.

Strongly prioritize long-tail and location-specific keywords that match natural user search tendencies.

For each keyword, provide:
1.  **Category**: Long-Tail, Location-Specific, Question-Based, or Short-Tail.
2.  **Primary Intent**: Informational, Transactional, or Commercial.
3.  **Estimated Monthly Search Volume**: A qualitative value like Low, Medium, High, or a numerical range (e.g., 10-100).

Present the results in a markdown table with the columns: "Keyword", "Category", "Primary Intent", and "Estimated Monthly Search Volume". Do not include the markdown formatting block ticks.`;

        try {
            const { content, sources } = await getSeoAnalysis(prompt);

            console.log('API Response:', content);

            const lines = content.split('\n').filter(line => line.includes('|'));
            console.log('Table lines found:', lines.length);

            if (lines.length < 3) {
                throw new Error('No table found in response. Expected markdown table format.');
            }

            const tableDataLines = lines.slice(2);

            const parsedKeywords = tableDataLines.map(line => {
                const columns = line.split('|').map(cell => cell.trim());
                const filteredColumns = columns.filter(c => c);
                if (filteredColumns.length === 4) {
                    return {
                        keyword: filteredColumns[0],
                        category: filteredColumns[1],
                        intent: filteredColumns[2],
                        volume: filteredColumns[3],
                    };
                }
                return null;
            }).filter((kw): kw is KeywordData => kw !== null);

            console.log('Parsed keywords:', parsedKeywords.length);

            if (parsedKeywords.length === 0) {
                throw new Error('Could not parse any keywords from the response.');
            }

            setKeywords(parsedKeywords);
            setSources(sources);
        } catch (err) {
            console.error('Keyword generation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Failed to generate keywords: ${errorMessage}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectKeyword = (keyword: string) => {
        const newSelection = new Set(selectedKeywords);
        if (newSelection.has(keyword)) {
            newSelection.delete(keyword);
        } else {
            newSelection.add(keyword);
        }
        setSelectedKeywords(newSelection);
    };

    const handleSortByVolume = () => {
        if (sortOrder === 'none' || sortOrder === 'asc') {
            setSortOrder('desc');
        } else {
            setSortOrder('asc');
        }
    };

    const sortedKeywords = useMemo(() => {
        if (sortOrder === 'none') {
            return keywords;
        }
        return [...keywords].sort((a, b) => {
            const volumeA = parseVolume(a.volume);
            const volumeB = parseVolume(b.volume);
            return sortOrder === 'desc' ? volumeB - volumeA : volumeA - volumeB;
        });
    }, [keywords, sortOrder]);

    const handleUseKeywordsForContent = () => {
        onKeywordsSelected(Array.from(selectedKeywords));
    };

    const handleAnalyzeVolume = async () => {
        if (selectedKeywords.size === 0) return;
        setError('');

        setKeywords(prevKeywords =>
            prevKeywords.map(kw =>
                selectedKeywords.has(kw.keyword) ? { ...kw, isAnalyzing: true } : kw
            )
        );

        try {
            const analysisPromises = Array.from(selectedKeywords).map((keyword: string) =>
                getKeywordTrendAnalysis(keyword, location)
                    .then(result => ({ keyword, ...result }))
                    .catch(() => ({ keyword, error: true }))
            );

            const results = await Promise.all(analysisPromises);

            setKeywords(prevKeywords =>
                prevKeywords.map(kw => {
                    const result = results.find(r => r.keyword === kw.keyword);
                    if (result) {
                        if ('error' in result) {
                            return {
                                ...kw,
                                isAnalyzing: false,
                                groundedVolume: 'Error',
                                trendAnalysis: 'Failed to fetch',
                            };
                        }
                        return {
                            ...kw,
                            isAnalyzing: false,
                            groundedVolume: result.estimated_volume,
                            trendAnalysis: result.trend_analysis,
                        };
                    }
                    return kw;
                })
            );
        } catch (err) {
            console.error('An error occurred while analyzing keyword volumes:', err);
            setError('An error occurred while analyzing keyword volumes. Please try again.');
            setKeywords(prevKeywords => prevKeywords.map(kw => ({ ...kw, isAnalyzing: false })));
        }
    };

    const handleAnalyzeTrends = async () => {
        if (keywords.length === 0) return;

        setAnalyzingTrends(true);
        setError('');

        try {
            const keywordsToAnalyze = keywords.slice(0, 5).map(kw => kw.keyword);
            const trendData = await getKeywordTrends(keywordsToAnalyze, location);

            setKeywords(prevKeywords =>
                prevKeywords.map(kw => {
                    const trend = trendData.find(t => t.keyword === kw.keyword);
                    if (trend) {
                        return {
                            ...kw,
                            trend: trend.trend,
                            trendIndicator: trend.trendIndicator,
                            trendColor: trend.trendColor,
                            relativeVolume: trend.relativeVolume,
                        };
                    }
                    return kw;
                })
            );
        } catch (err) {
            console.error('Error analyzing trends:', err);
            setError('Failed to analyze trends. Please try again.');
        } finally {
            setAnalyzingTrends(false);
        }
    };

    return (
        <Card title="Keyword Generator" icon={<KeywordIcon />} onBack={onBack}>
            <div className="space-y-6">
                <p className="text-base-content text-sm">Enter your practice's website URL and location to discover relevant keywords for your SEO campaign.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Practice Website URL</label>
                        <input
                            id="url"
                            type="url"
                            value={practiceUrl}
                            onChange={(e) => setPracticeUrl(e.target.value)}
                            placeholder="https://www.yourdentalpractice.com"
                            className="w-full px-4 py-2.5 bg-surface border border-secondary/20 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main transition-all outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-bold text-secondary mb-2">Location</label>
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., San Francisco, CA"
                            className="w-full px-4 py-2.5 bg-surface border border-secondary/20 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main transition-all outline-none"
                            required
                        />
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-hover disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {loading ? 'Generating...' : 'Generate Keywords'}
                </button>
                {error && <p className="text-error text-sm text-center">{error}</p>}
            </div>

            {(loading || keywords.length > 0) && (
                <div className="mt-6 pt-6 border-t border-subtle-border">
                    {loading ? (
                        <div className="py-10"><LoadingSpinner /></div>
                    ) : (
                        <div className="animate-fadeIn">
                            <h3 className="text-base font-semibold mb-4 text-secondary">Recommended Keywords:</h3>
                            <div className="overflow-x-auto rounded-xl border border-secondary/10 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-secondary uppercase bg-secondary/5 font-bold">
                                        <tr>
                                            <th scope="col" className="p-4 w-8">
                                                {/* Placeholder for checkbox alignment */}
                                            </th>
                                            <th scope="col" className="p-4">Keyword</th>
                                            <th scope="col" className="p-4">Category</th>
                                            <th scope="col" className="p-4">Intent</th>
                                            <th scope="col" className="p-4 cursor-pointer hover:text-primary transition-colors" onClick={handleSortByVolume}>
                                                Volume {sortOrder === 'desc' ? '▼' : sortOrder === 'asc' ? '▲' : ''}
                                            </th>
                                            <th scope="col" className="p-4">Grounded Volume</th>
                                            <th scope="col" className="p-4">Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary/10 bg-surface">
                                        {sortedKeywords.map((kw, index) => (
                                            <tr key={index} className="hover:bg-neutral">
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedKeywords.has(kw.keyword)}
                                                        onChange={() => handleSelectKeyword(kw.keyword)}
                                                    />
                                                </td>
                                                <td className="p-4 font-medium text-secondary">{kw.keyword}</td>
                                                <td className="p-4 text-base-content">{kw.category}</td>
                                                <td className="p-4 text-base-content">{kw.intent}</td>
                                                <td className="p-4 text-base-content">{kw.volume}</td>
                                                <td className="p-4 text-center text-base-content">
                                                    {kw.isAnalyzing ? <LoadingSpinner size="sm" /> : kw.groundedVolume || '—'}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {kw.trendIndicator ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span style={{ color: kw.trendColor }} className="text-lg font-bold">
                                                                {kw.trendIndicator}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {kw.relativeVolume}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {keywords.length > 0 && (
                                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
                                    <button
                                        onClick={handleAnalyzeTrends}
                                        disabled={analyzingTrends}
                                        className="bg-surface text-secondary font-bold py-2.5 px-5 rounded-xl hover:bg-secondary/5 border border-secondary/20 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {analyzingTrends ? 'Analyzing...' : `Analyze Trends (${Math.min(keywords.length, 5)})`}
                                    </button>
                                    {selectedKeywords.size > 0 && (
                                        <>
                                            <button
                                                onClick={handleAnalyzeVolume}
                                                className="bg-surface text-secondary font-bold py-2.5 px-5 rounded-xl hover:bg-secondary/5 border border-secondary/20 transition-all shadow-sm"
                                            >
                                                Analyze Volume & Trends ({selectedKeywords.size})
                                            </button>
                                            <button
                                                onClick={handleUseKeywordsForContent}
                                                className="bg-secondary text-white font-bold py-2.5 px-5 rounded-xl hover:bg-secondary/90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                            >
                                                Create Content Ideas ({selectedKeywords.size})
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                            <SourceList sources={sources} />
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};
