import React, { useState, useEffect } from 'react';
import { Building2, Shield, Users, Zap, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const FEATURE_SLIDES = [
  {
    icon: Shield,
    color: 'text-emerald-400',
    title: 'Enterprise-Grade Security',
    description: 'Multi-factor authentication, end-to-end encryption, and role-based permissions.'
  },
  {
    icon: Users,
    color: 'text-sky-400',
    title: 'Workforce & HR Intelligence',
    description: 'Seamless onboarding, attendance tracking, and performance analytics.'
  },
  {
    icon: Zap,
    color: 'text-indigo-400',
    title: 'Real-time Team Collaboration',
    description: 'Integrated messaging, task management, and project tracking in one portal.'
  }
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Left Panel: Enterprise Branding & Original Slate-to-Indigo Theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden flex-col justify-between p-12 lg:p-16">
        {/* Ambient Gradient Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky-500 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-purple-500 rounded-full blur-[90px]" />
        </div>

        {/* Top Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Building2 className="text-white" size={22} />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">EMS Portal</span>
              <span className="ml-2.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                Enterprise v2.4
              </span>
            </div>
          </div>

          <div className="mt-14 max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise<br />
              Management<br />
              System
            </h1>
            <p className="text-white/70 mt-4 text-base lg:text-lg leading-relaxed font-normal">
              Streamline your workforce management, project tracking, and team collaboration in one powerful platform.
            </p>
          </div>
        </div>

        {/* Feature Highlights Slider */}
        <div className="relative z-10 my-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
            {FEATURE_SLIDES.map((slide, index) => {
              const Icon = slide.icon;
              if (index !== activeSlide) return null;
              return (
                <div key={index} className="flex items-start gap-4 animate-fade-in">
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm shrink-0">
                    <Icon className={slide.color} size={22} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base">{slide.title}</h3>
                    <p className="text-white/60 text-sm mt-1 leading-relaxed">{slide.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-4 justify-start pl-1">
            {FEATURE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/40 border-t border-white/10 pt-6">
          <p>&copy; {new Date().getFullYear()} EMS Portal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 size={12} /> Secure Connection
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Clean Light Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile Header Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Building2 size={20} />
            </div>
            <span className="font-bold text-xl text-slate-900">EMS Portal</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
