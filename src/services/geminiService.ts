// FIX: Implement the Gemini service functions to power the application features.
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import type { ContentIdeas, CompetitorData, GroundingChunk, AnalysisResult, SchemaData, OnPageSeoAnalysisResult, WebsitePageSuggestion } from '../types';

// FIX: Correctly initialize GoogleGenAI with the API key from environment variables.
// In Vite, we use import.meta.env.VITE_API_KEY
const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

let chat: Chat | null = null;

// Helper to handle API rate limits (429)
const generateContentWithRetry = async (params: any, retries = 5, initialDelay = 4000): Promise<GenerateContentResponse> => {
    let currentDelay = initialDelay;

    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error: any) {
            // Check for 429 (Resource Exhausted) or 503 (Service Unavailable)
            const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota exceeded') || error.status === 503;

            if (isRateLimit) {
                if (i === retries - 1) throw error; // No more retries

                // Try to parse specific retry delay from error details
                let waitTime = currentDelay;
                try {
                    if (error.details) {
                        const retryInfo = error.details.find((d: any) => d['@type']?.includes('RetryInfo'));
                        if (retryInfo && retryInfo.retryDelay) {
                            const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
                            if (!isNaN(seconds)) {
                                waitTime = (seconds * 1000) + 1000; // Add 1s buffer
                            }
                        }
                    }
                } catch (e) {
                    // Ignore parsing error, use default backoff
                }

                console.warn(`API Rate Limit hit. Waiting ${waitTime}ms before retry ${i + 1}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));

                // If we didn't find a specific partial time, use exponential backoff for next time
                currentDelay = Math.max(currentDelay * 2, waitTime * 2);
            } else {
                throw error; // Other errors, do not retry
            }
        }
    }
    throw new Error("Failed to generate content after retries.");
};

// Function for Keyword Generator (SEO Analysis)
export const getSeoAnalysis = async (prompt: string): Promise<{ content: string; sources: GroundingChunk[] }> => {
    // FIX: Use ai.models.generateContent instead of a deprecated method.
    // Using googleSearch as a tool for up-to-date information.
    const response: GenerateContentResponse = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    // FIX: Extract text and grounding metadata correctly from the response.
    const content = response.text ?? '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks || [];

    return { content, sources: sources as GroundingChunk[] };
};

// Function for Content Ideation
// Helper: Generate General Content Ideas (Website Pages & Blogs)
const getGeneralIdeas = async (keywords: string): Promise<ContentIdeas> => {
    const prompt = `Based on these keywords, generate content ideas for a dental practice.
Keywords: "${keywords}"

Provide ideas for:
1.  **Website Pages**: For each, suggest a meta title, meta description, and a comprehensive on-page SEO content plan.
2.  **Blog Ideas**: For each, suggest a catchy title and a brief description.

Do NOT provide "optimization_suggestions" in this step.`;

    const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: `You are an expert SEO strategist. Generate high-quality website and blog content ideas.

For "on_page_suggestions", you MUST use the following EXACT format.
CRITICAL:
- Use "H2: " prefix for headers.
- Use "- " prefix for bullet points.
- Ensure every header and bullet point is on its own new line.

Format:
Proposed H1: [Title]
Opening Hook: [Text]
Content Structure:
H2: [Header Text]
- [Bullet point]
- [Bullet point]
H2: [Next Header]
- [Bullet point]
E-E-A-T Signals:
[Text]
Internal Linking:
[Text]
Call-to-Action: [Text]

For "why_it_matters", provide a brief explanation (1-2 sentences) of why this specific page content is important for the dental practice's SEO and user experience.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    website_pages: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                meta_title: { type: Type.STRING },
                                meta_description: { type: Type.STRING },
                                on_page_suggestions: { type: Type.STRING },
                                why_it_matters: { type: Type.STRING },
                            },
                            required: ["meta_title", "meta_description", "on_page_suggestions", "why_it_matters"],
                        },
                    },
                    blog_ideas: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                            },
                            required: ["title", "description"],
                        },
                    },
                },
                required: ["website_pages", "blog_ideas"],
            },
        },
    });

    const jsonStr = response.text?.trim() ?? '';
    if (!jsonStr) throw new Error("Empty response for general ideas.");
    return JSON.parse(jsonStr.replace(/```json/g, '').replace(/```/g, '').trim());
};

