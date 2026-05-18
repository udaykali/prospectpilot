import { createClient } from '@/lib/supabase';

export type Prospect = {
  id: string;
  user_id: string;
  source_url: string;
  source_type: 'linkedin_profile' | 'company_website' | 'manual';
  person_name: string | null;
  person_title: string | null;
  person_location: string | null;
  person_about: string | null;
  company_name: string | null;
  company_domain: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_description: string | null;
  company_tech_stack: string[];
  linkedin_url: string | null;
  ai_summary: string | null;
  outreach_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: 'free' | 'premium';
  credits_remaining: number;
  created_at: string;
};

export async function fetchProspects(): Promise<Prospect[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteProspect(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('prospects').delete().eq('id', id);
  if (error) throw error;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}
