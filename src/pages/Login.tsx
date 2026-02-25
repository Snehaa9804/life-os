import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Lock, User, Facebook } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const { login } = useStore();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignIn, setIsSignIn] = useState(false);

    const handleGoogleSuccess = (credentialResponse: any) => {
        setIsAuthenticating(true);
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const userData = {
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture
            };

            setTimeout(() => {
                login(userData);
                setIsAuthenticating(false);
            }, 1000);
        } catch (err) {
            console.error("Auth Error:", err);
            setError("Authentication Protocol Failed");
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 font-display">
            <div className="w-full h-full md:h-[600px] md:w-[1000px] bg-white md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* Left Decorative Panel */}
                <div className="relative w-full md:w-[40%] bg-gradient-to-br from-[#ff6b81] to-[#ff4757] flex flex-col items-end justify-center overflow-hidden h-64 md:h-auto">
                    {/* Geometric Pattern Background */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-20%] left-[-10%] w-[150%] h-[150%] rotate-12 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:50px_50px]"></div>
                        <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* Layered rectangles like in image */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-pink-400/30 via-transparent to-transparent"></div>
                        <div className="absolute top-[10%] left-[-20%] w-full h-[80%] bg-white/10 -rotate-12 transform origin-top-left transition-transform duration-700 hover:rotate-[-10deg]"></div>
                        <div className="absolute bottom-[10%] left-[-10%] w-full h-[70%] bg-white/5 rotate-6 transform origin-bottom-left"></div>
                    </div>

                    {/* Vertical Tabs / Navigation */}
                    <div className="relative z-10 flex flex-col items-center mr-0 md:mr-[-1px]">
                        <button
                            onClick={() => setIsSignIn(false)}
                            className={`px-12 py-5 text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-l-full flex items-center gap-2 ${!isSignIn ? 'bg-white text-[#ff4757] shadow-lg translate-x-4' : 'text-white/80 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsSignIn(true)}
                            className={`px-12 py-5 text-sm font-bold tracking-widest uppercase transition-all duration-300 rounded-l-full mt-4 flex items-center gap-2 ${isSignIn ? 'bg-white text-[#ff4757] shadow-lg translate-x-4' : 'text-white/80 hover:text-white'}`}
                        >
                            Sign In
                        </button>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="flex-1 bg-white p-8 md:p-12 pb-12 md:pb-20 flex flex-col items-center justify-between relative overflow-hidden">
                    <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center">
                        {/* Logo */}
                        <div className="mb-6 relative group">
                            <div className="absolute inset-0 bg-pink-500 rounded-xl rotate-45 opacity-20 scale-110 group-hover:rotate-90 transition-transform duration-500"></div>
                            <div className="w-20 h-20 bg-gradient-to-br from-[#ff6b81] to-[#ff4757] rounded-xl rotate-45 flex items-center justify-center shadow-lg relative z-10">
                                <div className="rotate-[-45deg] flex items-center justify-center">
                                    <div className="grid grid-cols-2 gap-1 p-2">
                                        <div className="size-3 border-2 border-white rounded-sm"></div>
                                        <div className="size-3 border-2 border-white rounded-sm"></div>
                                        <div className="size-3 border-2 border-white rounded-sm"></div>
                                        <div className="size-3 border-2 border-white rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-4xl font-black text-[#ff4757] italic uppercase tracking-tighter mb-10">
                            {isSignIn ? 'Sign In' : 'Login'}
                        </h2>

                        {/* Error Message */}
                        {error && (
                            <div className="w-full mb-6 p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-lg text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="w-full space-y-6">
                            {/* Email Field */}
                            <div className="relative group">
                                <div className="absolute left-0 bottom-3 text-gray-400 group-focus-within:text-[#ff4757] transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full pl-8 pb-2 bg-transparent border-b border-gray-200 outline-none focus:border-[#ff4757] transition-all text-gray-700 placeholder:text-gray-300 font-medium"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="relative group">
                                <div className="absolute left-0 bottom-3 text-gray-400 group-focus-within:text-[#ff4757] transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full pl-8 pb-2 bg-transparent border-b border-gray-200 outline-none focus:border-[#ff4757] transition-all text-gray-700 placeholder:text-gray-300 font-medium"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button className="text-xs font-bold text-gray-400 hover:text-[#ff4757] transition-colors">
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                className={`w-full py-4 bg-gradient-to-r from-[#ff6b81] to-[#ff4757] text-white rounded-full font-bold uppercase tracking-widest shadow-xl shadow-pink-200 hover:shadow-pink-300 transform transition-all active:scale-95 flex items-center justify-center gap-2 ${isAuthenticating ? 'opacity-70 cursor-wait' : ''}`}
                                onClick={() => {
                                    if (!isAuthenticating) {
                                        setError("Traditional Auth Disabled. Use Google Login below.");
                                    }
                                }}
                            >
                                {isSignIn ? 'Sign Up' : 'Login'}
                            </button>
                        </div>
                    </div>

                    {/* Social Login Section */}
                    <div className="w-full mt-10 mb-12 pt-6 border-t border-gray-50">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest whitespace-nowrap">Or Login with</span>
                            <div className="flex items-center gap-6">
                                <div className="relative group/google overflow-hidden rounded-lg">
                                    <div className="absolute inset-0 flex items-center justify-center bg-white pointer-events-none group-hover/google:bg-gray-50 transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span className="ml-2 text-xs font-bold text-gray-600">Google</span>
                                    </div>
                                    <div className="opacity-0 w-[100px] h-[32px]">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => setError("Google Authentication Failed")}
                                            useOneTap
                                            shape="square"
                                            size="medium"
                                            width="100"
                                        />
                                    </div>
                                </div>

                                <button
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                    onClick={() => setError("Facebook Login not implemented")}
                                >
                                    <Facebook size={20} className="text-[#1877F2] group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold text-gray-600">Facebook</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtle Overlays */}
                <div className="absolute top-4 right-4 pointer-events-none opacity-10">
                    <div className="text-[10px] font-black tracking-tighter uppercase italic text-gray-400">Life OS // v2.0</div>
                </div>
            </div>
        </div>
    );
};

export default Login;

