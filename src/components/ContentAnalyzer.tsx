import React, { useState } from 'react';
import { analyzeContentHumanity } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import { Card } from './Card';
import { AnalyzeIcon, CopyIcon, PassIcon, FailIcon, ClarityIcon, EngagementIcon, VoiceIcon, ConcisenessIcon, StructureIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

interface ContentAnalyzerProps {
    onBack: () => void;
}

const ScoreMeter: React.FC<{ score: number }> = ({ score }) => {
    const percentage = score * 10;
    const getColor = (s: number) => {
        if (s <= 4) return 'bg-error';
        if (s <= 7) return 'bg-warning';
        return 'bg-success';
    };

    return (
        <div className="w-full bg-neutral rounded-full h-2.5">
            <div
                className={`h-full rounded-full ${getColor(score)} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

const TextBlock = ({ title, content, children }: { title: string; content: string; children?: React.ReactNode; }) => (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-2 h-8">
            <h4 className={`font-semibold text-gray-600 text-sm`}>{title}</h4>
            {children}
        </div>
        <div className={`p-4 bg-neutral rounded-lg border border-subtle-border flex-grow overflow-y-auto text-sm whitespace-pre-wrap font-mono h-64 text-gray-800`}>
            {content}
        </div>
    </div>
);

const SuggestionIcons: { [key: string]: React.ReactElement } = {
    'Clarity': <ClarityIcon className="w-5 h-5 text-primary" />,
    'Engagement': <EngagementIcon className="w-5 h-5 text-primary" />,
    'Voice': <VoiceIcon className="w-5 h-5 text-primary" />,
    'Conciseness': <ConcisenessIcon className="w-5 h-5 text-primary" />,
    'Structure': <StructureIcon className="w-5 h-5 text-primary" />,
};

export const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({ onBack }) => {
    const [textContent, setTextContent] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleAnalyze = async () => {
        if (!textContent.trim()) {
            setError('Please paste some content to analyze.');
            return;
        }
        setError('');
        setLoading(true);
        setResult(null);

        try {
            const data = await analyzeContentHumanity(textContent);
            setResult(data);
        } catch (err) {
            setError('Failed to analyze content. The AI may be experiencing issues. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (result?.rewritten_text) {
            navigator.clipboard.writeText(result.rewritten_text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card title="Content Analyzer" icon={<AnalyzeIcon />} onBack={onBack}>
            <div className="space-y-6">
                <p className="text-base-content text-sm">Paste your content below to check if it sounds too AI-generated and get suggestions to make it more human-like.</p>
                <div>
                    <label htmlFor="content-analyzer-textarea" className="block text-sm font-medium text-gray-700 mb-1">Your Content</label>
                    <textarea
                        id="content-analyzer-textarea"
                        rows={10}
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Paste your blog post, service page, or any other text here..."
                        className="w-full px-3 py-2 bg-white border border-subtle-border rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary text-secondary transition-all"
                    />
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-focus disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm"
                >
                    {loading ? 'Analyzing...' : 'Analyze Content'}
                </button>
                {error && <p className="text-error text-sm text-center">{error}</p>}
            </div>

            {(loading || result) && (
                <div className="mt-6 pt-6 border-t border-subtle-border">
                    {loading ? (
                        <div className="py-10"><LoadingSpinner /></div>
                    ) : result && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={`p-5 rounded-xl border ${result.google_penalty_risk === 'Pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <h3 className="text-gray-500 font-medium mb-2 text-sm">Google Penalty Risk</h3>
                                    <div className="flex items-center gap-3">
                                        {result.google_penalty_risk === 'Pass' ?
                                            <PassIcon className="w-8 h-8 text-success flex-shrink-0" /> :
                                            <FailIcon className="w-8 h-8 text-error flex-shrink-0" />
                                        }
                                        <div>
                                            <h4 className={`text-xl font-semibold ${result.google_penalty_risk === 'Pass' ? 'text-green-800' : 'text-red-800'}`}>
                                                {result.google_penalty_risk}
                                            </h4>
                                            <p className="text-xs mt-1 text-base-content">{result.penalty_reasoning}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 bg-neutral rounded-xl border border-subtle-border">
                                    <h3 className="text-gray-500 font-medium mb-2 text-sm">Human-Likeness Score</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl font-semibold text-secondary">{result.human_score}/10</div>
                                        <div className="flex-1">
                                            <ScoreMeter score={result.human_score} />
                                        </div>
                                    </div>
                                    <p className="text-xs mt-2 text-base-content italic text-center">"{result.overall_feedback}"</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-secondary mb-4">Actionable Suggestions</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {result.suggestions.map((suggestion, i) => (
                                        <div key={i} className="p-4 bg-neutral rounded-lg border border-subtle-border flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-0.5 bg-primary-light p-2 rounded-full">
                                                {SuggestionIcons[suggestion.type] || <ClarityIcon className="w-5 h-5 text-primary" />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-secondary text-sm">{suggestion.type}</h4>
                                                <p className="text-xs mt-1 text-base-content">{suggestion.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base font-semibold text-secondary mb-4">Text Comparison</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextBlock
                                        title="Original Text"
                                        content={textContent}
                                    />
                                    <TextBlock
                                        title="Suggested Rewrite"
                                        content={result.rewritten_text}
                                    >
                                        <button
                                            onClick={handleCopy}
                                            className="flex items-center gap-1.5 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 rounded-md transition-colors disabled:opacity-50 font-medium"
                                            disabled={copied}
                                        >
                                            <CopyIcon className="w-3.5 h-3.5" />
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </TextBlock>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};
