'use client';
import { useState } from 'react';
import { PenTool, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function WritingPage() {
    const [topic, setTopic] = useState('');
    const [essay, setEssay] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleEvaluate = async () => {
        if (!essay.trim()) return;

        setLoading(true);
        setResult(null);

        // Construct the prompt
        const prompt = `Act as an strict IELTS Examiner. Evaluate the following essay based on the topic provided.
    
    Topic: ${topic || 'General Writing Task'}
    Essay: ${essay}

    Provide the output in strict JSON format with the following fields:
    - band_score (number, 0-9, increments of 0.5)
    - breakdown: object containing 'task_response', 'coherence_cohesion', 'lexical_resource', 'grammatical_range_accuracy' (string scores or brief comments)
    - detailed_feedback (string, comprehensive feedback)
    - improvements (array of strings, specific suggestions)
    - corrected_sample (string, a rewritten version of a paragraph or the whole essay if short, maximizing quality)
    `;

        try {
            const response = await fetch('/api/generative-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, format: 'json' })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setResult(data.result);
        } catch (error) {
            alert('Failed to evaluate essay. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center">
                    <Link href="/" className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <div className="bg-pink-100 p-1.5 rounded-lg text-pink-600">
                            <PenTool size={18} />
                        </div>
                        Writing Evaluator
                    </h1>
                </div>
            </nav>

            <div className="container mx-auto max-w-6xl p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <label className="block text-slate-700 mb-2 font-semibold text-sm uppercase tracking-wide">Task Topic / Prompt</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none h-32 resize-none transition-all placeholder:text-slate-400"
                                placeholder="e.g., Some people think that technology allows..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <label className="block text-slate-700 mb-2 font-semibold text-sm uppercase tracking-wide">Your Essay</label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none h-[500px] resize-y font-serif leading-relaxed text-lg transition-all placeholder:text-slate-400"
                                placeholder="Type or paste your essay here..."
                                value={essay}
                                onChange={(e) => setEssay(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleEvaluate}
                            disabled={loading || !essay}
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-600/30 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2"><RefreshCw className="animate-spin" /> Evaluating...</span>
                            ) : (
                                'Get Instant Evaluation'
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 overflow-y-auto custom-scrollbar rounded-2xl">
                        {result ? (
                            <div className="space-y-6 animate-fade-in-up pb-10">
                                {/* Score Card */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Overall Band Score</p>
                                    <div className="text-7xl font-extrabold text-slate-900 mt-4 mb-2 tracking-tighter">{result.band_score}</div>
                                    <div className="flex justify-center gap-1.5 mt-4">
                                        {[...Array(9)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-2.5 w-10 rounded-full transition-all ${i < Math.floor(result.band_score) ? 'bg-pink-500' : 'bg-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Feedback Breakdown */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <AlertCircle className="text-amber-500" size={20} />
                                        Detailed Breakdown
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.breakdown && Object.entries(result.breakdown).map(([key, value]) => (
                                            <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1 tracking-wider">
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                                <p className="font-medium text-slate-800 text-sm">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Detailed & Improvements */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Feedback</h3>
                                    <p className="text-slate-600 leading-relaxed mb-8">{result.detailed_feedback}</p>

                                    <h4 className="font-bold text-pink-600 mb-4 flex items-center gap-2">
                                        <ChevronRight size={16} /> Key Improvements
                                    </h4>
                                    <ul className="space-y-3">
                                        {result.improvements?.map((item, i) => (
                                            <li key={i} className="flex gap-3 text-slate-700 bg-pink-50/50 p-3 rounded-lg border border-pink-100/50">
                                                <CheckCircle className="text-pink-500 flex-shrink-0 mt-0.5" size={18} />
                                                <span className="text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Corrected Sample */}
                                {result.corrected_sample && (
                                    <div className="bg-indigo-900 text-white rounded-2xl p-8 shadow-xl shadow-indigo-900/20">
                                        <h3 className="text-xl font-bold mb-4">Refined Version</h3>
                                        <div className="relative">
                                            <span className="absolute -top-4 -left-2 text-6xl text-indigo-700 opacity-50 font-serif">&quot;</span>
                                            <p className="text-indigo-100 italic font-serif leading-loose text-lg relative z-10 pl-6 border-l-2 border-indigo-700">
                                                {result.corrected_sample}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50/50">
                                <div className="max-w-sm">
                                    <div className="bg-white p-6 rounded-full inline-block shadow-sm mb-6">
                                        <PenTool size={48} className="text-pink-200" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold text-lg mb-2">Ready to Evaluate</h3>
                                    <p className="text-slate-500">Enter your essay and topic to receive a comprehensive band score and feedback.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
