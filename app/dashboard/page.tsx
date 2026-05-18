'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Profile, Prospect } from '@/lib/api';
import { fetchProspects, deleteProspect } from '@/lib/api';
import { formatDate, truncate } from '@/lib/utils';
import {
  Search,
  Trash2,
  ExternalLink,
  Copy,
  RefreshCw,
  Linkedin,
  Globe,
  MessageSquare,
  X,
  Loader2,
  Sparkles,
  FileDown,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(prof);
      }
      const pros = await fetchProspects();
      setProspects(pros);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProspect(id);
      setProspects(prospects.filter((p) => p.id !== id));
      if (selectedProspect?.id === id) setSelectedProspect(null);
      showToast('Prospect deleted', 'success');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleGenerateMessage = async (prospect: Prospect) => {
    setGeneratingMessage(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_message',
          prospectId: prospect.id,
        }),
      });
      const data = await res.json();
      if (data.outreach_message) {
        const updated = prospects.map((p) =>
          p.id === prospect.id
            ? { ...p, outreach_message: data.outreach_message }
            : p
        );
        setProspects(updated);
        setSelectedProspect({
          ...prospect,
          outreach_message: data.outreach_message,
        });
      }
    } catch {
      showToast('Failed to generate message', 'error');
    } finally {
      setGeneratingMessage(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Title',
      'Company',
      'Industry',
      'Location',
      'LinkedIn URL',
      'Source URL',
      'Notes',
      'Date Saved',
    ];
    const rows = prospects.map((p) => [
      p.person_name || '',
      p.person_title || '',
      p.company_name || '',
      p.company_industry || '',
      p.person_location || '',
      p.linkedin_url || '',
      p.source_url || '',
      p.notes || '',
      formatDate(p.created_at),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospectpilot-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported!', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProspects = prospects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.person_name?.toLowerCase() || '').includes(q) ||
      (p.company_name?.toLowerCase() || '').includes(q) ||
      (p.person_title?.toLowerCase() || '').includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prospects</h1>
          <p className="text-sm text-gray-500 mt-1">
            {profile && (
              <span>
                {profile.plan === 'free'
                  ? `${profile.credits_remaining} credits remaining this month`
                  : 'Unlimited lookups'}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={prospects.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, company, or title..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : prospects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No prospects yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Install the Chrome extension, then visit any LinkedIn profile or
            company website and click the ProspectPilot button to save your
            first lead.
          </p>
          <a
            href="/"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Learn how it works →
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProspects.map((prospect) => (
            <div
              key={prospect.id}
              className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => setSelectedProspect(prospect)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">
                      {prospect.person_name || 'Unknown'}
                    </h3>
                    {prospect.source_type === 'linkedin_profile' ? (
                      <Linkedin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {prospect.person_title || 'No title'}
                    {prospect.company_name && (
                      <>
                        {' '}
                        at{' '}
                        <span className="text-gray-700">
                          {prospect.company_name}
                        </span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {prospect.company_industry && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                        {prospect.company_industry}
                      </span>
                    )}
                    {prospect.person_location && (
                      <span className="text-xs text-gray-400">
                        {prospect.person_location}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDate(prospect.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {prospect.outreach_message && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Ready
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(prospect.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedProspect(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
            <button
              onClick={() => setSelectedProspect(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">
                {selectedProspect.person_name || 'Unknown'}
              </h2>
              <p className="text-gray-500">
                {selectedProspect.person_title || 'No title'}
                {selectedProspect.company_name && (
                  <> at {selectedProspect.company_name}</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Location', value: selectedProspect.person_location },
                { label: 'Industry', value: selectedProspect.company_industry },
                { label: 'Company Size', value: selectedProspect.company_size },
                { label: 'Company Domain', value: selectedProspect.company_domain },
              ].map(
                (item) =>
                  item.value && (
                    <div
                      key={item.label}
                      className="bg-gray-50 rounded-xl p-3"
                    >
                      <p className="text-xs text-gray-400 mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  )
              )}
            </div>

            {selectedProspect.company_description && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  About {selectedProspect.company_name}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedProspect.company_description}
                </p>
              </div>
            )}

            {selectedProspect.company_tech_stack &&
              selectedProspect.company_tech_stack.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProspect.company_tech_stack as string[]).map(
                      (tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            {selectedProspect.linkedin_url && (
              <a
                href={selectedProspect.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View LinkedIn Profile
              </a>
            )}

            {/* AI Outreach Message */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  AI Outreach Message
                </h4>
                <button
                  onClick={() => handleGenerateMessage(selectedProspect)}
                  disabled={generatingMessage}
                  className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {generatingMessage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {selectedProspect.outreach_message
                    ? 'Regenerate'
                    : 'Generate'}
                </button>
              </div>
              {selectedProspect.outreach_message ? (
                <div className="relative bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pr-8">
                    {selectedProspect.outreach_message}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        selectedProspect.outreach_message || ''
                      );
                      showToast('Copied to clipboard!', 'success');
                    }}
                    className="absolute top-3 right-3 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Click &quot;Generate&quot; to create a personalized outreach
                  message using AI.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
