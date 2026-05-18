'use client';

import {
  Zap,
  Search,
  MessageSquare,
  Download,
  Building2,
  Users,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">ProspectPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/login?signup=true"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Star className="w-3.5 h-3.5" />
            One-click lead research
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Research Leads in{' '}
            <span className="gradient-text">One Click</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            ProspectPilot turns any LinkedIn profile or company website into a
            rich lead record. Save prospects, get company intelligence, and
            generate personalized outreach — all from your browser.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/login?signup=true"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2"
            >
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="border border-gray-300 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all"
            >
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required · 20 free leads/month
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            Three clicks from browsing to actionable lead intelligence.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse & Click',
                desc: 'Visit any LinkedIn profile or company website. Click the ProspectPilot button in your browser toolbar.',
                icon: Search,
              },
              {
                step: '02',
                title: 'We Research',
                desc: 'We extract key details — name, title, company, tech stack, industry, size — and enrich the data instantly.',
                icon: Building2,
              },
              {
                step: '03',
                title: 'Save & Engage',
                desc: 'Your prospect is saved to your dashboard. Generate a personalized outreach message and export anytime.',
                icon: MessageSquare,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-bold text-blue-600 mb-2 block">
                  Step {item.step}
                </span>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            Stop switching between tabs. Do all your lead research in one place.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'One-Click Save',
                desc: 'Save leads from LinkedIn or any company website with a single click.',
              },
              {
                icon: Building2,
                title: 'Company Intel',
                desc: 'Company industry, size, description, and tech stack automatically detected.',
              },
              {
                icon: Users,
                title: 'Contact Details',
                desc: 'Names, titles, locations, and LinkedIn URLs extracted from profiles.',
              },
              {
                icon: MessageSquare,
                title: 'AI Outreach',
                desc: 'Generate personalized email/LinkedIn messages for each lead.',
              },
              {
                icon: Download,
                title: 'CSV Export',
                desc: 'Export all your leads to CSV for your CRM or spreadsheet.',
              },
              {
                icon: Search,
                title: 'Search & Filter',
                desc: 'Find any saved prospect by name, company, or title instantly.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Simple Pricing
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            Start free. Upgrade when you outgrow it.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-gray-500 text-sm mb-6">
                For casual lead research
              </p>
              <p className="text-4xl font-bold mb-6">
                $0<span className="text-lg text-gray-400 font-normal">/mo</span>
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  '20 leads/month',
                  'Basic company info',
                  'Dashboard access',
                  'Browser extension',
                  'CSV export',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login?signup=true"
                className="block w-full text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-500 relative hover:shadow-lg transition-shadow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <p className="text-gray-500 text-sm mb-6">
                For serious sales teams
              </p>
              <p className="text-4xl font-bold mb-6">
                $10<span className="text-lg text-gray-400 font-normal">/mo</span>
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  '300 leads/month',
                  'Detailed company intel',
                  'AI outreach messages',
                  'Tech stack detection',
                  'Priority support',
                  'Team features (coming soon)',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login?signup=true"
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start Researching Leads in Seconds
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Install the Chrome extension, create your account, and start saving
            leads. No credit card required.
          </p>
          <Link
            href="/auth/login?signup=true"
            className="inline-flex bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 items-center gap-2"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">ProspectPilot</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} ProspectPilot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
