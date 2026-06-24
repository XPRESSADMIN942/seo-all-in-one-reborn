// Mock data for when no API key is provided
import type { ContentIdeas, CompetitorData, GroundingChunk, AnalysisResult, OnPageSeoAnalysisResult } from '../types';

export const getMockSeoAnalysis = async (prompt: string): Promise<{ content: string; sources: GroundingChunk[] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const content = `| Keyword | Category | Primary Intent | Estimated Monthly Search Volume |
|---|---|---|---|
| dental implants near me | Location-Specific | Transactional | High (1000-10000) |
| teeth whitening [city] | Location-Specific | Commercial | Medium (500-1000) |
| emergency dentist [city] | Location-Specific | Transactional | High (1000-10000) |
| cosmetic dentistry [city] | Location-Specific | Commercial | Medium (500-1000) |
| dental veneers cost | Long-Tail | Commercial | Medium (500-1000) |
| invisalign vs braces | Question-Based | Informational | Medium (500-1000) |
| how much do dental implants cost | Question-Based | Informational | High (1000-10000) |
| best dentist for implants [city] | Long-Tail | Commercial | Low (10-100) |
| same day dental crowns | Long-Tail | Transactional | Medium (100-500) |
| teeth cleaning cost [city] | Location-Specific | Commercial | Medium (500-1000) |
| root canal treatment [city] | Location-Specific | Transactional | Medium (500-1000) |
| pediatric dentist near me | Location-Specific | Transactional | High (1000-10000) |
| wisdom teeth removal [city] | Location-Specific | Transactional | High (1000-10000) |
| dental insurance accepted | Long-Tail | Informational | Medium (100-500) |
| sedation dentistry [city] | Location-Specific | Commercial | Low (100-500) |`;

    const sources: GroundingChunk[] = [
        {
            web: {
                uri: 'https://www.semrush.com/blog/dental-seo/',
                title: 'Dental SEO: Complete Guide for 2024'
            }
        },
        {
            web: {
                uri: 'https://ahrefs.com/blog/dental-keywords/',
                title: 'Top Dental Keywords for Local SEO'
            }
        }
    ];

    return { content, sources };
};

export const getMockContentIdeas = async (keywords: string): Promise<ContentIdeas> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        website_pages: [
            {
                meta_title: `Dental Implants in [City] | Permanent Tooth Replacement`,
                meta_description: `Looking for dental implants in [City]? Our experienced team offers affordable, permanent tooth replacement solutions. Free consultation available. Call today!`,
                on_page_suggestions: `**Proposed H1:** Dental Implants in [City]: Restore Your Smile with Permanent Solutions

**Opening Hook:** Missing teeth can affect your confidence, eating ability, and overall oral health. At [Practice Name], we specialize in dental implants that look, feel, and function just like natural teeth. Discover why thousands of [City] residents trust us for their tooth replacement needs.

**Content Structure:**

**H2: What Are Dental Implants?**
- Explain the implant structure (titanium post, abutment, crown)
- Benefits over dentures and bridges
- Success rates and longevity (98% success rate, 20+ year lifespan)
- User Question: "Are dental implants permanent?"

**H2: The Dental Implant Procedure**
- Initial consultation and 3D imaging
- Surgical placement process
- Healing period (osseointegration)
- Crown placement
- User Question: "Does getting dental implants hurt?"

**H2: Cost of Dental Implants in [City]**
- Average cost breakdown ($3,000-$4,500 per tooth)
- Factors affecting price
- Insurance coverage options
- Financing plans available
- User Question: "How much do dental implants cost?"

**H2: Why Choose [Practice Name] for Dental Implants?**
- Board-certified implant specialists
- State-of-the-art technology (3D imaging, guided surgery)
- 10-year warranty on implants
- Before/after patient gallery

**E-E-A-T Signals:**
- Include detailed bios of implant specialists with credentials (DDS, AAID certification)
- Embed video testimonials from actual implant patients
- Display awards and certifications (ADA member, Best Dentist awards)
- Cite statistics from Journal of Dental Research

**Internal Linking:**
- Link to "Bone Grafting" page (for patients with bone loss)
- Link to "Dental Financing" page
- Link to "Patient Reviews" page
- Link to "Contact Us" for free consultation

**Call-to-Action:** Ready to restore your smile? Schedule your free dental implant consultation today. Call [Phone] or book online now!`
            },
            {
                meta_title: `Teeth Whitening [City] | Professional Whitening Services`,
                meta_description: `Get a brighter smile with professional teeth whitening in [City]. Safe, effective results in just one visit. Special offer: $299 (reg. $499). Book now!`,
                on_page_suggestions: `**Proposed H1:** Professional Teeth Whitening in [City]: Get a Brighter Smile Today

**Opening Hook:** Tired of hiding your smile in photos? Professional teeth whitening at [Practice Name] can safely brighten your teeth by 6-8 shades in just one appointment. Discover the difference between professional and over-the-counter whitening.

**Content Structure:**

**H2: Professional vs. At-Home Whitening**
- Comparison table (strength, results, safety, cost)
- Why professional whitening is more effective
- User Question: "Is professional teeth whitening worth it?"

**H2: Our Whitening Options**
- In-office whitening (Zoom, BriteSmile)
- Take-home custom trays
- Combination packages
- Results timeline

**H2: Teeth Whitening Cost in [City]**
- Pricing for different options
- Current promotions
- Insurance considerations

**E-E-A-T Signals:**
- Before/after photo gallery with patient consent
- Video explaining the whitening process
- Dentist credentials and training in cosmetic dentistry

**Internal Linking:**
- Link to "Cosmetic Dentistry" overview page
- Link to "Veneers" for alternative solutions
- Link to "Special Offers" page

**Call-to-Action:** Ready for a brighter smile? Book your teeth whitening appointment today and save $200!`
            }
        ],
        blog_ideas: [
            {
                title: "5 Signs You Might Need a Dental Implant",
                description: "Explore the common indicators that dental implants might be the right solution for you, including missing teeth, difficulty chewing, and bone loss."
            },
            {
                title: "Dental Implants vs. Dentures: Which is Right for You?",
                description: "A comprehensive comparison of dental implants and dentures, covering cost, comfort, maintenance, and long-term value to help you make an informed decision."
            },
            {
                title: "How to Care for Your Dental Implants: A Complete Guide",
                description: "Learn the best practices for maintaining your dental implants, including daily cleaning routines, foods to avoid, and when to schedule check-ups."
            },
            {
                title: "What to Expect During Your Dental Implant Procedure",
                description: "A step-by-step walkthrough of the dental implant process, from consultation to final crown placement, including recovery tips and timeline."
            }
        ]
    };
};

