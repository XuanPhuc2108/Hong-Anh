// Edge function: quản lý enrollment admin.
// Hai chế độ:
//  - POST { action: "bootstrap" }: đặt admin ĐẦU TIÊN. Chỉ hoạt động khi chưa có admin nào
//    trong admin_profiles. Caller phải đã đăng ký passkey và gửi JWT (Authorization header).
//  - POST { action: "promote", user_id }: thêm admin khác. Caller phải đã là admin.
//
// set app_meta_data.is_admin = true cần service role key — KHÔNG bao giờ để client tự set.

import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    // Xác thực caller bằng anon key + JWT của họ.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: 'Chưa đăng nhập. Vui lòng đăng ký passkey trước.' }, 401);
    }
    const callerId = userData.user.id;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json().catch(() => ({}));
    const action = body?.action ?? 'bootstrap';

    if (action === 'bootstrap') {
      const { data: claimed, error: claimErr } = await adminClient.rpc(
        'claim_first_admin',
        {
          p_user_id: callerId,
          p_display_name: body?.display_name ?? 'Quản trị viên',
        }
      );
      if (claimErr) {
        throw new Error(`Không thể xác nhận quyền thiết lập admin đầu tiên: ${claimErr.message}`);
      }
      if (claimed === false) {
        return json(
          { error: 'Đã có quản trị viên. Vui lòng nhờ admin hiện tại thêm bạn.' },
          403
        );
      }
      if (claimed !== true) {
        throw new Error('RPC claim_first_admin trả về kết quả không hợp lệ.');
      }
      try {
        await setAdmin(adminClient, callerId, body?.display_name ?? 'Quản trị viên');
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'Lỗi không xác định';
        throw new Error(
          `Đã giữ claim bootstrap nhưng không thể hoàn tất cấu hình admin: ${detail}. Claim không tự hủy; cần kiểm tra thủ công trước khi thử lại.`
        );
      }
      return json({ ok: true, message: 'Đã thiết lập quản trị viên đầu tiên.' });
    }

    if (action === 'promote') {
      const targetId = body?.user_id;
      if (!targetId) return json({ error: 'Thiếu user_id.' }, 400);
      // Caller phải đã là admin.
      const callerAdmin = await isAdmin(adminClient, callerId);
      if (!callerAdmin) {
        return json({ error: 'Bạn không có quyền thực hiện thao tác này.' }, 403);
      }
      await setAdmin(adminClient, targetId, body?.display_name ?? 'Quản trị viên');
      return json({ ok: true, message: 'Đã thêm quản trị viên.' });
    }

    if (action === 'status') {
      const { count, error: statusErr } = await adminClient
        .from('admin_profiles')
        .select('*', { count: 'exact', head: true });
      if (statusErr) {
        throw new Error(`Không thể kiểm tra trạng thái quản trị viên: ${statusErr.message}`);
      }
      const callerAdmin = await isAdmin(adminClient, callerId);
      return json({ hasAdmin: (count ?? 0) > 0, youAreAdmin: callerAdmin });
    }

    return json({ error: 'Hành động không hợp lệ.' }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Lỗi không xác định' }, 500);
  }
});

async function setAdmin(
  client: ReturnType<typeof createClient>,
  userId: string,
  displayName: string
) {
  // Set app_meta_data.is_admin = true (server-side, user không thể tự sửa).
  const { data: userData, error: userErr } = await client.auth.admin.getUserById(userId);
  if (userErr) {
    throw new Error(`Không thể đọc thông tin người dùng để cập nhật quyền admin: ${userErr.message}`);
  }
  if (!userData.user) {
    throw new Error('Không tìm thấy người dùng để cập nhật quyền admin.');
  }
  const { error: metaErr } = await client.auth.admin.updateUserById(userId, {
    app_metadata: { ...userData.user.app_metadata, is_admin: true },
  });
  if (metaErr) throw metaErr;
  // Thêm vào danh bạ admin_profiles.
  const { error: profileErr } = await client
    .from('admin_profiles')
    .upsert({ user_id: userId, display_name: displayName });
  if (profileErr) throw profileErr;
}

async function isAdmin(
  client: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  const { data } = await client
    .from('admin_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
