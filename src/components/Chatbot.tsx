import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToChat, startChat } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { ChatIcon, CloseIcon, SendIcon, UserIcon, BotIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            startChat();
            setMessages([{ role: 'model', text: 'Hi! How can I help you with your SEO questions today?' }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await sendMessageToChat(input);
            setMessages([...newMessages, { role: 'model', text: responseText }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-base-100 transition-transform transform hover:scale-110 z-50"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <CloseIcon className="w-6 h-6" /> : <ChatIcon className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-subtle-border animate-fadeIn">
                    <header className="bg-white text-secondary p-4 flex justify-between items-center border-b border-subtle-border">
                        <h3 className="font-semibold text-base">SEO Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-900"><CloseIcon className="w-5 h-5" /></button>
                    </header>

                    <div className="flex-1 p-4 overflow-y-auto bg-base-100">
                        <div className="space-y-6">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && <div className="bg-secondary p-2 rounded-full shadow-sm"><BotIcon className="w-5 h-5 text-white" /></div>}
                                    <div className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-base-content rounded-bl-none border border-subtle-border'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    {msg.role === 'user' && <div className="bg-gray-200 p-2 rounded-full shadow-sm"><UserIcon className="w-5 h-5 text-gray-600" /></div>}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="bg-secondary p-2 rounded-full shadow-sm"><BotIcon className="w-5 h-5 text-white" /></div>
                                    <div className="max-w-xs px-4 py-3 rounded-2xl bg-white text-base-content rounded-bl-none border border-subtle-border shadow-sm">
                                        <LoadingSpinner size="sm" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="p-4 border-t border-subtle-border bg-white">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 px-4 py-2 bg-neutral border border-subtle-border text-secondary rounded-full focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-primary text-white p-3 rounded-full hover:bg-primary-focus disabled:bg-gray-300 transition-all"
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};