export const getMockCompetitorAnalysis = async (url: string, location: string): Promise<CompetitorData[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return [
        {
            competitor_name: "Smile Dental Center",
            website_url: "https://example-competitor1.com",
            seo_strengths: [
                "Strong local SEO presence with Google My Business optimization",
                "Comprehensive service pages with detailed descriptions",
                "Active blog with regular dental health content",
                "High-quality before/after photo galleries",
                "Patient testimonials prominently featured"
            ],
            seo_improvement_suggestions: [
                "Add FAQ schema markup to service pages",
                "Improve page load speed (currently 4.2s)",
                "Create more location-specific landing pages",
                "Implement video content for procedures",
                "Enhance mobile user experience"
            ]
        },
        {
            competitor_name: "Advanced Dentistry Group",
            website_url: "https://example-competitor2.com",
            seo_strengths: [
                "Excellent technical SEO with fast page speeds",
                "Strong backlink profile from dental associations",
                "Well-structured content with proper heading hierarchy",
                "Active social media integration",
                "Clear call-to-actions on every page"
            ],
            seo_improvement_suggestions: [
                "Expand blog content to target long-tail keywords",
                "Add more patient reviews and testimonials",
                "Create dedicated pages for specific treatments",
                "Improve image alt text for accessibility",
                "Add live chat feature for immediate engagement"
            ]
        },
        {
            competitor_name: "Family Dental Care",
            website_url: "https://example-competitor3.com",
            seo_strengths: [
                "Strong emphasis on family and pediatric dentistry",
                "Detailed dentist bios with credentials",
                "Virtual tour of the office",
                "Multiple location pages optimized for local search",
                "Emergency dental services highlighted"
            ],
            seo_improvement_suggestions: [
                "Update blog content more frequently",
                "Add structured data for reviews and ratings",
                "Improve internal linking structure",
                "Create more educational video content",
                "Optimize for voice search queries"
            ]
        }
    ];
};

