'use client';
import { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, RefreshCw, ArrowLeft, HelpCircle, Columns } from 'lucide-react';
import Link from 'next/link';

export default function ReadingPage() {
    const [topic, setTopic] = useState('Technology');
    const [data, setData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const topics = ['Technology', 'Environment', 'Education', 'History', 'Health'];

    const handleGenerate = async () => {
        setLoading(true);
        setSubmitted(false);
        setAnswers({});
        setData(null);

        const prompt = `Generate an IELTS Academic Reading passage (approx 600-750 words) on the topic: "${topic}".
    Include exactly 13-14 questions in total, split into different types as in a real exam:
    - Multiple Choice Questions (MCQ)
    - True/False/Not Given (TFNG)
    - Fill within the Blank / Sentence Completion (FillInTheBlank)
    - Summary Completion (SummaryCompletion)

    Provide output in strict JSON format:
    {
      "title": "Passage Title",
      "passage": "Full passage text... (use \\n for new paragraphs)",
      "questions": [
        { 
          "id": 1, 
          "type": "MCQ", 
          "text": "Question text...", 
          "options": ["Option A", "Option B", "Option C", "Option D"], 
          "correctAnswer": "Option A", 
          "explanation": "Why it is correct" 
        },
        { 
          "id": 5, 
          "type": "TFNG", 
          "text": "Statement text...", 
          "options": ["True", "False", "Not Given"], 
          "correctAnswer": "True", 
          "explanation": "Why" 
        },
        { 
          "id": 10, 
          "type": "FillInTheBlank", 
          "text": "The sentence with a ______ for the missing word.", 
          "correctAnswer": "answer word", 
          "explanation": "Location in text" 
        }
      ]
    }
    For 'FillInTheBlank' and 'SummaryCompletion', do NOT provide 'options'. The 'text' should contain underscores or a marker for the blank if needed, but the user will type the answer.
    Ensure 'correctAnswer' is the exact string.
    `;

        try {
            const response = await fetch('/api/generative-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, format: 'json' })
            });

            const resData = await response.json();
            if (resData.error) throw new Error(resData.error);
            setData(resData.result);
        } catch (error) {
            alert(error.message || 'Failed to generate reading practice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (qId, option) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    const calculateScore = () => {
        if (!data) return 0;
        let correct = 0;
        data.questions.forEach(q => {
            const userAns = (answers[q.id] || '').trim().toLowerCase();
            const correctAns = (q.correctAnswer || '').trim().toLowerCase();
            if (userAns === correctAns) correct++;
        });
        return correct;
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <nav className="bg-white border-b border-slate-200 flex-shrink-0 z-20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                                <BookOpen size={18} />
                            </div>
                            Reading Practice
                        </h1>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium cursor-pointer"
                            >
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <Columns size={14} />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Generate New'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                            <RefreshCw className="animate-spin mx-auto mb-4 text-amber-500" size={40} />
                            <p className="text-slate-600 font-medium">Generating unique passage...</p>
                        </div>
                    </div>
                )}

                {!loading && !data && (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        <div className="text-center max-w-md p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                            <BookOpen size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-600 font-medium">Select a topic above and click &quot;Generate New&quot;.</p>
                        </div>
                    </div>
                )}

                {data && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-2">
                        {/* Left: Passage */}
                        <div className="h-full overflow-y-auto p-8 bg-white border-r border-slate-200 lg:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
                            <div className="max-w-2xl mx-auto">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-serif leading-tight">
                                    {data.title}
                                </h2>
                                <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-8 font-serif">
                                    {data.passage.split('\n').map((para, i) => (
                                        <p key={i} className="mb-6 indent-8">{para}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Questions */}
                        <div className="h-full overflow-y-auto bg-slate-50">
                            <div className="max-w-2xl mx-auto p-8 pb-32">
                                <div className="space-y-6">
                                    {data.questions.map((q, index) => (
                                        <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                            <div className="flex gap-4 mb-4">
                                                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-50 text-amber-600 text-sm flex items-center justify-center font-bold border border-amber-100">
                                                    {index + 1}
                                                </span>
                                                <p className="font-medium text-slate-800 pt-0.5">{q.text}</p>
                                            </div>

                                            <div className="space-y-2 ml-11">
                                                {['MCQ', 'TFNG'].includes(q.type) ? (
                                                    q.options?.map(opt => {
                                                        const isSelected = answers[q.id] === opt;
                                                        const isCorrect = q.correctAnswer === opt;

                                                        // Determine classes
                                                        let containerClass = "w-full text-left p-3.5 rounded-xl border transition-all text-sm font-medium flex justify-between items-center group ";

                                                        if (submitted) {
                                                            if (isCorrect) containerClass += "bg-emerald-50 border-emerald-200 text-emerald-700";
                                                            else if (isSelected) containerClass += "bg-red-50 border-red-200 text-red-700";
                                                            else containerClass += "bg-white border-slate-100 text-slate-400 opacity-60";
                                                        } else {
                                                            if (isSelected) containerClass += "bg-amber-50 border-amber-200 text-amber-900 shadow-sm";
                                                            else containerClass += "bg-white border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-slate-50";
                                                        }

                                                        return (
                                                            <button
                                                                key={opt}
                                                                onClick={() => handleSelectAnswer(q.id, opt)}
                                                                className={containerClass}
                                                                disabled={submitted}
                                                            >
                                                                <span>{opt}</span>
                                                                {submitted && isCorrect && <CheckCircle size={18} className="text-emerald-500" />}
                                                                {submitted && isSelected && !isCorrect && <XCircle size={18} className="text-red-500" />}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    // Text Input for FillInTheBlank / SummaryCompletion
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={answers[q.id] || ''}
                                                            onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                                                            disabled={submitted}
                                                            placeholder="Type your answer here..."
                                                            className={`w-full p-3.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all
                                                                ${submitted
                                                                    ? (answers[q.id] || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase()
                                                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                                                        : "bg-red-50 border-red-200 text-red-800"
                                                                    : "bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 text-slate-800"
                                                                }
                                                            `}
                                                        />
                                                        {submitted && (
                                                            <div className="absolute right-3 top-3.5 flex items-center gap-2">
                                                                {(answers[q.id] || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase() ? (
                                                                    <CheckCircle size={18} className="text-emerald-500" />
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                                                                            Ans: {q.correctAnswer}
                                                                        </span>
                                                                        <XCircle size={18} className="text-red-500" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {submitted && (
                                                <div className="ml-11 mt-4 p-4 bg-sky-50 rounded-xl text-sm text-sky-800 border border-sky-100 flex gap-3">
                                                    <HelpCircle size={18} className="flex-shrink-0 mt-0.5 text-sky-500" />
                                                    <p>{q.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action Bar */}
                        <div className="absolute bottom-0 right-0 w-full lg:w-1/2 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 lg:px-8 flex items-center justify-between z-20">
                            {!submitted ? (
                                <div className="w-full max-w-2xl mx-auto flex justify-end">
                                    <p className="text-slate-500 text-sm mr-4 self-center">Answer all questions to submit</p>
                                    <button
                                        onClick={() => setSubmitted(true)}
                                        disabled={Object.keys(answers).length < data.questions.length}
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
                                    >
                                        Submit Answers
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Your Score</div>
                                        <div className="text-3xl font-extrabold text-slate-800">
                                            <span className="text-amber-500">{calculateScore()}</span>
                                            <span className="text-slate-300 text-2xl">/</span>
                                            {data.questions.length}
                                        </div>
                                    </div>
                                    <button onClick={handleGenerate} className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-colors">
                                        Try Another Passage
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
