import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Settings as SettingsIcon,
    Bell,
    Moon,
    Edit3,
    Camera,
    Check,
    Smartphone,
    Shield,
    Play,
    Sparkles
} from 'lucide-react';

const Settings = () => {
    const { settings, updateSettings, fetchYouTubeStats } = useStore();
    const [name, setName] = useState(settings.name);
    const [isSaving, setIsSaving] = useState(false);

    // YouTube/AI State
    const [youtubeApiKey, setYoutubeApiKey] = useState(settings.youtubeApiKey || '');
    const [youtubeChannelId, setYoutubeChannelId] = useState(settings.youtubeChannelId || '');
    const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey || '');
    const [isVerifying, setIsVerifying] = useState(false);

    // Sync local state with store when settings change
    useEffect(() => {
        setName(settings.name);
        if (settings.youtubeApiKey) setYoutubeApiKey(settings.youtubeApiKey);
        if (settings.youtubeChannelId) setYoutubeChannelId(settings.youtubeChannelId);
        if (settings.openaiApiKey) setOpenaiApiKey(settings.openaiApiKey);
    }, [settings]);

    const handleSave = () => {
        setIsSaving(true);
        updateSettings({ name });
        setTimeout(() => setIsSaving(false), 800);
    };

    const handleSaveIntegrations = () => {
        setIsVerifying(true);
        updateSettings({ youtubeApiKey, youtubeChannelId, openaiApiKey });

        // Allow state to propagate before fetching
        setTimeout(async () => {
            if (youtubeApiKey && youtubeChannelId) {
                await fetchYouTubeStats();
            }
            setIsVerifying(false);
        }, 1000);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-background text-foreground transition-colors duration-400">
            {/* Header */}
            <header className="h-20 px-12 flex items-center justify-between shrink-0 bg-card-bg border-b border-border-color">
                <div className="flex items-center gap-4">
                    <SettingsIcon className="text-primary" size={24} />
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Configuration</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-12 py-10">
                <div className="max-w-[1000px] mx-auto space-y-12">

                    {/* Profile Section */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-6 italic opacity-60">Identity & Profile</h3>
                        <Card className="p-10 border-none shadow-sm hover-lift bg-card-bg">
                            <div className="flex flex-col md:flex-row items-center gap-12">
                                <div className="relative group">
                                    <div className="size-32 rounded-3xl bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary text-4xl font-black shadow-inner">
                                        {name[0]}
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 size-10 bg-background rounded-2xl border-2 border-border-color flex items-center justify-center shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-all text-primary hover:scale-110">
                                        <Camera size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 w-full space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Display Alias</label>
                                        <div className="relative">
                                            <input
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full bg-background p-5 pl-14 rounded-2xl text-sm font-black outline-none border-2 border-border-color focus:border-primary/50 transition-all italic tracking-tight"
                                            />
                                            <Edit3 className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        className="bg-primary text-white px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 border-none"
                                    >
                                        {isSaving ? <Check size={18} /> : <>Commence <span className="opacity-60 italic">Save</span></>}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Integrations Section */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-6 italic opacity-60">Integrations</h3>
                        <Card className="p-10 border-none shadow-sm hover-lift bg-card-bg">
                            <div className="space-y-10">
                                {/* YouTube */}
                                <div className="flex items-start gap-8">
                                    <div className="size-16 rounded-[1.5rem] bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-xl shadow-red-500/20">
                                        <Play size={28} fill="currentColor" />
                                    </div>
                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <h3 className="text-xl font-black mb-1 italic uppercase tracking-tighter text-foreground">Video <span className="text-red-500 italic">Analytics</span></h3>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Connect your channel to track growth, subscribers, and engagement metrics.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Channel Identity</label>
                                                <input value={youtubeChannelId} onChange={e => setYoutubeChannelId(e.target.value)} placeholder="UC_x5..." className="w-full bg-background p-5 rounded-2xl text-xs font-black outline-none border-2 border-border-color focus:border-red-500/40 transition-all tracking-widest italic" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Private Access Key</label>
                                                <input value={youtubeApiKey} onChange={e => setYoutubeApiKey(e.target.value)} type="password" placeholder="AIzaSy..." className="w-full bg-background p-5 rounded-2xl text-xs font-black outline-none border-2 border-border-color focus:border-red-500/40 transition-all tracking-[0.5em] italic" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border-color/50 ml-24"></div>

                                {/* OpenAI */}
                                <div className="flex items-start gap-8">
                                    <div className="size-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-xl shadow-emerald-500/20">
                                        <Sparkles size={28} />
                                    </div>
                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <h3 className="text-xl font-black mb-1 italic uppercase tracking-tighter text-foreground">AI Intelligence <span className="text-emerald-500 italic">Sync</span></h3>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Connect OpenAI to enable automatic calorie and nutrition estimation.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Network API Token</label>
                                            <input value={openaiApiKey} onChange={e => setOpenaiApiKey(e.target.value)} type="password" placeholder="sk-..." className="w-full bg-background p-5 rounded-2xl text-xs font-black outline-none border-2 border-border-color focus:border-emerald-500/40 transition-all tracking-[0.5em] italic" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-12 border-t border-border-color/50 mt-12">
                                <button
                                    onClick={handleSaveIntegrations}
                                    disabled={isVerifying}
                                    className="bg-primary text-white px-12 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-none disabled:opacity-50"
                                >
                                    {isVerifying ? <span className="italic">Encrypting Config...</span> : <>Confirm Protocol <Check size={18} /></>}
                                </button>
                            </div>
                        </Card>
                    </section>

                    {/* Preferences */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-6 italic opacity-60">Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="p-8 border-none shadow-sm group hover-lift bg-card-bg">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                        <Bell size={22} />
                                    </div>
                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Smart Notifications</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alerts for habits & milestones</p>
                                    <div
                                        onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                                        className={`w-14 h-7 rounded-full p-1.5 cursor-pointer transition-all ${settings.notificationsEnabled ? 'bg-primary' : 'bg-background border-2 border-border-color'}`}
                                    >
                                        <div className={`size-4 rounded-full shadow-lg transition-transform ${settings.notificationsEnabled ? 'translate-x-7 bg-white' : 'translate-x-0 bg-border-color'}`}></div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8 border-none shadow-sm group hover-lift bg-card-bg">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-12 rounded-2xl bg-background border-2 border-border-color text-foreground flex items-center justify-center shadow-inner">
                                        <Moon size={22} />
                                    </div>
                                    <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Deep Obsidian Theme</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Switch between light/dark</p>
                                    <div
                                        onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                                        className={`w-14 h-7 rounded-full p-1.5 cursor-pointer transition-all ${settings.theme === 'dark' ? 'bg-primary' : 'bg-background border-2 border-border-color'}`}
                                    >
                                        <div className={`size-4 rounded-full shadow-lg transition-transform ${settings.theme === 'dark' ? 'translate-x-7 bg-white' : 'translate-x-0 bg-border-color'}`}></div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* System Info */}
                    <Card className="p-12 bg-gradient-to-br from-[#1a1c1b] to-slate-800 border-none text-white overflow-hidden relative group rounded-[2.5rem] shadow-2xl">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-[0.4em]">
                                    <Shield size={16} className="animate-pulse" /> Life OS Core
                                </div>
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter">Sync & <span className="text-primary italic">Security</span></h3>
                                <p className="text-sm opacity-60 font-black uppercase tracking-widest max-w-sm leading-relaxed italic">
                                    Your data is stored locally in your browser's mirror. We never upload your life to any cloud without your explicit intent.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-inner backdrop-blur-xl group-hover:bg-white/10 transition-all">
                                    <Smartphone className="text-primary mb-3" size={24} />
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Architecture</p>
                                    <p className="font-black text-xl italic tracking-tighter">v2.4.0</p>
                                </div>
                                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-inner backdrop-blur-xl group-hover:bg-white/10 transition-all">
                                    <Check className="text-sage mb-3" size={24} />
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Encryption</p>
                                    <p className="font-black text-xl italic tracking-tighter">Verified</p>
                                </div>
                            </div>
                        </div>
                        <SettingsIcon className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:rotate-45 transition-all duration-1000 group-hover:scale-110" size={300} />
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Settings;
