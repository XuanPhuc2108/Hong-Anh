import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { LoaderCircle, LockKeyhole, Mail, RefreshCw } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
import { supabase } from '@/lib/supabase';
import { fetchCoupleIdentity } from '@/lib/sharedJournalRepository';
import type { CoupleIdentity } from '@/lib/photoLetterRepository';

type GateState = 'checking' | 'signed-out' | 'checking-member' | 'authenticated' | 'error';

type CoupleAuthGateProps = {
  children: (identity: CoupleIdentity, onSignOut: () => Promise<void>) => ReactNode;
};

function AuthBackdrop() {
  return (
    <>
      <div className="opening-wash opening-wash--one" aria-hidden />
      <div className="opening-wash opening-wash--two" aria-hidden />
      <div className="opening-motes" aria-hidden>
        <span className="mote mote--flower" />
        <span className="mote mote--butterfly" />
        <span className="mote mote--petal" />
        <span className="mote mote--spark" />
      </div>
    </>
  );
}

function WaitingScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <main className="opening-screen auth-screen" aria-live="polite">
      <AuthBackdrop />
      <div className="auth-card auth-card--waiting">
        <BrandMark className="h-10 w-10" />
        {onRetry ? <RefreshCw className="auth-card__status-icon" size={20} aria-hidden /> : <LoaderCircle className="auth-card__status-icon photo-spinner" size={20} aria-hidden />}
        <p>{message}</p>
        {onRetry && <button type="button" className="photo-button photo-button--quiet" onClick={onRetry}>Thử lại</button>}
      </div>
    </main>
  );
}

