'use client';
import { PenTool, Mic, BookOpen, Headphones, MessageSquare, GraduationCap } from 'lucide-react';
import ModuleCard from '../components/ModuleCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar / Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <GraduationCap size={20} />
            </div>
            IELTS AI Coach
          </div>
          <div className="text-sm font-medium text-slate-500">
            v1.0.0
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-6xl px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-24 max-w-3xl mx-auto space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            AI-Powered Preparation
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Master your IELTS with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-400">Smart AI</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Instant scoring, detailed feedback, and endless practice materials for all four modules.
            Your personal tutor, available 24/7.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ModuleCard
            title="Writing Assistant"
            description="Get instant Band 0-9 scoring and feedback on your vocabulary and grammar."
            icon={PenTool}
            href="/modules/writing"
            color="text-pink-500"
          />

          <ModuleCard
            title="Speaking Coach"
            description="Record yourself and get analysis on pronunciation, fluency, and coherence."
            icon={Mic}
            href="/modules/speaking"
            color="text-sky-500"
          />

          <ModuleCard
            title="Reading Practice"
            description="Generate unlimited practice passages with questions tailored to your topic."
            icon={BookOpen}
            href="/modules/reading"
            color="text-amber-500"
          />

          <ModuleCard
            title="Listening Test"
            description="Practice listening with realistic AI-generated audio and comprehension questions."
            icon={Headphones}
            href="/modules/listening"
            color="text-emerald-500"
          />

          <ModuleCard
            title="AI Tutor Chat"
            description="Ask questions about exam formats, improved phrases, or general tips."
            icon={MessageSquare}
            href="/chat"
            color="text-indigo-500"
          />
        </div>

        {/* Footer info or CTA */}
        <div className="mt-24 text-center border-t border-slate-200 pt-12">
          <p className="text-slate-400 text-sm">
            Powered by Google Gemini 2.5 Flash. Designed for Academic & General Training.
          </p>
        </div>
      </div>
    </div>
  );
}
