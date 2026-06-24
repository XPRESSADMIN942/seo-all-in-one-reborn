import React, { useState } from 'react';
import { getCompetitorAnalysis } from '../services/geminiService';
import type { CompetitorData } from '../types';
import { Card } from './Card';
import { CompetitorIcon, LinkIcon, PassIcon, ClarityIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

interface CompetitorAnalysisProps {
    onBack: () => void;
}

export const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ onBack }) => {
    const [url, setUrl] = useState('');
    const [location, setLocation] = useState('');
    const [keywords, setKeywords] = useState('');
    const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!url || !location) {
            setError('Please enter a website URL and a location.');
            return;
        }
        try {
            new URL(url);
        } catch (_) {
            setError('Please enter a valid website URL (e.g., https://example.com).');
            return;
        }

        setError('');
        setLoading(true);
        setCompetitors([]);

        try {
            const data = await getCompetitorAnalysis(url, location, keywords);
            setCompetitors(data);
        } catch (err) {
            setError('Failed to analyze competitors. The AI may have returned an unexpected format. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Competitor Analysis" icon={<CompetitorIcon />} onBack={onBack}>
            <div className="space-y-6">
                <p className="text-base-content text-sm">Enter your dental practice's website URL and city/state to identify key local competitors.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="competitor-url" className="block text-sm font-medium text-gray-700 mb-1">Your Website URL</label>
                        <input
                            id="competitor-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.yourdentalpractice.com"
                            className="w-full px-3 py-2 bg-white border border-subtle-border rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary text-secondary transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="competitor-location" className="block text-sm font-medium text-gray-700 mb-1">City / State (Zip Code recommended)</label>
                        <input
                            id="competitor-location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., 94103 or San Francisco, CA"
                            className="w-full px-3 py-2 bg-white border border-subtle-border rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary text-secondary transition-all"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="competitor-keywords" className="block text-sm font-medium text-gray-700 mb-1">Focus Keywords (Optional)</label>
                        <input
                            id="competitor-keywords"
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g., dental implants, emergency dentist (Leave blank to auto-detect)"
                            className="w-full px-3 py-2 bg-white border border-subtle-border rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary text-secondary transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter specific keywords to find competitors ranking in the <strong>Google Map Pack</strong> for those terms.</p>
                    </div>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-focus disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm"
                >
                    {loading ? 'Analyzing...' : 'Analyze Competitors'}
                </button>
                {error && <p className="text-error text-sm text-center">{error}</p>}
            </div>

            {(loading || competitors.length > 0) && (
                <div className="mt-6 pt-6 border-t border-subtle-border">
                    {loading ? (
                        <div className="py-10"><LoadingSpinner /></div>
                    ) : (
                        <div className="space-y-6 animate-fadeIn">
                            {competitors.map((competitor, index) => (
                                <div key={index} className="p-5 bg-neutral rounded-lg border border-subtle-border relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                                        Map Pack Rank #{index + 1}
                                    </div>
                                    <h3 className="text-lg font-semibold text-secondary mb-1 pr-24">{competitor.competitor_name}</h3>
                                    <a href={competitor.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all mb-4 flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4" />
                                        {competitor.website_url}
                                    </a>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3 text-sm">
                                                <PassIcon className="w-5 h-5 text-success" />
                                                SEO Strengths
                                            </h4>
                                            <ul className="space-y-2 text-sm text-base-content">
                                                {competitor.seo_strengths.map((strength, i) =>
                                                    <li key={i} className="flex items-start gap-2.5">
                                                        <span className="text-success mt-1">&#10003;</span>
                                                        <span>{strength}</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3 text-sm">
                                                <ClarityIcon className="w-5 h-5 text-info" />
                                                Improvement Suggestions
                                            </h4>
                                            <ul className="space-y-2 text-sm text-base-content">
                                                {competitor.seo_improvement_suggestions.map((suggestion, i) =>
                                                    <li key={i} className="flex items-start gap-2.5">
                                                        <span className="text-info mt-1">&#8680;</span>
                                                        <span>{suggestion}</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};