export function CoupleAuthGate({ children }: CoupleAuthGateProps) {
  const [state, setState] = useState<GateState>('checking');
  const [identity, setIdentity] = useState<CoupleIdentity | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const verificationId = useRef(0);

  const verifySession = useCallback(async (session: { user: { id: string } } | null, quiet = false) => {
    const requestId = ++verificationId.current;
    if (!session) {
      setIdentity(null);
      setState('signed-out');
      return;
    }

    if (!quiet) setState('checking-member');
    try {
      const member = await fetchCoupleIdentity(session.user.id);
      if (requestId !== verificationId.current) return;
      setIdentity(member);
      setError('');
      setState('authenticated');
    } catch (verificationError) {
      if (requestId !== verificationId.current) return;
      console.error('Không xác minh được thành viên My Love.', verificationError);
      if (verificationError instanceof Error && verificationError.message.includes('chưa được cấp quyền')) {
        setIdentity(null);
        setNotice('Tài khoản này chưa có trong danh sách hai thành viên được phép truy cập.');
        setState('signed-out');
        try {
          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) console.error('Không thể kết thúc phiên chưa được cấp quyền.', signOutError);
        } catch (signOutError) {
          console.error('Không thể kết thúc phiên chưa được cấp quyền.', signOutError);
        }
      } else if (quiet) {
        return;
      } else {
        setIdentity(null);
        setError('Chưa xác nhận được quyền truy cập. Kiểm tra kết nối và thử lại.');
        setState('error');
      }
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setError('');
    setState('checking');
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      await verifySession(data.session);
    } catch (sessionError) {
      console.error('Không đọc được phiên đăng nhập.', sessionError);
      setError('Không kiểm tra được phiên đăng nhập. Hãy thử lại.');
      setState('error');
    }
  }, [verifySession]);

  useEffect(() => {
    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      window.setTimeout(() => {
        if (!active) return;
        if (event === 'SIGNED_OUT') {
          setIdentity(null);
          setState('signed-out');
        } else if (session) {
          void verifySession(session, event === 'TOKEN_REFRESHED');
        }
      }, 0);
    });

    void supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) throw sessionError;
        void verifySession(data.session);
      })
      .catch((sessionError: unknown) => {
        if (!active) return;
        console.error('Không khôi phục được phiên đăng nhập.', sessionError);
        setError('Không kiểm tra được phiên đăng nhập. Hãy thử lại.');
        setState('error');
      });

    return () => {
      active = false;
      verificationId.current += 1;
      authListener.subscription.unsubscribe();
    };
  }, [verifySession]);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        console.error('Đăng nhập My Love thất bại.', signInError);
        setError('Email hoặc mật khẩu không đúng, hoặc tài khoản chưa được kích hoạt.');
        return;
      }
      setPassword('');
    } catch (signInError) {
      console.error('Không kết nối được dịch vụ đăng nhập.', signInError);
      setError('Không kết nối được dịch vụ đăng nhập. Kiểm tra mạng rồi thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const requestPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetError) {
        console.error('Không gửi được yêu cầu đặt lại mật khẩu.', resetError);
        setError('Chưa gửi được email đặt lại mật khẩu. Kiểm tra địa chỉ và thử lại.');
      } else {
        setNotice('Nếu địa chỉ này thuộc một tài khoản, email hướng dẫn sẽ được gửi đến hộp thư đó.');
      }
    } catch (resetError) {
      console.error('Không kết nối được dịch vụ khôi phục mật khẩu.', resetError);
      setError('Không kết nối được dịch vụ khôi phục mật khẩu. Kiểm tra mạng rồi thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError('Mật khẩu mới cần có ít nhất 8 ký tự.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setPasswordRecovery(false);
      setNewPassword('');
      setNotice('Đã đổi mật khẩu. Đăng nhập lại để tiếp tục.');
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Đã đổi mật khẩu nhưng không kết thúc được phiên khôi phục.', signOutError);
        setError('Đã đổi mật khẩu nhưng chưa kết thúc được phiên khôi phục. Tải lại trang rồi đăng nhập.');
      }
    } catch (updateError) {
      console.error('Không cập nhật được mật khẩu.', updateError);
      setError('Chưa đổi được mật khẩu. Thử lại hoặc yêu cầu email khôi phục mới.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('Không đăng xuất được.', signOutError);
      throw signOutError;
    }
  };

  if (state === 'checking' || state === 'checking-member') {
    return <WaitingScreen message={state === 'checking' ? 'Đang kiểm tra phiên đăng nhập…' : 'Đang xác minh thành viên…'} />;
  }

  if (state === 'error') {
    return <WaitingScreen message={error} onRetry={() => void refreshSession()} />;
  }

  if (state === 'authenticated' && identity && !passwordRecovery) {
    return <>{children(identity, signOut)}</>;
  }

  const submitHandler = passwordRecovery ? updatePassword : forgotPassword ? requestPasswordReset : signIn;

  return (
    <main className="opening-screen auth-screen">
      <AuthBackdrop />
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card__brand">
          <BrandMark className="h-10 w-10" />
          <span>MY LOVE</span>
        </div>
        <p className="auth-card__overline">Nhật ký riêng của Phúc &amp; Ánh</p>
        <h1 id="auth-title">
          {passwordRecovery ? 'Đặt mật khẩu mới' : forgotPassword ? 'Khôi phục mật khẩu' : 'Đăng nhập'}
        </h1>
        <p className="auth-card__description">
          {passwordRecovery
            ? 'Chọn mật khẩu mới cho tài khoản của bạn.'
            : forgotPassword
              ? 'Nhập email tài khoản để nhận liên kết khôi phục.'
              : 'Đăng nhập bằng tài khoản riêng đã được thêm vào nhật ký.'}
        </p>

        <form className="auth-form" onSubmit={submitHandler}>
          {passwordRecovery ? (
            <label>
              <span><LockKeyhole size={15} aria-hidden /> Mật khẩu mới</span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </label>
          ) : (
            <>
              <label>
                <span><Mail size={15} aria-hidden /> Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={busy}
                />
              </label>
              {!forgotPassword && (
                <label>
                  <span><LockKeyhole size={15} aria-hidden /> Mật khẩu</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={busy}
                  />
                </label>
              )}
            </>
          )}

          {error && <p className="auth-form__error" role="alert">{error}</p>}
          {notice && <p className="auth-form__notice" role="status">{notice}</p>}

          <button type="submit" className="photo-button photo-button--primary auth-form__submit" disabled={busy}>
            {busy
              ? <><LoaderCircle className="photo-spinner" size={17} aria-hidden /> Đang xử lý…</>
              : passwordRecovery
                ? 'Lưu mật khẩu mới'
                : forgotPassword
                  ? 'Gửi email khôi phục'
                  : 'Vào nhật ký'}
          </button>
        </form>

        {!passwordRecovery && (
          <button
            type="button"
            className="auth-card__secondary"
            onClick={() => {
              setForgotPassword((value) => !value);
              setError('');
              setNotice('');
            }}
          >
            {forgotPassword ? 'Quay lại đăng nhập' : 'Quên mật khẩu?'}
          </button>
        )}
      </section>
    </main>
  );
}
