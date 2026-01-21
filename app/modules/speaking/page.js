'use client';
import { useState, useRef } from 'react';
import { Mic, Square, Loader2, ArrowLeft, CheckCircle, Smartphone, Volume2 } from 'lucide-react';
import Link from 'next/link';

export default function SpeakingPage() {
    const [topic, setTopic] = useState('Describe a memorable journey you have taken.');
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = handleStop;
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error(err);
            setError("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleStop = async () => {
        setLoading(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];
            await evaluateAudio(base64Audio);
        };
    };

    const evaluateAudio = async (base64Audio) => {
        const prompt = `Act as an IELTS Speaking Examiner. Listen to the user's response to the topic: "${topic}".
    Evaluate the speaking based on:
    - Fluency and Coherence
    - Lexical Resource
    - Grammatical Range and Accuracy
    - Pronunciation
    
    Provide output in strict JSON format:
    {
      "band_score": number (0-9),
      "breakdown": {
         "fluency": "score/comment",
         "vocabulary": "score/comment",
         "grammar": "score/comment",
         "pronunciation": "score/comment"
      },
      "feedback": "Overall detailed feedback",
      "tips": ["Tip 1", "Tip 2"]
    }
    `;

        try {
            const response = await fetch('/api/generative-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    format: 'json',
                    audio: {
                        data: base64Audio,
                        mimeType: 'audio/webm'
                    }
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setResult(data.result);
        } catch (err) {
            setError("Evaluation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center">
                    <Link href="/" className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <div className="bg-sky-100 p-1.5 rounded-lg text-sky-600">
                            <Mic size={18} />
                        </div>
                        Speaking Coach
                    </h1>
                </div>
            </nav>

            <div className="container mx-auto max-w-5xl p-6 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                    {/* Recorder Section */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center min-h-[500px] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-500"></div>

                        <div className="text-center mb-10 w-full">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Current Topic</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full text-center bg-transparent border-b-2 border-slate-100 focus:border-sky-500 text-slate-800 text-xl font-medium pb-2 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="relative mb-12 group">
                            {isRecording && (
                                <>
                                    <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-20"></div>
                                    <div className="absolute inset-0 bg-sky-500 rounded-full animate-pulse opacity-10 scale-150"></div>
                                </>
                            )}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={loading}
                                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all z-10 relative shadow-2xl
                            ${isRecording
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                        : 'bg-gradient-to-br from-sky-400 to-blue-600 hover:scale-105 shadow-blue-500/30'} 
                            ${loading ? 'opacity-80 cursor-not-allowed transform-none' : 'cursor-pointer'}`}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin text-white" size={40} />
                                ) : isRecording ? (
                                    <Square className="fill-white text-white" size={32} />
                                ) : (
                                    <Mic className="text-white" size={48} />
                                )}
                            </button>
                            {!isRecording && !loading && (
                                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 text-center">
                                    <span className="text-sm text-slate-400 font-medium">Click to Record</span>
                                </div>
                            )}
                        </div>

                        <p className={`text-lg font-medium transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                            {loading ? 'Analyzing your speech...' : isRecording ? 'Recording is active...' : ''}
                        </p>

                        {error && (
                            <div className="absolute bottom-6 w-full px-6">
                                <p className="text-red-500 text-sm bg-red-50 py-2 px-4 rounded-lg text-center w-full">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm h-full min-h-[500px] overflow-y-auto custom-scrollbar relative">
                        {!result && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-4">
                                <div className="bg-slate-50 p-6 rounded-full">
                                    <Smartphone size={40} className="text-slate-300" />
                                </div>
                                <p className="max-w-xs">Record your answer to get instant feedback on pronunciation and fluency.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center space-y-6">
                                <div className="flex gap-2">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-3 h-12 bg-sky-200 rounded-full animate-wave" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                    ))}
                                </div>
                                <p className="text-sky-600 font-medium animate-pulse">Processing Audio...</p>
                            </div>
                        )}

                        {result && (
                            <div className="animate-fade-in-up space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Band Score</p>
                                        <div className="text-6xl font-extrabold text-slate-900 tracking-tighter">{result.band_score}</div>
                                    </div>
                                    <div className="h-16 w-16 rounded-full border-4 border-sky-100 flex items-center justify-center">
                                        <Volume2 className="text-sky-500" size={24} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                        <CheckCircle size={20} className="text-emerald-500" />
                                        Analysis
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.entries(result.breakdown).map(([key, val]) => (
                                            <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <span className="text-xs text-slate-400 uppercase font-bold block mb-1">{key}</span>
                                                <p className="text-sm text-slate-700 font-medium">{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 mb-3">Feedback</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                        {result.feedback}
                                    </p>
                                </div>

                                {result.tips && (
                                    <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100">
                                        <h4 className="text-sky-700 font-bold mb-3 text-sm flex items-center gap-2">
                                            Tips to Improve
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.tips.map((tip, i) => (
                                                <li key={i} className="text-sm text-sky-800 flex gap-2">
                                                    <span className="block w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0"></span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes wave {
            0%, 100% { height: 3rem; }
            50% { height: 1.5rem; }
        }
        .animate-wave {
            animation: wave 1s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
