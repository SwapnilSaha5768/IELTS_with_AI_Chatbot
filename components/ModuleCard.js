'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ModuleCard({ title, description, icon: Icon, href, color = 'bg-primary-500' }) {
    // Map hex colors or classes. For simplicity, we accept tailwind color classes like 'text-indigo-500'
    // But strictly, let's use the color prop for icon styling.

    return (
        <Link href={href} className="block group">
            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-lg shadow-slate-200/40 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1 h-full relative overflow-hidden">

                {/* Decorative Background Blob */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${color.replace('text', 'bg')}`}></div>

                <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${color.replace('text', 'bg')}/10`}>
                        <Icon size={28} className={color} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-primary-600 transition-colors">{title}</h3>
                    <p className="text-slate-500 mb-8 leading-relaxed h-12 line-clamp-2">
                        {description}
                    </p>

                    <div className={`flex items-center text-sm font-semibold transition-transform group-hover:translate-x-1 ${color}`}>
                        Start Module
                        <ArrowRight size={16} className="ml-2" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
