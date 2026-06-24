import React, { useState } from 'react';
import { Header } from './components/Header';
import { KeywordGenerator } from './components/KeywordGenerator';
import { ContentIdeation } from './components/ContentIdeation';
import { CompetitorAnalysis } from './components/CompetitorAnalysis';
import { ContentAnalyzer } from './components/ContentAnalyzer';
import { SchemaGenerator } from './components/SchemaGenerator';
import { OnPageSeoAnalyzer } from './components/OnPageSeoAnalyzer';
import { Chatbot } from './components/Chatbot';
import { KeywordIcon, ContentIcon, CompetitorIcon, AnalyzeIcon, SchemaIcon, PageSeoIcon } from './components/Icons';

type Tool = 'keywords' | 'content' | 'competitors' | 'analyzer' | 'schema' | 'seo-analyzer';

const tools: { id: Tool; title: string; description: string; icon: React.ReactElement; }[] = [
  { id: 'keywords', title: 'Keyword Generator', description: 'Discover relevant keywords for your SEO campaign.', icon: <KeywordIcon /> },
  { id: 'content', title: 'Content Ideation', description: 'Brainstorm content ideas for your website and blog.', icon: <ContentIcon /> },
  { id: 'competitors', title: 'Competitor Analysis', description: 'Identify and analyze key local competitors.', icon: <CompetitorIcon /> },
  { id: 'analyzer', title: 'Content Analyzer', description: 'Check if content sounds too AI-generated.', icon: <AnalyzeIcon /> },
  { id: 'schema', title: 'Schema Generator', description: 'Generate structured data markup for your website.', icon: <SchemaIcon /> },
  { id: 'seo-analyzer', title: 'SEO Analyzer', description: 'Get a detailed on-page SEO audit for any URL.', icon: <PageSeoIcon /> },
];

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="bg-surface p-6 rounded-2xl shadow-sm text-left w-full h-full border border-secondary/10 hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col items-start"
  >
    <div className="bg-secondary/10 text-secondary p-3 rounded-full mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </div>
    <h3 className="text-lg font-bold text-secondary mb-2 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-sm text-text-main/80 flex-grow leading-relaxed">{description}</p>
    <span className="text-sm font-bold text-primary mt-6 self-end flex items-center gap-1 group-hover:translate-x-1 transition-transform">
      Open Tool &rarr;
    </span>
  </button>
);


const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [keywordsForContent, setKeywordsForContent] = useState('');

  const handleKeywordsSelected = (keywords: string[]) => {
    setKeywordsForContent(keywords.join(', '));
    setActiveTool('content');
  };

  const handleBack = () => {
    setActiveTool(null);
  };

  const renderTool = () => {
    switch (activeTool) {
      case 'keywords':
        return <KeywordGenerator onKeywordsSelected={handleKeywordsSelected} onBack={handleBack} />;
      case 'content':
        return <ContentIdeation initialKeywords={keywordsForContent} onBack={handleBack} />;
      case 'competitors':
        return <CompetitorAnalysis onBack={handleBack} />;
      case 'analyzer':
        return <ContentAnalyzer onBack={handleBack} />;
      case 'schema':
        return <SchemaGenerator onBack={handleBack} />;
      case 'seo-analyzer':
        return <OnPageSeoAnalyzer onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Header />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTool === null ? (
            <div className="animate-fadeIn">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">SEO Toolkit</h2>
                <p className="text-text-main/70 text-lg max-w-2xl mx-auto">
                  Everything you need to optimize your dental practice's online presence, powered by AI.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    title={tool.title}
                    description={tool.description}
                    icon={tool.icon}
                    onClick={() => setActiveTool(tool.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {renderTool()}
            </div>
          )}
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default App;
