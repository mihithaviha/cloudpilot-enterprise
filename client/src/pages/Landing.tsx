import React, { useState } from 'react';
import { Terminal, Shield, ArrowRight, Play, CheckCircle2, ChevronDown, User, Star } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const features = [
    { title: 'AI Knowledge Retrieval (RAG)', desc: 'Upload documents (PDF, CSV, TXT) and chat directly with company policies and databases.', icon: Terminal },
    { title: 'Automated Workflow Runner', desc: 'Build and run event-driven state automations similar to Zapier (leave requests, billing cycles).', icon: Play },
    { title: 'AI Document Builder', desc: 'Generate verified legal contracts, job offer letters, PDF invoices, and minutes instantly.', icon: CheckCircle2 },
    { title: 'Role-Based Compliance', desc: 'Secure, granular roles (Admin, HR, Finance, Manager) mapping out precise compliance tracking.', icon: Shield }
  ];

  const pricing = [
    { name: 'Starter', price: '$29', desc: 'Ideal for small startups automating basic office admin workflows.', features: ['3 Team Seats', '100 MB Knowledge Base', '10 automated runs/month', 'Text File indexing'] },
    { name: 'Professional', price: '$99', desc: 'Designed for scaling companies needing RAG search and approvals.', features: ['15 Team Seats', '1 GB Knowledge Base', 'Unlimited custom workflows', 'Excel & Scanned PDF OCR', 'Priority Manager Approval routing'], recommended: true },
    { name: 'Enterprise', price: 'Custom', desc: 'Custom models, on-prem deployments, and dedicated RAG vectors.', features: ['Unlimited Seats', 'Dedicated Supabase instance', 'SLA Uptime guarantee', 'Custom fine-tuned models', 'Active audit log analytics'] }
  ];

  const faqs = [
    { q: 'How does the document AI Chat (RAG) work?', a: 'Retrieval-Augmented Generation processes uploaded documents, extracts text blocks, generates semantic search indices, and matches them to user queries. The AI assistant answers prompts by synthesizing content from matching files.' },
    { q: 'Can we integrate with external APIs?', a: 'Yes! CloudPilot AI includes a step execution runner that simulates triggers and actions mapping to third-party endpoints like Slack, Stripe, SendGrid, and Google Calendar.' },
    { q: 'Is my company data kept secure?', a: 'Data is protected using Supabase Row-Level Security (RLS) policies and encrypted at rest, ensuring users only retrieve files approved for their role.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. Header Bar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/60 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-brand-500 to-accent-500 p-2 rounded-xl text-white">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
            CloudPilot AI
          </span>
        </div>
        <button
          onClick={onStart}
          className="bg-brand-500 hover:bg-brand-600 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
        >
          <span>Launch Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 text-center">
        {/* Neon Glow Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative animate-slide-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-6">
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Introducing Workspace Agent Core v2.0</span>
          </span>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight mb-8">
            The Intelligent Agent Platform <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-400 bg-clip-text text-transparent">
              For Modern Business Automations
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
            Empower your team with a production-ready AI employee. Index files, ask complex company questions with RAG, auto-generate invoices, and construct Zapier-like automated approval paths.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={onStart}
              className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-brand-500/15 hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 border border-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Watch Product Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Features Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Platform Capabilities</h2>
          <p className="text-slate-400">Everything small and medium businesses need to eliminate operational drag.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl hover:border-brand-500/30 transition-all hover:scale-[1.02]"
              >
                <div className="bg-brand-500/10 p-3 rounded-xl text-brand-400 w-fit mb-5">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Pricing Matrix */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing Plans built to scale</h2>
          <p className="text-slate-400">Simple transparent tiers with zero contract requirements.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricing.map((tier, idx) => (
            <div
              key={idx}
              className={`bg-slate-900/40 rounded-3xl p-8 border relative flex flex-col justify-between ${
                tier.recommended 
                  ? 'border-brand-500/50 ring-2 ring-brand-500/20 shadow-2xl shadow-brand-500/10' 
                  : 'border-slate-850'
              }`}
            >
              {tier.recommended && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-brand-500 text-white tracking-wide shadow-md">
                  MOST POPULAR
                </span>
              )}
              <div>
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-xs mb-6">{tier.desc}</p>
                <div className="flex items-baseline gap-1.5 mb-8">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-slate-400 text-xs">/ month</span>}
                </div>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-brand-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onStart}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  tier.recommended
                    ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/10'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                Start Trial
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Testimonial */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 bg-slate-950">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Operations Teams</h2>
          <p className="text-slate-400">See how scaling businesses are driving operational efficiency.</p>
        </div>

        <div className="max-w-4xl mx-auto bg-slate-900/30 border border-slate-850 p-8 md:p-12 rounded-3xl text-center relative">
          <div className="flex justify-center gap-1 mb-6 text-amber-400">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
          </div>
          <p className="text-lg md:text-xl text-slate-200 italic leading-relaxed mb-8">
            "CloudPilot AI completely transformed our leave review and client billing. By connecting the local knowledge base to our manager approval paths, we reduced admin workload by nearly 70% in under a week."
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-100">David Henderson</p>
              <p className="text-xs text-slate-400">VP of Operations, Slackware Technologies</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-6 py-20 border-t border-slate-900">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = !!faqOpen[idx];
            return (
              <div
                key={idx}
                className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm hover:text-brand-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-400 text-xs leading-relaxed border-t border-slate-850/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Call To Action Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 p-1.5 rounded-lg text-white">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-350">CloudPilot AI</span>
          </div>
          <p>© 2026 TakeOver Hackathon entry. Designed for enterprise workflow excellence.</p>
        </div>
      </footer>

    </div>
  );
};

// Simple mini helper icons
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904zM18 10.5l-.5 3.5-3.5.5 3.5.5.5 3.5.5-3.5 3.5-.5-3.5-.5-.5-3.5z" />
  </svg>
);
export default Landing;
