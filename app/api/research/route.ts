import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Simple tech stack detection from page content
function detectTechStack(pageContent: string): string[] {
  const tech: string[] = [];
  const content = pageContent.toLowerCase();

  const patterns: Record<string, RegExp[]> = {
    React: [/react\.js/i, /react\./i, /createreactapp/i, /next\.js/i, /_next\//i],
    Vue: [/vue\.js/i, /vue\./i, /nuxt/i],
    Angular: [/angular\.js/i, /angular\./i],
    'Node.js': [/node\.js/i, /nodejs/i, /express/i],
    Python: [/django/i, /flask/i, /python/i, /fastapi/i],
    PHP: [/php/i, /laravel/i, /wordpress/i, /wp-content/i],
    Shopify: [/shopify/i, /myshopify\.com/i],
    'Next.js': [/next\.js/i, /_next\/static/i],
    Tailwind: [/tailwind/i],
    TypeScript: [/typescript/i],
    Docker: [/docker/i],
    AWS: [/aws/i, /amazonaws/i, /s3\.amazon/i, /cloudfront/i],
    Cloudflare: [/cloudflare/i],
    Stripe: [/stripe\.com/i, /stripe\.js/i],
    Algolia: [/algolia/i],
    Vercel: [/vercel/i, /vercel\.com/i],
    Netlify: [/netlify/i],
    'Google Analytics': [/gtag/i, /google-analytics/i, /analytics\.js/i],
    'HubSpot': [/hubspot/i, /hs-analytics/i],
    Intercom: [/intercom/i],
    'Salesforce': [/salesforce/i],
  };

  for (const [name, regexps] of Object.entries(patterns)) {
    if (regexps.some((r) => r.test(content))) {
      tech.push(name);
    }
  }

  return [...new Set(tech)].slice(0, 8);
}

// Extract company info from page meta tags
function extractMetaInfo(pageContent: string) {
  const result: Record<string, string> = {};

  const extractMeta = (name: string) => {
    const match = pageContent.match(
      new RegExp(
        `<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']+)["']`,
        'i'
      )
    );
    return match?.[1] || '';
  };

  const extractOG = (property: string) => {
    const match = pageContent.match(
      new RegExp(
        `<meta\\s+property=["']og:${property}["']\\s+content=["']([^"']+)["']`,
        'i'
      )
    );
    return match?.[1] || '';
  };

  result.title =
    pageContent.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
  result.description = extractMeta('description') || extractOG('description');
  result.siteName = extractOG('site_name');
  result.image = extractOG('image');

  // Extract company name from title (common patterns)
  let companyName = result.siteName || '';
  if (!companyName) {
    const title = result.title;
    // Try common patterns: "Company Name: ..." or "Company Name | ..." or "Company Name - ..."
    const match = title.match(/^([^:|\-]+)/);
    if (match) {
      companyName = match[1].trim();
    }
  }

  result.companyName = companyName;

  return result;
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, url, pageContent, prospectId } = body;

    // ACTION: Generate outreach message
    if (action === 'generate_message') {
      const { data: prospect } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', prospectId)
        .eq('user_id', user.id)
        .single();

      if (!prospect) {
        return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return NextResponse.json(
          { error: 'Gemini API key not configured on server. Get one at https://aistudio.google.com/apikey' },
          { status: 500 }
        );
      }

      // Build context for the AI
      const context = [
        prospect.person_name && `Name: ${prospect.person_name}`,
        prospect.person_title && `Title: ${prospect.person_title}`,
        prospect.company_name && `Company: ${prospect.company_name}`,
        prospect.company_industry && `Industry: ${prospect.company_industry}`,
        prospect.company_description && `About: ${prospect.company_description}`,
        prospect.person_location && `Location: ${prospect.person_location}`,
        prospect.person_about && `Bio: ${prospect.person_about}`,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are a sales outreach expert. Write a personalized, professional outreach message (2-3 paragraphs) for connecting with this prospect. The message should be warm, specific to their role and company, and end with a clear call to action. Do NOT use generic templates. Make it feel human and personal.\n\nHere is the prospect information:\n${context}`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 400,
              temperature: 0.7,
            },
          }),
        }
      );

      const data = await response.json();
      const message =
        data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate message.';

      // Save to database
      await supabase
        .from('prospects')
        .update({ outreach_message: message })
        .eq('id', prospectId);

      return NextResponse.json({ outreach_message: message });
    }

    // ACTION: Research URL
    if (action === 'research') {
      // Check credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      // Deduct credit for free users
      if (profile.plan === 'free' && profile.credits_remaining <= 0) {
        return NextResponse.json(
          { error: 'No credits remaining. Upgrade to Premium for unlimited lookups.' },
          { status: 402 }
        );
      }

      // Parse the URL to determine source type
      const isLinkedIn = url?.toLowerCase().includes('linkedin.com');
      const sourceType = isLinkedIn ? 'linkedin_profile' : 'company_website';

      let extractedData: Record<string, any> = {};

      if (pageContent) {
        if (isLinkedIn) {
          // Extract LinkedIn profile data from page content
          const nameMatch = pageContent.match(/<title>([^<]+)<\/title>/i);
          const headlineMatch = pageContent.match(
            /"headline"\s*:\s*"([^"]+)"/
          );
          const locationMatch = pageContent.match(
            /"geoLocationName"\s*:\s*"([^"]+)"/
          );
          const aboutMatch = pageContent.match(
            /"summary"\s*:\s*"([^"]+)"/
          );

          extractedData = {
            person_name: nameMatch
              ? nameMatch[1].replace(/\s*\|\s*LinkedIn.*$/, '').trim()
              : null,
            person_title: headlineMatch?.[1] || null,
            person_location: locationMatch?.[1] || null,
            person_about: aboutMatch?.[1] || null,
            linkedin_url: url,
          };
        } else {
          // Company website - extract meta info
          const metaInfo = extractMetaInfo(pageContent);
          const techStack = detectTechStack(pageContent);

          extractedData = {
            company_name: metaInfo.companyName || null,
            company_domain: url ? new URL(url).hostname : null,
            company_description: metaInfo.description || null,
            company_tech_stack: techStack,
          };
        }
      }

      // Deduct credit for free users
      if (profile.plan === 'free') {
        await supabase
          .from('profiles')
          .update({ credits_remaining: profile.credits_remaining - 1 })
          .eq('id', user.id);

        await supabase.from('credit_logs').insert({
          user_id: user.id,
          amount: -1,
          reason: `Research: ${url?.slice(0, 100) || 'Unknown'}`,
        });
      }

      // Save prospect
      const { data: prospect, error } = await supabase
        .from('prospects')
        .insert({
          user_id: user.id,
          source_url: url || '',
          source_type: sourceType,
          person_name: extractedData.person_name || null,
          person_title: extractedData.person_title || null,
          person_location: extractedData.person_location || null,
          person_about: extractedData.person_about || null,
          company_name: extractedData.company_name || null,
          company_domain: extractedData.company_domain || null,
          company_description: extractedData.company_description || null,
          company_tech_stack: extractedData.company_tech_stack || [],
          linkedin_url: extractedData.linkedin_url || null,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        prospect,
        credits_remaining: profile.plan === 'free' ? profile.credits_remaining - 1 : -1,
        is_premium: profile.plan === 'premium',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Research API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