// Function for New Page Structure Generation
export const generatePageStructure = async (topic: string, location?: string): Promise<WebsitePageSuggestion> => {
    const locationContext = location ? ` targeting the location: "${location}"` : "";
    const userPrompt = `Create a comprehensive content structure for a new website page about: "${topic}"${locationContext}.

Provide the output as a valid JSON object with the following properties:
- meta_title: A compelling meta title (approx 60 chars)${location ? `, including "${location}"` : ""}.
- meta_description: A persuasive meta description (approx 160 chars)${location ? `, optimized for local click-through rates` : ""}.
- on_page_suggestions: A detailed JSON object designed for **Generative Engine Optimization (GEO)**. It must include:
    - **h1**: Clear and descriptive H1.
    - **direct_answer**: A concise (40-60 words) definition or answer to the main user query.
    - **opening_hook**: Engaging introduction.
    - **content_structure**: An array of objects, each with a 'header' (string) and 'items' (array of strings) for bullet points.
    - **eeat_signals**: Array of specific E-E-A-T advice strings.
    - **schema_recommendations**: Array of specific JSON-LD schema types.
    - **internal_links**: Array of suggestions for internal links.
    - **call_to_action**: Strong closing action.

Ensure the tone is professional, authoritative, and optimized for both Google Search and AI Overviews.`;

    const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction: `You are an expert SEO and GEO (Generative Engine Optimization) strategist.
            CRITICAL: Return 'on_page_suggestions' as a nested JSON OBJECT, not a string.
            
            Strategy:
            1. **Direct Answer**: Write this specifically for Google's AI Overview "snapshot".
            2. **Structure**: Break down content into clear headers and bullet points.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    meta_title: { type: Type.STRING },
                    meta_description: { type: Type.STRING },
                    on_page_suggestions: {
                        type: Type.OBJECT,
                        properties: {
                            h1: { type: Type.STRING },
                            direct_answer: { type: Type.STRING },
                            opening_hook: { type: Type.STRING },
                            content_structure: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        header: { type: Type.STRING },
                                        items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["header", "items"]
                                }
                            },
                            eeat_signals: { type: Type.ARRAY, items: { type: Type.STRING } },
                            internal_links: { type: Type.ARRAY, items: { type: Type.STRING } },
                            call_to_action: { type: Type.STRING },
                            schema_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["h1", "direct_answer", "opening_hook", "content_structure", "eeat_signals", "internal_links", "call_to_action", "schema_recommendations"]
                    },
                    why_it_matters: { type: Type.STRING },
                },
                required: ["meta_title", "meta_description", "on_page_suggestions"],
            },
        },
    });

    const jsonStr = response.text?.trim() ?? '';
    if (!jsonStr) throw new Error("Received an empty response from the AI for page structure generation.");
    // Clean up potential markdown formatting
    const cleanedJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
};

// Helper: Analyze a Single URL
const analyzeSingleUrl = async (url: string, keywords: string, location: string): Promise<any[]> => {
    console.log(`[Deep Analysis] Starting analysis for URL: ${url}`);
    const prompt = `Perform a "Deep Content Audit" for this Target URL: "${url}"
Keywords: "${keywords}"
Location: "${location}"

1.  **Audit the Target URL**: Analyze the page content against Local SEO Best Practices.
2.  **Identify Missing Elements**: Look for missing:
    -   Location-specific keywords (e.g., "${location}" in H1/Title).
    -   "Areas Served" section or clarity.
    -   NAP (Name, Address, Phone) consistency.
    -   Trust signals (Reviews, Testimonials, Accreditation).
    -   Local Schema Markup opportunities.
3.  **Generate Suggestions**: Provide specific "optimization_suggestions" to improve this page's Local SEO.
    -   Focus ONLY on the page itself.
    -   Do NOT compare it to competitors.
    -   Suggestions must be actionable (e.g., "Add 'Miami' to the H1 tag", "Embed a Google Map in the footer").

IMPORTANT: Set the "related_url" field for EVERY suggestion to "${url}".`;

    try {
        const response = await generateContentWithRetry({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: `You are an expert Local SEO auditor. Analyze the provided URL against SEO best practices.
                
Your suggestions must be specific to the page content.
Do NOT mention competitors.
Always include the "related_url" field in the output.`,
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        optimization_suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING },
                                    suggestion: { type: Type.STRING },
                                    priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                                    related_url: { type: Type.STRING },
                                },
                                required: ["category", "suggestion", "priority", "related_url"],
                            },
                        },
                    },
                    required: ["optimization_suggestions"],
                },
            },
        });

        const jsonStr = response.text?.trim() ?? '';
        if (!jsonStr) {
            console.warn(`[Deep Analysis] Empty response for URL: ${url}`);
            return [];
        }

        const data = JSON.parse(jsonStr.replace(/```json/g, '').replace(/```/g, '').trim());
        console.log(`[Deep Analysis] Successfully analyzed URL: ${url}`);
        return data.optimization_suggestions || [];

    } catch (e) {
        console.error(`[Deep Analysis] Failed to analyze URL: ${url}`, e);
        // Return empty array so other URLs can still succeed
        return [];
    }
};

// Main Function: Orchestrates the calls
export const getContentIdeas = async (keywords: string, targetUrls?: string[], location?: string): Promise<ContentIdeas> => {
    try {
        // 1. Get General Ideas (Always)
        const generalIdeasPromise = getGeneralIdeas(keywords);

        // 2. Analyze URLs (if provided)
        let urlAnalysisPromises: Promise<any[]>[] = [];
        if (targetUrls && targetUrls.length > 0 && location) {
            urlAnalysisPromises = targetUrls.map(url => analyzeSingleUrl(url, keywords, location));
        }

        // 3. Wait for all
        const [generalIdeas, ...urlAnalyses] = await Promise.all([generalIdeasPromise, ...urlAnalysisPromises]);

        // 4. Combine Results
        const allSuggestions = urlAnalyses.flat();

        return {
            ...generalIdeas,
            optimization_suggestions: allSuggestions.length > 0 ? allSuggestions : undefined
        };

    } catch (error) {
        console.error("Error in getContentIdeas:", error);
        throw error;
    }
};


// Function for Competitor Analysis
export const getCompetitorAnalysis = async (url: string, location: string, keywords?: string): Promise<CompetitorData[]> => {
    let searchContext = "";
    if (keywords && keywords.trim() !== "") {
        searchContext = `Use the **Google Maps** tool to search for "${keywords}" in "${location}".`;
    } else {
        searchContext = `First, analyze the website ${url} to identify its primary services. Then, use the **Google Maps** tool to search for those services in "${location}".`;
    }

    const userPrompt = `Identify the top 3 local competitors for the dental practice at ${url}.
    
${searchContext}

CRITICAL: You MUST use the Google Maps tool to find the actual "Local Pack" results. Do not rely on general web search.
- **Rank #1**: The business at the very top of the map pack.
- **Rank #2**: The second business in the map pack.
- **Rank #3**: The third business in the map pack.

Provide the analysis in a JSON array format with the following details for each competitor:
- **competitor_name**: The name of the competing dental practice.
- **website_url**: Their full website URL.
- **seo_strengths**: A list of 2-3 key areas where their local SEO is strong (e.g., "High number of positive Google Maps reviews", "Well-optimized Google Business Profile with frequent posts", "Service pages clearly target specific neighborhoods").
- **seo_improvement_suggestions**: Based on the competitor's strengths, provide a list of 2-3 specific, actionable suggestions for the original site (${url}) to improve its local ranking (e.g., "Start a campaign to get more patient reviews on Google", "Add a 'directions' page with an embedded map", "Create blog posts about local community events to strengthen local signals").

Return ONLY the raw JSON array, without any markdown formatting or surrounding text.
Example structure:
[
    {
        "competitor_name": "Example Dental",
        "website_url": "https://www.exampledental.com",
        "seo_strengths": ["Strength 1", "Strength 2"],
        "seo_improvement_suggestions": ["Suggestion 1", "Suggestion 2"]
    }
]
`;

    const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction: `You are an expert Local SEO analyst. Your goal is to identify the top 3 competitors ranking in the Google Local Pack (Maps) for a specific location and service.
            
1. ALWAYS use the 'googleMaps' tool to execute the search.
2. EXTRACT the top 3 businesses from the Maps results in their exact order (1, 2, 3).
3. Analyze their online presence.
4. Return the data in the specified JSON format.`,
            tools: [{ googleSearch: {} }, { googleMaps: {} }],
        },
    });

    const textResponse = response.text ?? '';
    if (!textResponse) throw new Error("Received an empty response from the AI for competitor analysis.");
    const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON from competitor analysis:", e);
        // Fallback for cases where the model might still not return perfect JSON
        const jsonMatch = jsonStr.match(/(\[[\s\S]*\])/);
        if (jsonMatch && jsonMatch[0]) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                console.error("Failed to parse extracted JSON from competitor analysis:", e2);
                throw new Error("Could not parse competitor analysis response.");
            }
        }
        throw new Error("Could not find valid JSON in competitor analysis response.");
    }
};


// Function for Content Analyzer
export const analyzeContentHumanity = async (textContent: string): Promise<AnalysisResult> => {
    const userPrompt = `Analyze the following content for human-like quality, risk of Google penalty, and provide structured, actionable feedback in the specified JSON format.

Analyze this text:
---
${textContent}
---
`;

    const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction: `You are an expert writing editor and SEO analyst specializing in Google's content quality guidelines. Your task is to provide analysis in a JSON format with the following structure:
1.  **human_score**: An integer from 1 (very robotic) to 10 (very human).
2.  **overall_feedback**: A concise, one-sentence summary of your findings on its human-like quality.
3.  **suggestions**: An array of 3-5 specific, actionable suggestions to make the text sound more natural and engaging. Each suggestion must be an object with two keys:
    - **type**: A category for the suggestion. Must be one of: "Clarity", "Engagement", "Voice", "Conciseness", "Structure".
    - **description**: The detailed suggestion text.
4.  **rewritten_text**: The full, rewritten version of the text, incorporating your suggestions.
5.  **google_penalty_risk**: A string, either "Pass" or "Fail". "Pass" means the content appears helpful, reliable, and people-first, and is at low risk of penalty. "Fail" means the content has characteristics of low-quality, unhelpful, or spammy AI-generated text that Google's algorithms might penalize.
6.  **penalty_reasoning**: A brief, one-sentence explanation for the 'google_penalty_risk' assessment, referencing specific issues like lack of E-E-A-T (Experience, Expertise, Authoritativeness, Trust), generic information, or sounding unnatural.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    human_score: { type: Type.INTEGER },
                    overall_feedback: { type: Type.STRING },
                    suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: ["Clarity", "Engagement", "Voice", "Conciseness", "Structure"]
                                },
                                description: { type: Type.STRING }
                            },
                            required: ["type", "description"]
                        }
                    },
                    rewritten_text: { type: Type.STRING },
                    google_penalty_risk: {
                        type: Type.STRING,
                        enum: ["Pass", "Fail"],
                    },
                    penalty_reasoning: { type: Type.STRING },
                },
                required: ["human_score", "overall_feedback", "suggestions", "rewritten_text", "google_penalty_risk", "penalty_reasoning"],
            },
        },
    });

    const jsonStr = response.text?.trim() ?? '';
    if (!jsonStr) throw new Error("Received an empty response from the AI for content analysis.");
    return JSON.parse(jsonStr);
};

