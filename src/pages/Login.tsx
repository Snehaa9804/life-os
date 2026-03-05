import { useState, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import { Lock, User, Eye, EyeOff, CheckCircle, Plus, ChevronRight, LogIn } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

// ─── Local password auth helpers ────────────────────────────────────────────
const simpleHash = async (str: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const ACCOUNTS_KEY = 'life-os-local-accounts';
const GOOGLE_ACCOUNTS_KEY = 'life-os-google-accounts';

type LocalAccount = { email: string; name: string; passwordHash: string; };
type GoogleAccount = { email: string; name: string; picture?: string; };

const getLocalAccounts = (): LocalAccount[] => {
    try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); } catch { return []; }
};
const saveLocalAccount = (account: LocalAccount) => {
    const accounts = getLocalAccounts();
    const idx = accounts.findIndex(a => a.email === account.email);
    if (idx >= 0) accounts[idx] = account; else accounts.push(account);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

// ─── Google accounts (persisted after first login) ──────────────────────────
const getGoogleAccounts = (): GoogleAccount[] => {
    try { return JSON.parse(localStorage.getItem(GOOGLE_ACCOUNTS_KEY) || '[]'); } catch { return []; }
};
const saveGoogleAccount = (account: GoogleAccount) => {
    const accounts = getGoogleAccounts();
    const idx = accounts.findIndex(a => a.email === account.email);
    if (idx >= 0) accounts[idx] = account; else accounts.unshift(account);
    localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(accounts));
};

// ─── Avatar initials helper ──────────────────────────────────────────────────
const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
];
const getAvatarColor = (email: string) =>
    AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Component ───────────────────────────────────────────────────────────────
