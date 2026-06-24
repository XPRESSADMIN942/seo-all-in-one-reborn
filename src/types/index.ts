// FIX: Define the necessary types for the application.

export interface GroundingChunk {
    web?: {
        uri?: string;
        title?: string;
    };
    maps?: {
        uri?: string;
        title?: string;
    };
}

export interface OnPageSuggestionData {
    h1: string;
    direct_answer: string;
    opening_hook: string;
    content_structure: Array<{ header: string; items: string[] }>;
    eeat_signals: string[];
    internal_links: string[];
    call_to_action: string;
    schema_recommendations: string[];
}

export interface WebsitePageSuggestion {
    meta_title: string;
    meta_description: string;
    on_page_suggestions: string | OnPageSuggestionData;
    why_it_matters?: string;
}

export interface BlogIdea {
    title: string;
    description: string;
}

export interface OptimizationSuggestion {
    category: string;
    suggestion: string;
    priority: 'High' | 'Medium' | 'Low';
    related_url?: string;
}

export interface ContentIdeas {
    website_pages: WebsitePageSuggestion[];
    blog_ideas: BlogIdea[];
    optimization_suggestions?: OptimizationSuggestion[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface CompetitorData {
    competitor_name: string;
    website_url: string;
    seo_strengths: string[];
    seo_improvement_suggestions: string[];
}

export interface Suggestion {
    type: 'Clarity' | 'Engagement' | 'Voice' | 'Conciseness' | 'Structure';
    description: string;
}

export interface AnalysisResult {
    human_score: number;
    overall_feedback: string;
    suggestions: Suggestion[];
    rewritten_text: string;
    google_penalty_risk: 'Pass' | 'Fail';
    penalty_reasoning: string;
}

export interface SchemaData {
    [key: string]: any;
}

export interface OnPageSeoAnalysisResult {
    overall_score: number; // Score out of 100
    overall_summary: string;
    meta_title: {
        text: string;
        feedback: string;
    };
    meta_description: {
        text: string;
        feedback: string;
    };
    headings: {
        h1_tags: string[];
        h2_tags: string[];
        feedback: string;
    };
    content_analysis: {
        keyword_usage: string;
        readability: string;
        search_intent_alignment: string;
    };
    internal_linking_suggestions: string[];
    eeat_signals: {
        present: string[];
        suggestions: string[];
    };
}
