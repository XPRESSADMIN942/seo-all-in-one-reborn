import React, { useState } from 'react';
import { generateSchemaMarkup } from '../services/geminiService';
import type { SchemaData } from '../types';
import { Card } from './Card';
import { SchemaIcon, CopyIcon, CloseIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

type SchemaType = 'None' | 'Local Business' | 'FAQ' | 'Article' | 'Service';

interface SchemaGeneratorProps {
    onBack: () => void;
}

const InputField = ({ id, label, value, onChange, placeholder = '', type = 'text', name }: { id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; placeholder?: string; type?: string; name?: string; }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {type === 'textarea' ? (
            <textarea
                id={id}
                name={name || id}
                rows={3}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-white border border-subtle-border rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary text-secondary transition-all"
            />
        ) : (
            <input
                id={id}
                name={name || id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-white border border-subtle-border rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary text-secondary transition-all"
            />
        )}
    </div>
);


export const SchemaGenerator: React.FC<SchemaGeneratorProps> = ({ onBack }) => {
    const [schemaType, setSchemaType] = useState<SchemaType>('None');
    const [formData, setFormData] = useState<any>({});
    const [faqItems, setFaqItems] = useState([{ question: '', answer: '' }]);
    const [generatedSchema, setGeneratedSchema] = useState<SchemaData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFaqChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newFaqItems = [...faqItems];
        newFaqItems[index] = { ...newFaqItems[index], [name]: value };
        setFaqItems(newFaqItems);
    };

    const addFaqItem = () => {
        setFaqItems([...faqItems, { question: '', answer: '' }]);
    };

    const removeFaqItem = (index: number) => {
        const newFaqItems = faqItems.filter((_, i) => i !== index);
        setFaqItems(newFaqItems);
    };

    const handleGenerate = async () => {
        setError('');
        setLoading(true);
        setGeneratedSchema(null);

        let dataToSend = schemaType === 'FAQ' ? { faqs: faqItems } : formData;

        try {
            const result = await generateSchemaMarkup(schemaType, dataToSend);
            setGeneratedSchema(result);
        } catch (err) {
            setError('Failed to generate schema. The AI may be experiencing issues or returned an invalid format. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedSchema) {
            const schemaString = `<script type="application/ld+json">\n${JSON.stringify(generatedSchema, null, 2)}\n</script>`;
            navigator.clipboard.writeText(schemaString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const renderForm = () => {
        switch (schemaType) {
            case 'Local Business':
                return (
                    <div className="space-y-4">
                        <InputField id="name" label="Business Name" value={formData.name || ''} onChange={handleFormChange} placeholder="e.g., SmileBright Dental" />
                        <InputField id="address" label="Full Address" value={formData.address || ''} onChange={handleFormChange} placeholder="e.g., 123 Main St, Anytown, USA 12345" />
                        <InputField id="telephone" label="Phone Number" value={formData.telephone || ''} onChange={handleFormChange} placeholder="e.g., +1-555-123-4567" />
                        <InputField id="url" label="Website URL" value={formData.url || ''} onChange={handleFormChange} placeholder="https://www.smilebrightdental.com" />
                        <InputField id="description" label="Business Description" value={formData.description || ''} onChange={handleFormChange} type="textarea" placeholder="A brief description of the dental practice and its services." />
                        <InputField id="openingHours" label="Opening Hours" value={formData.openingHours || ''} onChange={handleFormChange} placeholder="e.g., Mo-Fr 09:00-17:00" />
                    </div>
                );
            case 'FAQ':
                return (
                    <div className="space-y-4">
                        {faqItems.map((item, index) => (
                            <div key={index} className="p-4 bg-neutral rounded-lg border border-subtle-border space-y-3 relative">
                                <InputField id={`question-${index}`} label={`Question ${index + 1}`} value={item.question} onChange={(e) => handleFaqChange(index, e)} name="question" placeholder="What is the cost of teeth whitening?" />
                                <InputField id={`answer-${index}`} label={`Answer ${index + 1}`} value={item.answer} onChange={(e) => handleFaqChange(index, e)} name="answer" type="textarea" placeholder="The cost varies depending on the treatment type..." />
                                {faqItems.length > 1 && (
                                    <button onClick={() => removeFaqItem(index)} className="absolute top-2 right-2 text-gray-400 hover:text-error transition-colors">
                                        <CloseIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={addFaqItem} className="text-primary font-semibold text-sm hover:underline">+ Add another FAQ</button>
                    </div>
                );
            case 'Article':
                return (
                    <div className="space-y-4">
                        <InputField id="headline" label="Article Headline" value={formData.headline || ''} onChange={handleFormChange} />
                        <InputField id="author" label="Author Name" value={formData.author || ''} onChange={handleFormChange} />
                        <InputField id="publisher" label="Publisher Name (Your Practice)" value={formData.publisher || ''} onChange={handleFormChange} />
                        <InputField id="datePublished" label="Date Published" value={formData.datePublished || ''} onChange={handleFormChange} type="date" />
                        <InputField id="image" label="Featured Image URL" value={formData.image || ''} onChange={handleFormChange} placeholder="https://.../image.jpg" />
                    </div>
                );
            case 'Service':
                return (
                    <div className="space-y-4">
                        <InputField id="name" label="Service Name" value={formData.name || ''} onChange={handleFormChange} placeholder="e.g., Professional Teeth Whitening" />
                        <InputField id="description" label="Service Description" value={formData.description || ''} onChange={handleFormChange} type="textarea" placeholder="Describe the service, its benefits, and the process." />
                        <InputField id="provider" label="Provider Name (Your Practice)" value={formData.provider || ''} onChange={handleFormChange} />
                    </div>
                );
            default:
                return <p className="text-center text-gray-500 py-8 text-sm">Please select a schema type to begin.</p>;
        }
    };

    return (
        <Card title="Schema Generator" icon={<SchemaIcon />} onBack={onBack}>
            <div className="space-y-6">
                <p className="text-base-content text-sm">Generate JSON-LD schema markup for your dental website. Select a schema type, fill in the details, and get the code.</p>
                <div>
                    <label htmlFor="schema-type" className="block text-sm font-medium text-gray-700 mb-1">Schema Type</label>
                    <select
                        id="schema-type"
                        value={schemaType}
                        onChange={(e) => {
                            setSchemaType(e.target.value as SchemaType);
                            setFormData({}); // Reset form data on type change
                            setGeneratedSchema(null);
                        }}
                        className="w-full px-3 py-2 bg-white border border-subtle-border rounded-lg shadow-sm focus:ring-1 focus:ring-primary focus:border-primary text-secondary transition-all appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: `right 0.5rem center`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: `1.5em 1.5em`,
                        }}
                    >
                        <option value="None">-- Select a Type --</option>
                        <option value="Local Business">Local Business (Dentist)</option>
                        <option value="FAQ">FAQ Page</option>
                        <option value="Article">Article (Blog Post)</option>
                        <option value="Service">Service</option>
                    </select>
                </div>
            </div>

            {schemaType !== 'None' && (
                <div className="mt-6 pt-6 border-t border-subtle-border">
                    <h3 className="text-base font-semibold mb-4 text-secondary">{schemaType} Details</h3>
                    {renderForm()}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-focus disabled:bg-gray-300 disabled:text-gray-500 transition-all shadow-sm mt-6"
                    >
                        {loading ? 'Generating...' : 'Generate Schema'}
                    </button>
                    {error && <p className="text-error text-sm text-center mt-2">{error}</p>}
                </div>
            )}

            {(loading || generatedSchema) && (
                <div className="mt-6 pt-6 border-t border-subtle-border">
                    <h3 className="text-base font-semibold mb-4 text-secondary">Generated JSON-LD Schema</h3>
                    {loading ? (
                        <div className="py-10"><LoadingSpinner /></div>
                    ) : generatedSchema && (
                        <div className="bg-secondary rounded-lg border border-subtle-border overflow-hidden">
                            <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50">
                                <span className="text-xs text-gray-300 font-mono">JSON-LD+SCRIPT</span>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-xs bg-gray-600 text-white hover:bg-gray-500 px-2 py-1 rounded-md transition-colors disabled:opacity-50 font-medium"
                                    disabled={copied}
                                >
                                    <CopyIcon className="w-3.5 h-3.5" />
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                            </div>
                            <pre className="p-4 text-xs text-white overflow-x-auto">
                                <code>
                                    {`<script type="application/ld+json">\n`}
                                    {JSON.stringify(generatedSchema, null, 2)}
                                    {`\n</script>`}
                                </code>
                            </pre>
                        </div>
                    )}
                </div>
            )}

        </Card>
    );
};