export const getMockContentAnalysis = async (textContent: string): Promise<AnalysisResult> => {
    await new Promise(resolve => setTimeout(resolve, 1800));

    const wordCount = textContent.split(/\s+/).length;
    const hasVariedSentenceLength = textContent.split('.').length > 3;
    const hasPersonalTouch = /\b(I|we|our|my)\b/i.test(textContent);

    // Calculate a mock score based on content characteristics
    let score = 65;
    if (hasVariedSentenceLength) score += 10;
    if (hasPersonalTouch) score += 15;
    if (wordCount > 100) score += 10;

    return {
        human_score: Math.min(score, 95),
        overall_feedback: `This content has a human-like quality score of ${score}/100. ${score >= 80 ? 'The text demonstrates good natural language patterns with varied sentence structure and personal voice.' : 'The content could benefit from more natural language patterns and personal touches to sound less AI-generated.'}`,
        suggestions: [
            {
                type: 'Clarity',
                description: 'Add more specific examples and real-world scenarios to make the content more relatable and easier to understand.'
            },
            {
                type: 'Engagement',
                description: 'Include rhetorical questions or direct addresses to the reader to create a more conversational tone.'
            },
            {
                type: 'Voice',
                description: 'Incorporate personal anecdotes or experiences to establish a unique voice and build trust with readers.'
            },
            {
                type: 'Conciseness',
                description: 'Remove redundant phrases and tighten sentences to improve readability and maintain reader attention.'
            }
        ],
        rewritten_text: textContent.split('.').map((sentence, idx) => {
            if (idx % 2 === 0 && sentence.trim()) {
                return sentence.trim() + '. In my experience, this is particularly important';
            }
            return sentence.trim();
        }).join('. '),
        google_penalty_risk: score >= 70 ? 'Pass' : 'Fail',
        penalty_reasoning: score >= 70
            ? 'The content shows sufficient human characteristics and natural language patterns. Low risk of AI detection penalties.'
            : 'The content may trigger AI detection algorithms due to repetitive patterns and lack of personal voice. Consider adding more unique perspectives and varied sentence structures.'
    };
};

export const getMockKeywordTrendAnalysis = async (keyword: string, location: string): Promise<{ estimated_volume: string; trend_analysis: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate semi-random but realistic data
    const volumes = ['100-500', '500-1000', '1000-5000', '5000-10000'];
    const trends = ['Rising', 'Stable', 'Seasonal', 'Declining'];

    const volume = volumes[Math.floor(Math.random() * volumes.length)];
    const trend = trends[Math.floor(Math.random() * trends.length)];

    return {
        estimated_volume: volume,
        trend_analysis: `${trend} - ${getTrendDescription(trend, keyword)}`
    };
};

const getTrendDescription = (trend: string, keyword: string): string => {
    switch (trend) {
        case 'Rising':
            return 'Search interest has increased 15-20% over the past 3 months';
        case 'Stable':
            return 'Consistent search volume with minimal fluctuation';
        case 'Seasonal':
            return 'Shows seasonal patterns, typically higher in spring/summer months';
        case 'Declining':
            return 'Slight decrease in search volume, down 10% from peak';
        default:
            return 'Moderate search activity';
    }
};

export const getMockPageContent = async (url: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    return `Sample page content from ${url}. This is a mock representation of the page's text content for SEO analysis purposes.`;
};

export const getMockPageAnalysis = async (url: string, pageContent: string): Promise<OnPageSeoAnalysisResult> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        overall_score: 78,
        overall_summary: 'This page has a solid SEO foundation but has room for improvement in several key areas. The content is well-structured with proper headings, but could benefit from enhanced E-E-A-T signals and more strategic internal linking.',
        meta_title: {
            text: 'Sample Page Title - Dental Services',
            feedback: 'Title is present and includes target keyword. Consider adding location for better local SEO (e.g., "Dental Services in [City]"). Current length: 35 characters (optimal: 50-60).'
        },
        meta_description: {
            text: 'We provide comprehensive dental services for the whole family.',
            feedback: 'Description is too short and generic. Expand to 150-160 characters and include a call-to-action. Add specific services and unique value proposition.'
        },
        headings: {
            h1_tags: ['Dental Services'],
            h2_tags: ['Our Services', 'Why Choose Us', 'Contact Information'],
            feedback: 'Good H1 usage (only one H1). H2 structure is logical but could be more keyword-rich. Consider adding H2s like "Cosmetic Dentistry in [City]" or "Emergency Dental Services".'
        },
        content_analysis: {
            keyword_usage: 'Primary keyword appears 3 times (good density). Consider adding semantic keywords like "oral health", "dental care", and "teeth cleaning" for better topical coverage.',
            readability: 'Content is clear and well-organized. Average sentence length is appropriate. Consider breaking up longer paragraphs for better mobile readability.',
            search_intent_alignment: 'Content partially matches search intent. Add more specific service details, pricing information, and patient testimonials to better serve commercial intent.'
        },
        internal_linking_suggestions: [
            'Add link to "About Us" page to build trust',
            'Link to specific service pages (e.g., "Dental Implants", "Teeth Whitening")',
            'Include link to "Patient Reviews" or testimonials page',
            'Add link to "Contact Us" or appointment booking page in CTA'
        ],
        eeat_signals: {
            present: [
                'Contact information visible',
                'Service descriptions provided'
            ],
            suggestions: [
                'Add detailed dentist bios with credentials and photos',
                'Include patient testimonials with real names and photos (with permission)',
                'Display professional certifications and awards',
                'Add "Last updated" date to show content freshness',
                'Include links to dental association memberships (ADA, state dental board)',
                'Embed video content showing the practice and team'
            ]
        }
    };
};
