import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Thiếu biến môi trường Supabase. Vui lòng kiểm tra lại cấu hình dự án.');
}

// Supabase passkeys là tính năng beta. Client cần bật flag `auth.passkeys`.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    // @ts-expect-error — experimental, chưa có trong type chính thức
    passkeys: true,
  },
});
