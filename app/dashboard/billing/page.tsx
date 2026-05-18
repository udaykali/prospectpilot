'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile } from '@/lib/api';
import { Check, Zap, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your subscription and credits
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Plan</p>
            <h2 className="text-xl font-bold capitalize">
              {profile?.plan || 'Free'}
            </h2>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile?.plan === 'premium'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {profile?.plan === 'premium' ? 'Active' : `${profile?.credits_remaining ?? 0} credits left`}
          </div>
        </div>

        {profile?.plan === 'free' && (
          <Link
            href="/auth/login?signup=true"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            Upgrade to Premium <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-bold text-lg mb-2">Free</h3>
          <p className="text-3xl font-bold mb-4">
            $0<span className="text-base text-gray-400 font-normal">/mo</span>
          </p>
          <ul className="space-y-2 mb-6">
            {['20 leads/month', 'Basic company info', 'Dashboard access', 'CSV export'].map(
              (f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              )
            )}
          </ul>
          {profile?.plan === 'free' && (
            <span className="block text-center text-sm text-gray-400 py-2">
              Current plan
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl border-2 border-blue-500 p-6 relative">
          <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
            POPULAR
          </div>
          <h3 className="font-bold text-lg mb-2">Premium</h3>
          <p className="text-3xl font-bold mb-4">
            $10<span className="text-base text-gray-400 font-normal">/mo</span>
          </p>
          <ul className="space-y-2 mb-6">
            {[
              '300 leads/month',
              'Detailed company intel',
              'AI outreach messages',
              'Tech stack detection',
              'Priority support',
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {profile?.plan === 'premium' ? (
            <span className="block text-center text-sm text-blue-600 font-medium py-2">
              Current plan
            </span>
          ) : (
            <Link
              href="/auth/login?signup=true"
              className="block text-center bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Upgrade Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