// Function for Schema Generator
export const generateSchemaMarkup = async (schemaType: string, formData: any): Promise<SchemaData> => {
    const userPrompt = `Generate a JSON-LD object based on schema.org standards for the following data.

Schema Type: ${schemaType}
Data:
${JSON.stringify(formData, null, 2)}
`;

    // Define a specific schema based on the selected type
    let responseSchema: any;

    if (schemaType === 'Local Business') {
        responseSchema = {
            type: Type.OBJECT,
            properties: {
                '@context': { type: Type.STRING },
                '@type': { type: Type.STRING, description: "Should be 'Dentist' as per instructions." },
                'name': { type: Type.STRING },
                'description': { type: Type.STRING },
                'url': { type: Type.STRING },
                'telephone': { type: Type.STRING },
                'address': {
                    type: Type.OBJECT,
                    properties: {
                        '@type': { type: Type.STRING, description: "Should be 'PostalAddress'." },
                        'streetAddress': { type: Type.STRING },
                        'addressLocality': { type: Type.STRING },
                        'addressRegion': { type: Type.STRING },
                        'postalCode': { type: Type.STRING },
                        'addressCountry': { type: Type.STRING },
                    },
                    required: ['@type', 'streetAddress', 'addressLocality', 'addressRegion', 'postalCode']
                },
                'openingHours': { type: Type.STRING, description: "e.g., Mo-Fr 09:00-17:00" },
            },
            required: ['@context', '@type', 'name', 'address', 'telephone']
        };
    } else {
        // Fallback to a loose schema for other types for now
        responseSchema = {
            type: Type.OBJECT,
            properties: {
                '@context': { type: Type.STRING },
                '@type': { type: Type.STRING },
            },
            // This is a loose schema; the model will fill in the rest.
        };
    }


    const response = await generateContentWithRetry({
        model: "gemini-2.5-pro", // Using a more powerful model for structured data generation
        contents: userPrompt,
        config: {
            systemInstruction: `You are an expert SEO specialist. Your task is to create JSON-LD schema markup.
- Use '@type': 'Dentist' for the 'Local Business' schema type. If the user provides a full address as a single string, parse it into the structured PostalAddress object.
- For 'FAQPage', structure the questions and answers within a 'mainEntity' array of Question/Answer objects.
- Ensure all provided data is correctly mapped to schema.org properties.
- Fill in any plausible missing details if necessary for a complete schema (e.g., '@context': 'https://schema.org', the country for the address).
- Return ONLY the raw JSON object, without any markdown formatting, comments, or explanations.`,
            responseMimeType: "application/json",
            responseSchema: responseSchema
        },
    });

    const jsonStr = response.text?.trim() ?? '';
    if (!jsonStr) throw new Error("Received an empty response from the AI for schema generation.");
    return JSON.parse(jsonStr);
};

