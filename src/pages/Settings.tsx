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
                    <SettingsIcon className="text-primary" size={20} />
                    <h1 className="text-xl font-black italic">Configuration</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-12 py-10">
                <div className="max-w-[1000px] mx-auto space-y-12">

                    {/* Profile Section */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-4 mb-6">Identity & Profile</h3>
                        <Card className="p-10">
                            <div className="flex flex-col md:flex-row items-center gap-12">
                                <div className="relative group">
                                    <div className="size-32 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary text-4xl font-black">
                                        {name[0]}
                                    </div>
                                    <button className="absolute bottom-0 right-0 size-10 bg-background rounded-full border border-border-color flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all">
                                        <Camera size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 w-full space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Display Name</label>
                                        <div className="relative">
                                            <input
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full bg-background p-4 pl-12 rounded-2xl text-sm font-bold outline-none border border-border-color focus:border-primary/20 transition-all font-black"
                                            />
                                            <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        className="bg-primary text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                                    >
                                        {isSaving ? <Check size={18} /> : 'Save Profile'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Integrations Section */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-4 mb-6">Integrations</h3>
                        <Card className="p-10">
                            <div className="space-y-10">
                                {/* YouTube */}
                                <div className="flex items-start gap-6">
                                    <div className="size-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/20">
                                        <Play size={28} fill="currentColor" />
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-black mb-1">YouTube Analytics</h3>
                                            <p className="text-xs font-medium text-gray-500 max-w-md italic">Connect your channel to track growth, subscribers, and engagement metrics.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Channel ID</label>
                                                <input value={youtubeChannelId} onChange={e => setYoutubeChannelId(e.target.value)} placeholder="UC_x5..." className="w-full bg-background p-4 rounded-xl text-sm font-bold outline-none border border-border-color focus:border-red-500/20" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">YouTube API Key</label>
                                                <input value={youtubeApiKey} onChange={e => setYoutubeApiKey(e.target.value)} type="password" placeholder="AIzaSy..." className="w-full bg-background p-4 rounded-xl text-sm font-bold outline-none border border-border-color focus:border-red-500/20" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-border-color ml-22"></div>

                                {/* OpenAI */}
                                <div className="flex items-start gap-6">
                                    <div className="size-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                                        <Sparkles size={28} />
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-black mb-1">AI Food Analysis</h3>
                                            <p className="text-xs font-medium text-gray-500 max-w-md italic">Connect OpenAI to enable automatic calorie and nutrition estimation.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">OpenAI API Key</label>
                                            <input value={openaiApiKey} onChange={e => setOpenaiApiKey(e.target.value)} type="password" placeholder="sk-..." className="w-full bg-background p-4 rounded-xl text-sm font-bold outline-none border border-border-color focus:border-emerald-500/20" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-10 border-t border-border-color mt-10">
                                <button
                                    onClick={handleSaveIntegrations}
                                    disabled={isVerifying}
                                    className="bg-foreground text-background px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-all flex items-center gap-2 shadow-xl"
                                >
                                    {isVerifying ? 'Saving Configuration...' : <>Save Integrations <Check size={16} /></>}
                                </button>
                            </div>
                        </Card>
                    </section>

                    {/* Preferences */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-4 mb-6">Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="p-8 hover:border-primary transition-all group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Bell size={20} />
                                    </div>
                                    <h4 className="font-black text-sm">Smart Notifications</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-medium text-gray-500">Alerts for habits & milestones</p>
                                    <div
                                        onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${settings.notificationsEnabled ? 'bg-primary' : 'bg-gray-200'}`}
                                    >
                                        <div className={`size-4 bg-white rounded-full shadow-sm transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8 hover:border-primary transition-all group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-10 rounded-xl bg-foreground text-background flex items-center justify-center border border-border-color">
                                        <Moon size={20} />
                                    </div>
                                    <h4 className="font-black text-sm">Deep Obsidian Theme</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-medium text-gray-500">Switch between light/dark</p>
                                    <div
                                        onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${settings.theme === 'dark' ? 'bg-primary' : 'bg-gray-200'}`}
                                    >
                                        <div className={`size-4 bg-white rounded-full shadow-sm transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* System Info */}
                    <Card className="p-10 bg-[#1a1c1b] dark:bg-slate-900 border-none text-white overflow-hidden relative group">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                                    <Shield size={14} /> Life OS Core
                                </div>
                                <h3 className="text-2xl font-black italic">Sync & Security</h3>
                                <p className="text-sm opacity-60 font-medium max-w-sm italic tracking-tight">
                                    Your data is stored locally in your browser's mirror. We never upload your life to any cloud without your explicit intent.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md">
                                    <Smartphone className="text-primary mb-2" size={18} />
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Version</p>
                                    <p className="font-black text-sm leading-none">v2.4.0</p>
                                </div>
                                <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md">
                                    <Check className="text-sage mb-2" size={18} />
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</p>
                                    <p className="font-black text-sm leading-none">Encrypted</p>
                                </div>
                            </div>
                        </div>
                        <SettingsIcon className="absolute -right-8 -bottom-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000" size={180} />
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Settings;
