import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import {
    Youtube, TrendingUp, Users, Video, Eye, BarChart2, Calendar,
    ListFilter as FilterIcon, Grid, Settings as SettingsIcon,
    CheckSquare, ArrowUpRight, ArrowDownRight, Edit2,
    Trash2, Save, FileText, Target, MoreHorizontal, Download
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- MOCK DATA ---
const MOCK_VIDEOS = [
    { id: '1', title: 'My Ultimate Desk Setup 2026', date: '2026-02-14', views: 12500, watchTime: '450h', likes: 890, ctr: '8.5%', status: 'Published', thumbnail: 'bg-blue-500' },
    { id: '2', title: 'Day in the Life of a Software Engineer', date: '2026-02-10', views: 45000, watchTime: '1.2kh', likes: 3400, ctr: '12.1%', status: 'Published', thumbnail: 'bg-purple-500' },
    { id: '3', title: 'React 19 Tutorial for Beginners', date: '2026-02-05', views: 8900, watchTime: '320h', likes: 560, ctr: '6.2%', status: 'Published', thumbnail: 'bg-red-500' },
    { id: '4', title: 'How to Stay Productive', date: '2026-02-20', views: 0, watchTime: '0h', likes: 0, ctr: '0%', status: 'Scheduled', thumbnail: 'bg-green-500' },
    { id: '5', title: 'VS Code Extensions You Need', date: '2026-01-28', views: 2100, watchTime: '80h', likes: 120, ctr: '5.4%', status: 'Published', thumbnail: 'bg-yellow-500' },
];

const TRAFFIC_DATA = [
    { name: 'Browse Features', value: 45, color: '#ef4444' },
    { name: 'YouTube Search', value: 30, color: '#3b82f6' },
    { name: 'Suggested Videos', value: 15, color: '#10b981' },
    { name: 'External', value: 10, color: '#8b5cf6' },
];

const YouTube = () => {
    const { youtube, videoPlans, addVideoPlan, updateVideoPlan, deleteVideoPlan, settings, fetchYouTubeStats } = useStore();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'videos' | 'analytics' | 'planner' | 'comments' | 'monetization' | 'settings'>('dashboard');
    const [isLoading, setIsLoading] = useState(false);

    // Check if we have credentials (ignoring placeholders)
    const isPlaceholder = (val?: string) => !val || val.startsWith('YOUR_');
    const ytKey = settings.youtubeApiKey || import.meta.env.VITE_YOUTUBE_API_KEY;
    const ytChannel = settings.youtubeChannelId || import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
    const hasCredentials = !isPlaceholder(ytKey) && !isPlaceholder(ytChannel);

    useEffect(() => {
        if (hasCredentials && !youtube.recentVideos) {
            const load = async () => {
                setIsLoading(true);
                await fetchYouTubeStats();
                setIsLoading(false);
            };
            load();
        }
    }, [hasCredentials]); // Only run on mount or when creds change

    // Determine what videos to show
    const showMock = !hasCredentials && !youtube.recentVideos;
    const videosToDisplay = youtube.recentVideos || (showMock ? MOCK_VIDEOS : []);

    // --- PLANNER STATE ---
    const [planForm, setPlanForm] = useState({
        title: '',
        category: 'Education',
        targetAudience: 'Beginners',
        publishDate: '',
        notes: '',
        goals: { views: 1000, ctr: 5, watchTime: 50 },
        checklist: [
            { id: '1', text: 'Script Written', completed: false },
            { id: '2', text: 'Thumbnail Designed', completed: false },
            { id: '3', text: 'Video Recorded', completed: false },
            { id: '4', text: 'Editing Completed', completed: false },
            { id: '5', text: 'SEO & Tags Optimized', completed: false },
        ]
    });

    const handleSavePlan = () => {
        if (!planForm.title) return;

        const planData = {
            title: planForm.title,
            category: planForm.category,
            targetAudience: planForm.targetAudience,
            publishDate: planForm.publishDate,
            checklist: planForm.checklist,
            notes: planForm.notes,
            goals: planForm.goals,
            status: 'draft' as const
        };

        if ((planForm as any).id) {
            updateVideoPlan((planForm as any).id, planData);
        } else {
            addVideoPlan(planData);
        }

        // Reset form
        setPlanForm({
            title: '',
            category: 'Education',
            targetAudience: 'Beginners',
            publishDate: '',
            notes: '',
            goals: { views: 1000, ctr: 5, watchTime: 50 },
            checklist: [
                { id: '1', text: 'Script Written', completed: false },
                { id: '2', text: 'Thumbnail Designed', completed: false },
                { id: '3', text: 'Video Recorded', completed: false },
                { id: '4', text: 'Editing Completed', completed: false },
                { id: '5', text: 'SEO & Tags Optimized', completed: false },
            ]
        });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("YouTube Channel Analytics", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

        const tableData = videosToDisplay.map((v: any) => [
            v.title,
            v.publishedAt || v.date,
            parseInt(v.viewCount || v.views || 0).toLocaleString(),
            parseInt(v.commentCount || 0).toLocaleString()
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Title', 'Date', 'Views', 'Comments']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: '#ef4444' }
        });

        doc.save('youtube-analytics.pdf');
    };

    const handleEditPlan = (plan: any) => {
        setPlanForm({
            ...plan,
            goals: plan.goals || { views: 1000, ctr: 5, watchTime: 50 },
            checklist: plan.checklist || []
        });
        setActiveTab('planner');
    };

    // --- SUB-COMPONENTS ---

    const SidebarItem = ({ id, icon: Icon, label }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm
            ${activeTab === id
                    ? 'bg-primary/10 text-primary border-r-2 border-primary rounded-r-none'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-primary/5'}`}
        >
            <Icon size={18} strokeWidth={activeTab === id ? 3 : 2} />
            {label}
        </button>
    );

    const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
        <div className="bg-card-bg p-5 md:p-6 rounded-2xl border border-border-color shadow-sm hover:shadow-md transition-all group border-b-4 border-b-primary/20 h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 md:p-3 rounded-xl ${color} bg-opacity-10 text-foreground`}>
                    <Icon size={20} className="md:size-[24px]" />
                </div>
                {trend && (
                    <span className={`text-[8px] md:text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 bg-sage/10 text-sage uppercase tracking-widest`}>
                        {trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-foreground mb-1 italic truncate">{value}</h3>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row h-full w-full bg-background text-foreground overflow-hidden transition-all">
            {/* --- SIDEBAR NAVIGATION (Desktop) --- */}
            <aside className="hidden lg:flex w-64 bg-card-bg border-r border-gray-200 dark:border-slate-800 flex-col shrink-0 z-20">
                <div className="h-20 flex items-center px-6 border-b border-border-color shrink-0">
                    <div className="flex items-center gap-3 text-foreground">
                        <div className="bg-primary text-white p-2 rounded-lg shadow-lg shadow-primary/20">
                            <Youtube size={20} fill="currentColor" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter uppercase italic">Studio</span>
                    </div>
                </div>

                <div className="p-4 space-y-1 flex-1 overflow-y-auto">
                    <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 mb-2">Channel</p>
                    <SidebarItem id="dashboard" icon={Grid} label="Dashboard" />
                    <SidebarItem id="videos" icon={Video} label="Content" />
                    <SidebarItem id="analytics" icon={BarChart2} label="Analytics" />


                    <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8 mb-2">Strategy</p>
                    <SidebarItem id="planner" icon={FileText} label="Planner" />
                    <SidebarItem id="settings" icon={SettingsIcon} label="Settings" />
                </div>

                <div className="p-4 border-t border-border-color">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/5">
                        <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">
                            {settings.name[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black truncate">{settings.name}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase truncate tracking-tighter">{youtube.subscribers.toLocaleString()} subs</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="px-6 md:px-8 py-4 md:h-20 bg-card-bg border-b border-border-color flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center gap-3 lg:hidden">
                            <div className="bg-primary text-white p-1.5 rounded-lg">
                                <Youtube size={16} fill="currentColor" />
                            </div>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight italic">
                            {activeTab === 'dashboard' ? 'Studio Dashboard' : activeTab}
                        </h1>
                        <button
                            onClick={() => fetchYouTubeStats()}
                            className="md:hidden size-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                        >
                            <TrendingUp size={16} />
                        </button>
                    </div>

                    {/* Mobile Nav Scroller */}
                    <nav className="flex lg:hidden w-full overflow-x-auto gap-4 py-2 custom-scrollbar -mx-2 px-2 shrink-0">
                        {['dashboard', 'videos', 'analytics', 'planner', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg whitespace-nowrap transition-all
                                ${activeTab === tab ? 'bg-primary text-white active:scale-95' : 'text-gray-400 hover:text-foreground'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => fetchYouTubeStats()}
                            className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            <TrendingUp size={16} /> Sync Stats
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Demo Mode Banner */}
                        {showMock && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                                        <Eye size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100">Viewing Demo Data</h4>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">Connect your API Key in Settings to see real analytics.</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveTab('settings')} className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Connect Now
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                                <div className="size-4 rounded-full border-2 border-yellow-600 border-t-transparent animate-spin"></div>
                                <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200">Fetching latest stats from YouTube...</p>
                            </div>
                        )}



                        {/* --- DASHBOARD & ANALYTICS VIEW --- */}
                        {(activeTab === 'dashboard' || activeTab === 'analytics') && (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard title="Total Subscribers" value={youtube.subscribers.toLocaleString()} icon={Users} trend={null} color="bg-red-500" />
                                    <StatCard title="Total Views" value={youtube.views.toLocaleString()} icon={Eye} trend={null} color="bg-blue-500" />
                                    <StatCard title="Total Videos" value={youtube.videosCount.toLocaleString()} icon={Video} trend={null} color="bg-green-500" />
                                    <StatCard
                                        title="Latest Video Views"
                                        value={youtube.recentVideos && youtube.recentVideos.length > 0 ? parseInt(youtube.recentVideos[0].viewCount || '0').toLocaleString() : '0'}
                                        icon={TrendingUp}
                                        trend={null}
                                        color="bg-purple-500"
                                    />
                                </div>

                                {/* Main Chart Area */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="col-span-2 bg-card-bg p-8 rounded-2xl border border-border-color shadow-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="font-bold text-lg">Recent Video Performance</h3>
                                            <button
                                                onClick={handleExportPDF}
                                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                            >
                                                <Download size={14} /> Export PDF
                                            </button>
                                        </div>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={[...(youtube.recentVideos || [])].reverse()}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                                                    <XAxis
                                                        dataKey="title"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 9, fill: 'var(--color-foreground)', fontWeight: 800 }}
                                                        dy={10}
                                                        tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                                                    />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-foreground)', fontWeight: 800 }} />
                                                    <Tooltip
                                                        cursor={{ fill: 'var(--color-primary)', fillOpacity: 0.05 }}
                                                        contentStyle={{ borderRadius: '16px', border: 'none', background: 'var(--color-card-bg)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: 'var(--color-foreground)', fontWeight: 'black' }}
                                                    />
                                                    <Bar dataKey="viewCount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Traffic Sources */}
                                    <div className="bg-card-bg p-8 rounded-2xl border border-border-color shadow-sm">
                                        <h3 className="font-bold text-lg mb-6">Traffic Sources</h3>
                                        <div className="h-48">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={TRAFFIC_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                        {TRAFFIC_DATA.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-3 mt-4">
                                            {TRAFFIC_DATA.map(item => (
                                                <div key={item.name} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                        <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">{item.name}</span>
                                                    </div>
                                                    <span className="font-black text-foreground">{item.value}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- VIDEOS LIST VIEW --- */}
                        {(activeTab === 'videos' || activeTab === 'dashboard') && (
                            <div className="bg-card-bg rounded-2xl border border-border-color shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-border-color flex justify-between items-center">
                                    <h3 className="font-bold text-lg">Recent Videos</h3>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500"><FilterIcon size={18} /></button>
                                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500"><MoreHorizontal size={18} /></button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-primary/5 text-xs font-black uppercase tracking-widest text-foreground/50 text-left border-b border-border-color">
                                            <tr>
                                                <th className="py-5 px-6">Video Content</th>
                                                <th className="py-5 px-6 text-center">Date</th>
                                                <th className="py-5 px-6 text-center">Views</th>
                                                <th className="py-5 px-6 text-center">Interactions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-color/30">
                                            {videosToDisplay.map((video: any) => (
                                                <tr key={video.id} className="group hover:bg-primary/[0.03] transition-all cursor-pointer">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="w-24 h-14 bg-gray-200 rounded-lg bg-cover bg-center shrink-0"
                                                                style={{ backgroundImage: video.thumbnail?.startsWith('http') ? `url(${video.thumbnail})` : undefined }}
                                                            >
                                                                {!video.thumbnail?.startsWith('http') && <div className={`w-full h-full rounded-lg ${video.thumbnail}`}></div>}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{video.title}</p>
                                                                <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mt-1">Status: Published</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-xs font-black text-foreground/60 text-center">{video.publishedAt || video.date}</td>
                                                    <td className="py-4 px-6 text-sm font-black text-foreground text-center">
                                                        {parseInt(video.viewCount || video.views || 0).toLocaleString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-sm font-black text-foreground/60 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span>{parseInt(video.commentCount || 0).toLocaleString()}</span>
                                                            <span className="text-[8px] uppercase tracking-tighter opacity-50">Comments</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Empty State if no videos found but connected */}
                                            {videosToDisplay.length === 0 && !showMock && (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-gray-500 font-medium italic">
                                                        No recent videos found. Try syncing again.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- PLANNER VIEW --- */}
                        {(activeTab === 'planner') && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                                {/* Planner Form */}
                                <div className="col-span-2 bg-card-bg p-8 rounded-2xl border border-border-color shadow-sm">
                                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3 italic uppercase tracking-tighter text-foreground">
                                        <FileText className="text-primary" size={24} /> New Video Plan
                                    </h3>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Video Title</label>
                                            <input
                                                value={planForm.title}
                                                onChange={e => setPlanForm({ ...planForm, title: e.target.value })}
                                                className="w-full text-2xl font-black p-5 bg-background border-2 border-border-color rounded-2xl outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 italic tracking-tighter"
                                                placeholder="e.g. 10 Tips for cleaner code..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Category</label>
                                                <select
                                                    value={planForm.category}
                                                    onChange={e => setPlanForm({ ...planForm, category: e.target.value })}
                                                    className="w-full p-4 bg-background border-2 border-border-color rounded-2xl text-sm font-black outline-none appearance-none cursor-pointer focus:border-primary/50 transition-all uppercase tracking-widest"
                                                >
                                                    <option>Education</option>
                                                    <option>Entertainment</option>
                                                    <option>Tech Review</option>
                                                    <option>Vlog</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Target Audience</label>
                                                <select
                                                    value={planForm.targetAudience}
                                                    onChange={e => setPlanForm({ ...planForm, targetAudience: e.target.value })}
                                                    className="w-full p-4 bg-background border-2 border-border-color rounded-2xl text-sm font-black outline-none appearance-none cursor-pointer focus:border-primary/50 transition-all uppercase tracking-widest"
                                                >
                                                    <option>Beginners</option>
                                                    <option>Intermediate</option>
                                                    <option>Pro</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Production Checklist</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {planForm.checklist.map((item, idx) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => {
                                                            const newChecklist = [...planForm.checklist];
                                                            newChecklist[idx] = { ...newChecklist[idx], completed: !newChecklist[idx].completed };
                                                            setPlanForm({ ...planForm, checklist: newChecklist });
                                                        }}
                                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group hover-lift ${item.completed ? 'bg-primary/5 border-primary/20' : 'bg-background border-border-color/50 hover:border-primary/30'}`}
                                                    >
                                                        <div
                                                            className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-gray-200 group-hover:border-primary/50'}`}
                                                        >
                                                            {item.completed && <CheckSquare size={14} />}
                                                        </div>
                                                        <span className={`text-xs font-black uppercase tracking-tight ${item.completed ? 'text-foreground/40 line-through' : 'text-foreground'}`}>{item.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Notes & Brainstorming</label>
                                            <textarea
                                                value={planForm.notes}
                                                onChange={e => setPlanForm({ ...planForm, notes: e.target.value })}
                                                className="w-full h-40 p-5 bg-background border-2 border-border-color rounded-2xl text-sm font-bold outline-none resize-none focus:border-primary/50 transition-all placeholder:text-foreground/20 leading-relaxed"
                                                placeholder="Key points, hooks, and ideas..."
                                            />
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button
                                                onClick={handleSavePlan}
                                                className="flex-1 bg-card-bg text-foreground border-2 border-border-color py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-primary/5 transition-all hover:border-primary/30"
                                            >
                                                <Save size={18} className="text-primary" /> Save Draft
                                            </button>
                                            <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-none">
                                                <Calendar size={18} /> Schedule
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Saved Plans Side Panel */}
                                <div className="space-y-6">
                                    <div className="bg-card-bg p-6 rounded-2xl border border-border-color shadow-sm">
                                        <h3 className="font-bold mb-4 flex items-center gap-2">
                                            <Target className="text-blue-500" /> Targets
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span>Target Views</span>
                                                    <span>{planForm.goals.views.toLocaleString()}</span>
                                                </div>
                                                <input type="range" className="w-full accent-red-500" min="1000" max="100000" step="1000" value={planForm.goals.views} onChange={e => setPlanForm({ ...planForm, goals: { ...planForm.goals, views: parseInt(e.target.value) } })} />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span>Target CTR</span>
                                                    <span>{planForm.goals.ctr}%</span>
                                                </div>
                                                <input type="range" className="w-full accent-blue-500" min="1" max="20" step="0.5" value={planForm.goals.ctr} onChange={e => setPlanForm({ ...planForm, goals: { ...planForm.goals, ctr: parseFloat(e.target.value) } })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-card-bg p-6 rounded-2xl border border-border-color shadow-sm">
                                        <h3 className="font-bold mb-4 text-xs font-black uppercase tracking-widest text-gray-400">Your Drafts</h3>
                                        <div className="space-y-3">
                                            {videoPlans.map(plan => (
                                                <div key={plan.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl group relative cursor-pointer hover:ring-1 hover:ring-red-500/30 transition-all" onClick={() => handleEditPlan(plan)}>
                                                    <h4 className="font-bold text-sm mb-1 pr-12">{plan.title}</h4>
                                                    <p className="text-[10px] text-gray-500">{plan.category} • {plan.status}</p>
                                                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditPlan(plan); }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteVideoPlan(plan.id); }}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {videoPlans.length === 0 && (
                                                <p className="text-xs text-gray-400 italic text-center py-4">No drafts yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SETTINGS VIEW --- */}
                        {activeTab === 'settings' && (
                            <div className="max-w-2xl bg-card-bg rounded-[2.5rem] border-none shadow-sm p-10">
                                <h3 className="text-2xl font-black mb-10 flex items-center gap-3 italic uppercase tracking-tighter text-foreground">
                                    <SettingsIcon className="text-primary" size={24} /> Channel Settings
                                </h3>

                                <div className="space-y-8">
                                    <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm">
                                                <Youtube size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm uppercase tracking-widest text-foreground">Connected Channel</h4>
                                                <p className="text-[11px] font-black text-primary uppercase tracking-widest mt-1 opacity-60">
                                                    {settings.youtubeChannelId || 'No Channel ID Set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">YouTube API Key</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                value={settings.youtubeApiKey || ''}
                                                disabled
                                                className="flex-1 p-5 bg-background border-2 border-border-color rounded-2xl text-sm font-black text-foreground/40 outline-none italic tracking-widest"
                                                placeholder="••••••••••••••••••••••••••••••••"
                                            />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">
                                            To change your API Key or Channel ID, please visit the main <a href="/settings" className="text-primary hover:underline group-hover:text-primary transition-colors">Application Settings</a>.
                                        </p>
                                    </div>

                                    <div className="pt-8 border-t border-border-color/50">
                                        <button
                                            onClick={() => fetchYouTubeStats()}
                                            className="w-full py-5 bg-card-bg text-foreground border-2 border-border-color rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-sm hover:bg-primary/5 transition-all hover:border-primary/30 active:scale-[0.98]"
                                        >
                                            <TrendingUp size={18} className="text-primary" /> Force Refresh Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default YouTube;
