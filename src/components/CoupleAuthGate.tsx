import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, LoaderCircle, LockKeyhole, Mail, RefreshCw, UserRound } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
import { supabase } from '@/lib/supabase';
import { fetchCoupleIdentity } from '@/lib/sharedJournalRepository';
import type { CoupleIdentity, CoupleName } from '@/lib/photoLetterRepository';

type GateState = 'checking' | 'access' | 'guest' | 'checking-member' | 'authenticated' | 'error';

type CoupleAuthGateProps = {
  children: (access: CoupleAccess) => ReactNode;
};

export type CoupleAccess =
  | { mode: 'guest'; onRequestSignIn: (returnTo?: string) => void }
  | {
      mode: 'member';
      identity: CoupleIdentity;
      initialSection: string | null;
      onSignOut: () => Promise<void>;
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
  const [loginFor, setLoginFor] = useState<CoupleName | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const verificationId = useRef(0);
  const unauthorizedSignOut = useRef(false);

  const verifySession = useCallback(async (session: { user: { id: string } } | null, quiet = false) => {
    const requestId = ++verificationId.current;
    if (!session) {
      setIdentity(null);
      setState('access');
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
        setState('access');
        unauthorizedSignOut.current = true;
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
          verificationId.current += 1;
          setIdentity(null);
          setPassword('');
          setReturnTo(null);
          setState(unauthorizedSignOut.current ? 'access' : 'guest');
          unauthorizedSignOut.current = false;
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
      const identifier = email.trim();
      let signInError: { message: string } | null = null;
      if (identifier.toLocaleLowerCase('en') === 'honganh') {
        const { data, error: functionError } = await supabase.functions.invoke('couple-login', {
          body: { username: 'honganh', password },
        });
        if (functionError) {
          signInError = functionError;
        } else if (!data?.access_token || !data?.refresh_token) {
          signInError = { message: 'Username login did not return a valid session.' };
        } else {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
          if (sessionError) signInError = sessionError;
        }
      } else {
        const result = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
        signInError = result.error;
      }
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
    verificationId.current += 1;
    setIdentity(null);
    setPassword('');
    setReturnTo(null);
    setState('guest');
  };

  const enterGuest = () => {
    setIdentity(null);
    setError('');
    setNotice('');
    setPassword('');
    setLoginFor(null);
    setReturnTo(null);
    setState('guest');
  };
  const requestSignIn = (section?: string) => {
    setReturnTo(section ?? null);
    setLoginFor(null);
    setForgotPassword(false);
    setPasswordRecovery(false);
    setError('');
    setNotice('');
    setState('access');
  };

  if (state === 'checking' || state === 'checking-member') {
    return <WaitingScreen message={state === 'checking' ? 'Đang kiểm tra phiên đăng nhập…' : 'Đang xác minh thành viên…'} />;
  }

  if (state === 'error') {
    return <WaitingScreen message={error} onRetry={() => void refreshSession()} />;
  }

  if (state === 'guest') {
    return <>{children({ mode: 'guest', onRequestSignIn: requestSignIn })}</>;
  }

  if (state === 'authenticated' && identity && !passwordRecovery) {
    return <>{children({ mode: 'member', identity, initialSection: returnTo, onSignOut: signOut })}</>;
  }

  const submitHandler = passwordRecovery ? updatePassword : forgotPassword ? requestPasswordReset : signIn;
  const showCredentials = Boolean(loginFor) || forgotPassword || passwordRecovery;

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
              : loginFor
                ? `Đăng nhập với tài khoản ${loginFor}.`
                : 'Chọn tài khoản thành viên hoặc tham quan với quyền khách.'}
        </p>

        {!showCredentials ? (
          <>
            <div className="auth-choice-list" aria-label="Chọn chế độ truy cập">
              <button type="button" className="auth-choice" onClick={() => {
                setLoginFor('Phúc');
                setPassword('');
                setError('');
                setNotice('');
              }}>
                <span className="auth-choice__icon"><UserRound size={19} aria-hidden /></span>
                <span>Đăng nhập với tài khoản Phúc</span>
              </button>
              <button type="button" className="auth-choice" onClick={() => {
                setLoginFor('Ánh');
                setPassword('');
                setError('');
                setNotice('');
              }}>
                <span className="auth-choice__icon"><UserRound size={19} aria-hidden /></span>
                <span>Đăng nhập với tài khoản Ánh</span>
              </button>
              <button type="button" className="photo-button photo-button--quiet auth-choice__guest" onClick={enterGuest}>
                Tham quan My Love
              </button>
            </div>
            {error && <p className="auth-form__error" role="alert">{error}</p>}
            {notice && <p className="auth-form__notice" role="status">{notice}</p>}
          </>
        ) : (
          <>
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
                <span><Mail size={15} aria-hidden /> {loginFor === 'Ánh' ? 'Email hoặc username' : 'Email'}</span>
                <input
                  type={loginFor === 'Ánh' ? 'text' : 'email'}
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

            {!passwordRecovery && loginFor && (
              <button
                type="button"
                className="auth-card__secondary"
                disabled={busy}
                onClick={() => {
                  setForgotPassword((value) => !value);
                  setError('');
                  setNotice('');
                }}
              >
                {forgotPassword ? 'Quay lại đăng nhập' : 'Quên mật khẩu?'}
              </button>
            )}
            <button
              type="button"
              className="auth-card__secondary"
              disabled={busy}
              onClick={() => {
                if (state === 'access' && returnTo) {
                  enterGuest();
                  return;
                }
                setLoginFor(null);
                setForgotPassword(false);
                setPasswordRecovery(false);
                setError('');
                setNotice('');
              }}
            >
              <ArrowLeft size={14} aria-hidden /> {returnTo ? 'Quay lại tham quan' : 'Chọn tài khoản khác'}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
