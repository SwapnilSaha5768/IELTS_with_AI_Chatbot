'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your AI IELTS Tutor. ask me anything about exam formats, tips, or grammar!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/generative-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: 'model', text: data.result }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto max-w-4xl px-4 h-16 flex items-center">
                    <Link href="/" className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800">AI Tutor Chat</h1>
                </div>
            </nav>

            {/* Chat Area */}
            <div className="flex-1 container mx-auto max-w-4xl p-4 flex flex-col">
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[calc(100vh-8rem)]">

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 mx-2 shadow-sm
                    ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-emerald-500 text-white'}`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>

                                    <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-tr-sm'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-1 mx-2">
                                        <Bot size={16} />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-sm shadow-sm">
                                        <Loader2 size={20} className="animate-spin text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex gap-3 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask specific questions..."
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/30"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-2">AI can make mistakes. Check important info.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