// New function for Keyword Volume & Trend Analysis
export const getKeywordTrendAnalysis = async (keyword: string, location: string): Promise<{ estimated_volume: string; trend_analysis: string; }> => {
    const userPrompt = `Perform a Google Search to find the monthly search volume and popularity trends for the keyword "${keyword}" in "${location}".
    
Based on your research, provide the following in a JSON object:
1. 'estimated_volume': A numerical monthly search volume range (e.g., '10-100', '100-1K', '1K-10K'). Look for data from reputable SEO tools or keyword databases in the search results. If exact local data isn't available, provide a reasonable estimate based on general popularity.
2. 'trend_analysis': A brief, one-sentence analysis of the keyword's popularity trend (e.g., 'Stable year-round interest', 'Trending upwards over the last 12 months', 'Seasonal peaks in summer').

Return ONLY the raw JSON object, without any markdown formatting or surrounding text.`;

    const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction: `You are an expert SEO data analyst. Your task is to use Google Search to find and interpret Google Trends data for a given keyword and location.`,
            tools: [{ googleSearch: {} }],
        },
    });

    const textResponse = response.text ?? '';
    if (!textResponse) throw new Error("Received an empty response from the AI for keyword trend analysis.");

    const jsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON from keyword trend analysis:", e);
        // Fallback for cases where the model might still not return perfect JSON
        const jsonMatch = jsonStr.match(/({[\s\S]*})/);
        if (jsonMatch && jsonMatch[0]) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                console.error("Failed to parse extracted JSON from keyword trend analysis:", e2);
                throw new Error("Could not parse keyword trend analysis response.");
            }
        }
        throw new Error("Could not find valid JSON in keyword trend analysis response.");
    }
};

