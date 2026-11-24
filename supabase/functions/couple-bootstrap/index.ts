import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return json({}, 200);
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const token = req.headers.get('x-bootstrap-token') ?? '';
    const expectedToken = Deno.env.get('COUPLE_BOOTSTRAP_TOKEN');
    if (!expectedToken || token !== expectedToken) {
      return json({ error: 'Không có quyền thực hiện thiết lập.' }, 403);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing server configuration.');
    }

    const phucEmail = Deno.env.get('COUPLE_PHUC_EMAIL');
    const phucPassword = Deno.env.get('COUPLE_PHUC_PASSWORD');
    const anhEmail = Deno.env.get('COUPLE_ANH_EMAIL') ?? 'honganh@my-love.local';
    const anhPassword = Deno.env.get('COUPLE_ANH_PASSWORD');
    if (!phucEmail || !phucPassword || !anhPassword) {
      throw new Error('Missing couple account configuration.');
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const phuc = await ensureMember(admin, phucEmail, phucPassword, 'Phúc');
    const anh = await ensureMember(admin, anhEmail, anhPassword, 'Ánh', 'honganh');

    await admin.from('couple_members').upsert(
      [
        { user_id: phuc.id, display_name: 'Phúc' },
        { user_id: anh.id, display_name: 'Ánh' },
      ],
      { onConflict: 'user_id' }
    );

    const { data: members, error: memberError } = await admin
      .from('couple_members')
      .select('display_name')
      .order('display_name');
    if (memberError) throw memberError;

    return json({ ok: true, members: members?.map((member) => member.display_name) ?? [] });
  } catch (error) {
    console.error('Couple bootstrap failed.', error instanceof Error ? error.message : 'Unknown error');
    return json({ error: 'Thiết lập hai thành viên không thành công.' }, 500);
  }
});

async function ensureMember(
  admin: ReturnType<typeof createClient>,
  email: string,
  password: string,
  displayName: 'Phúc' | 'Ánh',
  username?: string
) {
  const { data: existingPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = existingPage?.users.find((user) => user.email?.toLocaleLowerCase('en') === email.toLocaleLowerCase('en'));
  if (existing) {
    const { data: updated, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email,
      email_confirm: true,
      app_metadata: {
        ...existing.app_metadata,
        ...(username ? { username } : {}),
      },
      user_metadata: {
        ...existing.user_metadata,
        display_name: displayName,
      },
    });
    if (error) throw error;
    if (!updated.user) throw new Error('Không nhận được thông tin tài khoản.');
    return updated.user;
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: username ? { username } : {},
    user_metadata: { display_name: displayName },
  });
  if (error) throw error;
  if (!created.user) throw new Error('Không tạo được tài khoản thành viên.');
  return created.user;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
