'use client';
import { useState, useEffect, useRef } from 'react';
import { Headphones, Play, Pause, Square, CheckCircle, RefreshCw, ArrowLeft, Volume2, Music } from 'lucide-react';
import Link from 'next/link';

export default function ListeningPage() {
    const [topic, setTopic] = useState('University Life');
    const [data, setData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPart, setCurrentPart] = useState(0); // 0-indexed for Part 1 (0), Part 2 (1), etc.

    // Audio State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState([]);
    const synthRef = useRef(null);
    const utteranceRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis;
            const loadVoices = () => {
                setVoices(window.speechSynthesis.getVoices());
            };
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
        return () => {
            stopAudio();
        };
    }, []);

    const stopAudio = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsPlaying(false);
            setIsPaused(false);
        }
    };

    const playAudio = () => {
        const script = data?.parts?.[currentPart]?.script;
        if (!script) return;

        if (isPaused && synthRef.current?.paused) {
            synthRef.current.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        if (synthRef.current?.speaking) return;

        // Select Voices
        // Try to find a male and female voice, or distinct ones
        const voice1 = voices.find(v => v.name.includes("Google US English") || v.name.includes("Male")) || voices[0];
        const voice2 = voices.find(v => v.name.includes("Google UK English Female") || v.name.includes("Female")) || voices[1] || voice1;

        // Check if dialogue (simple heuristic based on "Speaker" or new lines with colons)
        if (script.includes("Speaker") || (script.includes(":") && script.includes("\n"))) {
            const lines = script.split('\n');
            let hasSpoken = false;

            lines.forEach((line, index) => {
                // Determine speaker
                let isSpeaker2 = line.toLowerCase().includes("speaker 2") || line.toLowerCase().includes("person 2") || line.toLowerCase().includes("woman");

                // Clean text: Remove "Speaker 1:" prefix
                const cleanText = line.replace(/^(Speaker \d:|Person \d:|Man:|Woman:)/i, "").trim();

                if (cleanText) {
                    const utterance = new SpeechSynthesisUtterance(cleanText);
                    utterance.voice = isSpeaker2 ? voice2 : voice1;
                    utterance.rate = 0.9; // Slightly slower for listening test clarity
                    utterance.pitch = isSpeaker2 ? 1.1 : 1.0;

                    // Handle end of entire script
                    if (index === lines.length - 1) {
                        utterance.onend = () => {
                            setIsPlaying(false);
                            setIsPaused(false);
                        };
                    }

                    synthRef.current.speak(utterance);
                    hasSpoken = true;
                }
            });

            if (hasSpoken) {
                setIsPlaying(true);
                setIsPaused(false);
            }
        } else {
            // Monologue fallback
            const utterance = new SpeechSynthesisUtterance(script);
            utterance.voice = voice1; // Default to first voice
            utterance.rate = 0.9;
            utterance.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
            };

            utteranceRef.current = utterance;
            synthRef.current.speak(utterance);
            setIsPlaying(true);
            setIsPaused(false);
        }
    };

    const pauseAudio = () => {
        if (synthRef.current?.speaking && !synthRef.current?.paused) {
            synthRef.current.pause();
            setIsPaused(true);
            setIsPlaying(false);
        }
    };

    const handleGenerate = async () => {
        stopAudio();
        setLoading(true);
        setSubmitted(false);
        setAnswers({});
        setData(null);
        setCurrentPart(0);

        const prompt = `Generate a complete 4-Part IELTS Listening Test on the general theme: "${topic}".
    Total approx 5-6 questions per part (20-24 questions total).

    Structure:
    - Part 1: Conversation between two people (e.g., Receptionist and Guest). IMPORTANT: Write the script as dialogue with clearly marked speakers like "Speaker 1:" and "Speaker 2:" on separate lines.
    - Part 2: Monologue (e.g., Tour Guide).
    - Part 3: Conversation between up to 4 people. IMPORTANT: Write as dialogue with speakers "Speaker 1:", "Speaker 2:", etc.
    - Part 4: Academic Monologue.

    Provide output in strict JSON format:
    {
      "title": "Full IELTS Listening Test",
      "parts": [
        {
          "id": 1,
          "title": "Part 1: Social Conversation",
          "script": "Speaker 1: Hello...\\nSpeaker 2: Hi...",
          "questions": [
             { "id": 101, "type": "blank", "text": "Form: Name: ____", "answer": "Smith" },
             { "id": 102, "type": "MCQ", "text": "Why is he calling?", "options": ["A", "B", "C"], "correctAnswer": "A" }
          ]
        },
        { 
          "id": 2, 
          "title": "Part 2: Social Monologue", 
          "script": "Welcome to the park...", 
          "questions": [
             { "id": 201, "type": "MCQ", "text": "Open times...", "options": ["9am", "10am", "11am"], "correctAnswer": "9am" }
          ] 
        },
        { 
          "id": 3, 
          "title": "Part 3: Academic Discussion", 
          "script": "Speaker 1: The theory states...\\nSpeaker 2: But I disagree...", 
          "questions": [
             { "id": 301, "type": "MCQ", "text": "What is the main topic?", "options": ["A", "B", "C"], "correctAnswer": "A" }
          ] 
        },
        { 
           "id": 4, 
           "title": "Part 4: Academic Lecture", 
           "script": "Today we discuss history...", 
           "questions": [
              { "id": 401, "type": "blank", "text": "The year was ____", "answer": "1990" }
           ] 
        }
      ]
    }
    Ensure questions in 'parts' have unique IDs.
    For 'blank' type, 'answer' is the correct word.
    For 'MCQ', 'correctAnswer' is the option text.
    Ensure every part has at least 5 questions.
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
            alert('Failed to generate listening practice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                                <Headphones size={18} />
                            </div>
                            Listening Practice
                        </h1>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            {['University Life', 'Travel', 'Science', 'Business', 'Social Issues'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={14} /> : 'New Test'}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto max-w-4xl p-6 md:p-8">
                {!data && !loading && (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-3xl shadow-sm">
                        <div className="bg-slate-50 p-6 rounded-full mb-6">
                            <Headphones size={48} className="text-slate-300" />
                        </div>
                        <p className="font-medium">Select a topic and generate a full listening test.</p>
                    </div>
                )}

                {loading && (
                    <div className="h-96 flex flex-col items-center justify-center text-emerald-500">
                        <RefreshCw className="animate-spin mb-4" size={40} />
                        <p className="font-medium text-emerald-700">Composing full exam (4 parts)...</p>
                    </div>
                )}

                {data && !loading && data.parts && (
                    <div className="space-y-8">
                        {/* Part Tabs */}
                        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                            {data.parts.map((part, index) => (
                                <button
                                    key={part.id}
                                    onClick={() => {
                                        stopAudio();
                                        setCurrentPart(index);
                                    }}
                                    className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${currentPart === index
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    Part {part.id}
                                </button>
                            ))}
                        </div>

                        {/* Audio Player Card - Plays Current Part Script */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
                                <Music size={32} />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mb-2">{data.parts[currentPart].title}</h2>
                            <p className="text-slate-500 text-sm mb-8">Listen to the audio and answer the questions below.</p>

                            <div className="flex items-center gap-6">
                                <button
                                    onClick={stopAudio}
                                    className="w-12 h-12 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <Square size={20} />
                                </button>

                                {!isPlaying ? (
                                    <button
                                        onClick={playAudio}
                                        className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition-all hover:scale-105 shadow-xl shadow-emerald-500/25"
                                    >
                                        <Play size={36} className="ml-1" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={pauseAudio}
                                        className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white transition-all shadow-xl shadow-amber-500/25"
                                    >
                                        <Pause size={36} />
                                    </button>
                                )}

                                <div className="w-12 h-12 flex items-center justify-center">
                                    <Volume2 size={20} className={`transition-colors ${isPlaying ? 'text-emerald-500' : 'text-slate-300'}`} />
                                </div>
                            </div>
                            <p className="mt-6 text-emerald-600/60 text-sm font-semibold tracking-wide uppercase">
                                {isPlaying ? 'Now Playing' : 'Ready to Play'}
                            </p>
                        </div>

                        {/* Questions for Current Part */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 ml-2">Questions - Part {data.parts[currentPart].id}</h3>

                            <div className="grid gap-6">
                                {data.parts[currentPart].questions && data.parts[currentPart].questions.length > 0 ? (
                                    data.parts[currentPart].questions.map((q, idx) => (
                                        <div key={q.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                                            <div className="flex gap-4 mb-4">
                                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {/* Global numbering approximation */}
                                                    {(currentPart * 5) + (idx + 1)}
                                                </span>
                                                <p className="text-slate-800 font-medium pt-1">{q.text}</p>
                                            </div>

                                            <div className="ml-12">
                                                {q.type === 'MCQ' ? (
                                                    <div className="space-y-3">
                                                        {q.options.map(opt => (
                                                            <label key={opt} className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all ${submitted
                                                                ? opt === q.correctAnswer
                                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                                    : answers[q.id] === opt ? 'bg-red-50 border-red-200 text-red-800' : 'border-slate-100 bg-white opacity-60'
                                                                : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                                                                }`}>
                                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors ${answers[q.id] === opt ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                                                                    }`}>
                                                                    {answers[q.id] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                                                                </div>
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${q.id}`}
                                                                    className="hidden"
                                                                    disabled={submitted}
                                                                    checked={answers[q.id] === opt}
                                                                    onChange={() => !submitted && setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                                                />
                                                                <span className="text-slate-700 font-medium text-sm">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Type your answer..."
                                                            disabled={submitted}
                                                            value={answers[q.id] || ''}
                                                            onChange={(e) => !submitted && setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                            className={`w-full max-w-sm bg-slate-50 border rounded-xl px-4 py-3 text-slate-800 focus:outline-none transition-all ${submitted
                                                                ? answers[q.id]?.toLowerCase()?.trim() === q.answer?.toLowerCase()?.trim()
                                                                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700'
                                                                    : 'border-red-500 bg-red-50/50 text-red-700'
                                                                : 'border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10'
                                                                }`}
                                                        />
                                                        {submitted && answers[q.id]?.toLowerCase()?.trim() !== q.answer?.toLowerCase()?.trim() && (
                                                            <p className="text-emerald-600 text-sm mt-2 font-medium bg-emerald-50 inline-block px-3 py-1 rounded-lg">Correct: {q.answer}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                                        <p className="text-slate-500">No questions generated for this part.</p>
                                    </div>
                                )}
                            </div>

                            <div className="py-6 flex justify-between items-center bg-slate-50 sticky bottom-0 z-10 p-4 border-t border-slate-200 rounded-xl mt-8">
                                <div className="text-sm text-slate-500">
                                    Part {currentPart + 1} of 4
                                </div>
                                <div className="flex gap-4">
                                    {currentPart > 0 && (
                                        <button
                                            onClick={() => { stopAudio(); setCurrentPart(p => p - 1); }}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                                        >
                                            Previous Part
                                        </button>
                                    )}
                                    {currentPart < 3 ? (
                                        <button
                                            onClick={() => { stopAudio(); setCurrentPart(p => p + 1); }}
                                            className="px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium"
                                        >
                                            Next Part
                                        </button>
                                    ) : (
                                        !submitted && (
                                            <button
                                                onClick={() => setSubmitted(true)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:transform hover:-translate-y-0.5"
                                            >
                                                Submit All Parts
                                            </button>
                                        )
                                    )}
                                    {submitted && (
                                        <button onClick={handleGenerate} className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-colors">
                                            Try New Test
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