// Helper function to get page content using the search tool
export const getPageContent = async (url: string): Promise<string> => {
    const prompt = `Fetch the main text content from the webpage at this exact URL: ${url}. Return only the text. Do not provide a summary, analysis, or any other commentary. If you cannot access the page, say nothing.`;
    const response = await generateContentWithRetry({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    return response.text ?? '';
}

// Function to analyze fetched page content for SEO
export const analyzePageContent = async (url: string, pageContent: string): Promise<OnPageSeoAnalysisResult> => {
    const userPrompt = `Perform a comprehensive on-page SEO analysis for the URL: ${url}, based on the following content extracted from the page.

---
${pageContent}
---

Return the analysis in a JSON object that adheres to the provided schema.`;

    const response = await generateContentWithRetry({
        model: "gemini-2.5-pro",
        contents: userPrompt,
        config: {
            systemInstruction: `You are an expert SEO auditor. Your task is to analyze the provided webpage content and return a detailed on-page SEO report as a JSON object. From the provided text, identify the meta title, description, heading structure, and main content to perform your analysis.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overall_score: { type: Type.INTEGER, description: "Score out of 100" },
                    overall_summary: { type: Type.STRING },
                    meta_title: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            feedback: { type: Type.STRING }
                        },
                        required: ['text', 'feedback']
                    },
                    meta_description: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            feedback: { type: Type.STRING }
                        },
                        required: ['text', 'feedback']
                    },
                    headings: {
                        type: Type.OBJECT,
                        properties: {
                            h1_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                            h2_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                            feedback: { type: Type.STRING }
                        },
                        required: ['h1_tags', 'h2_tags', 'feedback']
                    },
                    content_analysis: {
                        type: Type.OBJECT,
                        properties: {
                            keyword_usage: { type: Type.STRING },
                            readability: { type: Type.STRING },
                            search_intent_alignment: { type: Type.STRING }
                        },
                        required: ['keyword_usage', 'readability', 'search_intent_alignment']
                    },
                    internal_linking_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    eeat_signals: {
                        type: Type.OBJECT,
                        properties: {
                            present: { type: Type.ARRAY, items: { type: Type.STRING } },
                            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['present', 'suggestions']
                    }
                },
                required: [
                    'overall_score', 'overall_summary', 'meta_title', 'meta_description',
                    'headings', 'content_analysis', 'internal_linking_suggestions', 'eeat_signals'
                ]
            }
        },
    });

    const jsonStr = response.text?.trim() ?? '';
    if (!jsonStr) {
        throw new Error("The AI returned an empty analysis result.");
    }

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON from on-page SEO analysis:", e, "Raw response:", jsonStr);
        throw new Error("The AI returned an invalid JSON response.");
    }
};


// Functions for Chatbot
// FIX: Use the stateful `ai.chats.create` API for conversational chat.
export const startChat = () => {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a helpful and friendly AI assistant specializing in SEO for dental practices. Your goal is to provide concise, actionable advice to dentists and marketing managers. Answer questions about keyword research, content strategy, local SEO, technical SEO, and competitor analysis. Keep your answers clear, easy to understand, and focused on the dental industry.`
        }
    });
};

export const sendMessageToChat = async (message: string): Promise<string> => {
    if (!chat) {
        // Automatically start a new chat if one doesn't exist.
        startChat();
    }

    // FIX: Use the stateful chat session to send messages, removing the need to pass history manually.
    const response: GenerateContentResponse = await chat!.sendMessage({ message });
    return response.text ?? 'Sorry, I could not generate a response.';
};