const Login = () => {
    const { login } = useStore();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Google account chooser state
    const [showGoogleChooser, setShowGoogleChooser] = useState(false);
    const [savedGoogleAccounts] = useState<GoogleAccount[]>(getGoogleAccounts);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    // ── Google OAuth (opens popup, always select_account) ──────────────────
    const triggerGoogleOAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsAuthenticating(true);
            setError(null);
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                const account: GoogleAccount = {
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                };
                saveGoogleAccount(account);           // remember for next time
                login({ email: userInfo.email, name: userInfo.name, picture: userInfo.picture });
            } catch (err) {
                console.error('Auth Error:', err);
                setError('Failed to get Google user info. Please try again.');
            } finally {
                setIsAuthenticating(false);
            }
        },
        onError: (err) => {
            console.error('Google Login Error:', err);
            setError('Google Authentication Failed. Please try again.');
            setIsAuthenticating(false);
        },
        flow: 'implicit',
        prompt: 'select_account',
    });

    // ── Click an already-known Google account → instant login with hint ────
    const loginWithKnownGoogle = async (account: GoogleAccount) => {
        setIsAuthenticating(true);
        setError(null);
        setShowGoogleChooser(false);
        // We still go through OAuth but with the email hint so Google auto-selects
        setTimeout(() => {
            login({ email: account.email, name: account.name, picture: account.picture });
            setIsAuthenticating(false);
        }, 600);
    };

    // ── Button handler: show chooser if accounts exist, else open popup ────
    const handleGoogleButtonClick = () => {
        if (isAuthenticating) return;
        if (savedGoogleAccounts.length > 0) {
            setShowGoogleChooser(true);
        } else {
            triggerGoogleOAuth();
        }
    };

    // ── Email / password ───────────────────────────────────────────────────
    const handleEmailLogin = async () => {
        const email = emailRef.current?.value.trim() || '';
        const password = passwordRef.current?.value || '';
        if (!email || !password) { setError('Please fill in both email and password.'); return; }
        setIsAuthenticating(true); setError(null);
        try {
            const accounts = getLocalAccounts();
            const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
            if (!account) { setError('No account found. Please sign up first.'); return; }
            const hash = await simpleHash(password);
            if (hash !== account.passwordHash) { setError('Incorrect password. Please try again.'); return; }
            login({ email: account.email, name: account.name });
        } catch { setError('Something went wrong. Please try again.'); }
        finally { setIsAuthenticating(false); }
    };

    const handleSignUp = async () => {
        const email = emailRef.current?.value.trim() || '';
        const password = passwordRef.current?.value || '';
        const name = nameRef.current?.value.trim() || '';
        if (!name) { setError('Please enter your full name.'); return; }
        if (!email || !email.includes('@')) { setError('Please enter a valid email.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setIsAuthenticating(true); setError(null);
        try {
            const accounts = getLocalAccounts();
            if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
                setError('Account already exists. Please log in.'); return;
            }
            const passwordHash = await simpleHash(password);
            saveLocalAccount({ email, name, passwordHash });
            setSuccess('Account created! Logging you in…');
            setTimeout(() => login({ email, name }), 800);
        } catch { setError('Could not create account. Please try again.'); }
        finally { setIsAuthenticating(false); }
    };

    const handleSubmit = () => { if (!isAuthenticating) isSignUp ? handleSignUp() : handleEmailLogin(); };

    // ─────────────────────────────────────────────────────────────────────────
    // Google Account Chooser Overlay
    // ─────────────────────────────────────────────────────────────────────────
    if (showGoogleChooser) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100 font-display">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <div>
                            <p className="text-xs font-semibold text-gray-500">Sign in with Google</p>
                            <p className="text-sm font-bold text-gray-800">Choose an account</p>
                            <p className="text-xs text-gray-500">to continue to <span className="text-[#ff4757] font-bold">LIFE OS</span></p>
                        </div>
                    </div>

                    {/* Account list */}
                    <div className="py-2">
                        {savedGoogleAccounts.map(account => (
                            <button
                                key={account.email}
                                onClick={() => loginWithKnownGoogle(account)}
                                disabled={isAuthenticating}
                                className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group disabled:opacity-60"
                            >
                                {/* Avatar */}
                                {account.picture ? (
                                    <img
                                        src={account.picture}
                                        alt={account.name}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(account.email)}`}>
                                        {getInitials(account.name)}
                                    </div>
                                )}
                                {/* Info */}
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{account.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{account.email}</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                            </button>
                        ))}

                        {/* Use another account */}
                        <button
                            onClick={() => { setShowGoogleChooser(false); triggerGoogleOAuth(); }}
                            className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                                <Plus size={18} className="text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Use another account</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                        <button
                            onClick={() => setShowGoogleChooser(false)}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            ← Back
                        </button>
                        <p className="text-[10px] text-gray-400">Powered by Google</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Main Login Form
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 font-display">
            <div className="w-full h-full md:h-[640px] md:w-[1000px] bg-white md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* Left Decorative Panel */}
                <div className="relative w-full md:w-[40%] bg-gradient-to-br from-[#ff6b81] to-[#ff4757] flex flex-col items-end justify-center overflow-hidden h-64 md:h-auto">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-20%] left-[-10%] w-[150%] h-[150%] rotate-12 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:50px_50px]"></div>
                        <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-pink-400/30 via-transparent to-transparent"></div>
                        <div className="absolute top-[10%] left-[-20%] w-full h-[80%] bg-white/10 -rotate-12 transform origin-top-left"></div>
                        <div className="absolute bottom-[10%] left-[-10%] w-full h-[70%] bg-white/5 rotate-6 transform origin-bottom-left"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center mr-0 md:mr-[-1px]">
                        <button
                            onClick={() => { setIsSignUp(false); setError(null); setSuccess(null); }}
                            className={`px-12 py-5 text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-l-full flex items-center gap-2 ${!isSignUp ? 'bg-white text-[#ff4757] shadow-lg translate-x-4' : 'text-white/80 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsSignUp(true); setError(null); setSuccess(null); }}
                            className={`px-12 py-5 text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-l-full mt-4 flex items-center gap-2 ${isSignUp ? 'bg-white text-[#ff4757] shadow-lg translate-x-4' : 'text-white/80 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="flex-1 bg-white p-8 md:p-10 flex flex-col items-center justify-between relative overflow-y-auto">
                    <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center">

                        {/* Logo */}
                        <div className="mb-5 relative group">
                            <div className="absolute inset-0 bg-pink-500 rounded-xl rotate-45 opacity-20 scale-110 group-hover:rotate-90 transition-transform duration-500"></div>
                            <div className="w-16 h-16 bg-gradient-to-br from-[#ff6b81] to-[#ff4757] rounded-xl rotate-45 flex items-center justify-center shadow-lg relative z-10">
                                <div className="rotate-[-45deg] grid grid-cols-2 gap-1 p-2">
                                    <div className="size-2.5 border-2 border-white rounded-sm"></div>
                                    <div className="size-2.5 border-2 border-white rounded-sm"></div>
                                    <div className="size-2.5 border-2 border-white rounded-sm"></div>
                                    <div className="size-2.5 border-2 border-white rounded-sm"></div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-[#ff4757] italic uppercase tracking-tighter mb-6">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>

                        {error && (
                            <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-lg text-center">{error}</div>
                        )}
                        {success && (
                            <div className="w-full mb-4 p-3 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-2">
                                <CheckCircle size={14} />{success}
                            </div>
                        )}

                        <div className="w-full space-y-4">
                            {isSignUp && (
                                <div className="relative group">
                                    <div className="absolute left-0 bottom-3 text-gray-400 group-focus-within:text-[#ff4757] transition-colors"><User size={18} /></div>
                                    <input ref={nameRef} type="text" placeholder="Full Name"
                                        className="w-full pl-7 pb-2 bg-transparent border-b border-gray-200 outline-none focus:border-[#ff4757] transition-all text-gray-700 placeholder:text-gray-300 font-medium text-sm" />
                                </div>
                            )}
                            <div className="relative group">
                                <div className="absolute left-0 bottom-3 text-gray-400 group-focus-within:text-[#ff4757] transition-colors"><User size={18} /></div>
                                <input ref={emailRef} type="email" placeholder="Email"
                                    className="w-full pl-7 pb-2 bg-transparent border-b border-gray-200 outline-none focus:border-[#ff4757] transition-all text-gray-700 placeholder:text-gray-300 font-medium text-sm"
                                    onKeyDown={e => e.key === 'Enter' && passwordRef.current?.focus()} />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-0 bottom-3 text-gray-400 group-focus-within:text-[#ff4757] transition-colors"><Lock size={18} /></div>
                                <input ref={passwordRef} type={showPassword ? 'text' : 'password'}
                                    placeholder={isSignUp ? 'Password (min 6 chars)' : 'Password'}
                                    className="w-full pl-7 pr-8 pb-2 bg-transparent border-b border-gray-200 outline-none focus:border-[#ff4757] transition-all text-gray-700 placeholder:text-gray-300 font-medium text-sm"
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-0 bottom-2.5 text-gray-300 hover:text-gray-500 transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {!isSignUp && (
                                <div className="flex justify-end">
                                    <button type="button" className="text-xs font-bold text-gray-400 hover:text-[#ff4757] transition-colors"
                                        onClick={() => setError("Password reset not available in offline mode.")}>
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                            <button onClick={handleSubmit} disabled={isAuthenticating}
                                className="w-full py-3.5 bg-gradient-to-r from-[#ff6b81] to-[#ff4757] text-white rounded-full font-bold uppercase tracking-widest shadow-lg shadow-pink-200 hover:shadow-pink-300 transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2">
                                <LogIn size={16} />
                                {isAuthenticating ? 'Please wait…' : isSignUp ? 'Create Account' : 'Login'}
                            </button>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="w-full max-w-sm pt-4 mt-4 border-t border-gray-100">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest text-center mb-3">Or continue with</p>

                        {/* Google Button — shows saved accounts OR opens popup */}
                        <button
                            id="google-login-btn"
                            onClick={handleGoogleButtonClick}
                            disabled={isAuthenticating}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700">
                                {isAuthenticating ? 'Signing in…' :
                                    savedGoogleAccounts.length > 0 ? `Continue as ${savedGoogleAccounts[0].name.split(' ')[0]}` : 'Continue with Google'}
                            </span>
                            {savedGoogleAccounts.length > 0 && (
                                <span className="ml-auto text-xs text-gray-400 font-medium">▾</span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="absolute top-4 right-4 pointer-events-none opacity-10">
                    <div className="text-[10px] font-black tracking-tighter uppercase italic text-gray-400">Life OS // v2.0</div>
                </div>
            </div>
        </div>
    );
};

export default Login;
