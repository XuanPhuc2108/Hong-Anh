import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return json({}, 200);
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    const username = typeof body?.username === 'string' ? body.username.trim().toLocaleLowerCase('en') : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (username !== 'honganh' || password.length < 8) {
      return json({ error: 'Thông tin đăng nhập không đúng.' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error('Couple login is not configured.');
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let matchingUserId: string | null = null;
    let matchingEmail: string | null = null;
    let page = 1;
    while (page <= 10) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
      if (error) throw error;
      const user = data.users.find((candidate) =>
        candidate.app_metadata?.username === 'honganh'
      );
      if (user?.email) {
        matchingUserId = user.id;
        matchingEmail = user.email;
        break;
      }
      if (data.users.length < 100) break;
      page += 1;
    }

    if (!matchingUserId || !matchingEmail) {
      return json({ error: 'Thông tin đăng nhập không đúng.' }, 401);
    }

    const { data: member, error: memberError } = await admin
      .from('couple_members')
      .select('user_id, display_name')
      .eq('user_id', matchingUserId)
      .eq('display_name', 'Ánh')
      .maybeSingle();
    if (memberError) throw memberError;
    if (!member) {
      return json({ error: 'Thông tin đăng nhập không đúng.' }, 401);
    }

    const publicClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: sessionData, error: signInError } = await publicClient.auth.signInWithPassword({
      email: matchingEmail,
      password,
    });
    if (signInError || !sessionData.session) {
      return json({ error: 'Thông tin đăng nhập không đúng.' }, 401);
    }

    return json({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    });
  } catch (error) {
    console.error('Couple login unavailable.', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'Dịch vụ đăng nhập đang tạm ngắt.' }, 503);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
