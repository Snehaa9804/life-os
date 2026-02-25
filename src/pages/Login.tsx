import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import Card from '../components/Card';
import { Shield, Lock, Fingerprint, Activity } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const { login } = useStore();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSuccess = (credentialResponse: any) => {
        setIsAuthenticating(true);
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const userData = {
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture
            };

            // Artificial delay for that "premium" system check feel
            setTimeout(() => {
                login(userData);
                setIsAuthenticating(false);
            }, 1000);
        } catch (err) {
            console.error("Auth Error:", err);
            setError("Authentication Protocol Failed // Check Credentials");
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#020202] flex items-center justify-center p-6 overflow-hidden dark font-display">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(245,119,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,119,153,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow"></div>

            {/* Scanning Line Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent absolute top-0 animate-[scan_4s_linear_infinite]"></div>
            </div>

            <Card className="w-full max-w-lg p-10 md:p-16 bg-[#0A0A0B]/95 border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(255,255,255,0.02)] backdrop-blur-xl rounded-[3.5rem] relative overflow-hidden group">
                {/* Decorative Accents */}
                <div className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                <div className="absolute top-10 right-0 w-[1px] h-24 bg-gradient-to-b from-transparent via-primary/40 to-transparent"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {isAuthenticating ? (
                            <Activity className="size-10 animate-spin-soft" />
                        ) : (
                            <Shield className="size-10" />
                        )}
                    </div>

                    <div className="space-y-4 mb-12">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]">Secure Access Protocol</span>
                            <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"></div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                            Life <span className="text-primary italic">OS</span>
                        </h1>
                        <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em] italic">
                            Authorization Required // Terminal Session
                        </p>
                    </div>

                    <div className="w-full flex flex-col items-center">
                        {error && (
                            <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest mb-6">
                                {error}
                            </div>
                        )}

                        <div className="w-full relative group/btn min-h-[50px] flex justify-center">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    setError("Google Auth Provider Rejected Request");
                                }}
                                useOneTap
                                theme="outline"
                                shape="circle"
                                size="large"
                                width="340"
                                text="continue_with"
                            />
                        </div>

                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] italic pt-8 text-center shrink-0">
                            Biometric & Hardware Keys Supported
                        </p>

                        <div className="flex items-center justify-center gap-8 pt-8">
                            <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed">
                                <Fingerprint className="size-6 text-white" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Biometric</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed">
                                <Lock className="size-6 text-white" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-8 left-0 w-full text-center">
                    <p className="text-[9px] font-black text-white/5 uppercase tracking-[1em] italic">Locked Status: Active // Terminal 01</p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
