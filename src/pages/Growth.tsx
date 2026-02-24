import { useMemo, useState } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Zap,
    ChevronRight,
    Award,
    Send,
    Trophy,
    Target,
    Star,
    Rocket,
    Languages,
    Terminal,
    Dumbbell
} from 'lucide-react';

const GrowthHub = () => {
    const { roadmap, reflections, addReflection } = useStore();
    const [newThought, setNewThought] = useState('');

    const completedMilestones = useMemo(() =>
        roadmap.milestones.filter(m => m.status === 'completed'),
        [roadmap.milestones]);

    const upcomingMilestones = useMemo(() =>
        roadmap.milestones.filter(m => m.status === 'pending').slice(0, 3),
        [roadmap.milestones]);

    const progressPercent = useMemo(() =>
        roadmap.milestones.length > 0
            ? Math.round((completedMilestones.length / roadmap.milestones.length) * 100)
            : 0
        , [completedMilestones, roadmap.milestones]);

    const handleSaveReflection = () => {
        if (!newThought.trim()) return;
        addReflection({
            thought: newThought,
            tags: ['Victory', 'Evolution']
        });
        setNewThought('');
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in">
            <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0 sticky top-0">
                <div className="welcome-text">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1">PERSONAL EVOLUTION</span>
                    <h1 className="text-xl font-bold">Growth & Reflection</h1>
                </div>
                <div className="header-actions flex gap-3">
                    <button className="bg-primary/10 text-primary h-10 px-4 rounded-lg flex items-center gap-2 text-sm font-bold border-none">
                        <Award size={18} /> Points: {reflections.length * 100 + 1240}
                    </button>
                    <button className="bg-primary text-white h-10 px-6 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 border-none">
                        <Zap size={18} /> Daily Roadmap
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-12 gap-8 max-w-[1400px] mx-auto">
                    {/* Column 1: Progress & Mission */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Rocket size={12} className="text-primary" /> MISSION PROGRESS
                        </div>

                        <Card className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 block">Current Status</span>
                                <h3 className="text-2xl font-black mb-1">Awaiting Mastery</h3>
                                <p className="text-xs text-gray-400 mb-8 italic">"{roadmap.mainGoal}"</p>

                                <div className="flex justify-center mb-6">
                                    <div className="size-32 rounded-full border-8 border-white/5 flex items-center justify-center relative">
                                        <div className="text-center">
                                            <span className="text-3xl font-black">{progressPercent}%</span>
                                            <p className="text-[8px] font-black uppercase text-gray-500">Journey</p>
                                        </div>
                                        <svg className="absolute -inset-2 size-36 rotate-[-90deg]">
                                            <circle cx="72" cy="72" r="68" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray={`${progressPercent * 4.27} 427`} strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Award size={14} /> {completedMilestones.length} Milestones Achieved
                                </div>
                            </div>
                            <Star className="absolute -right-20 -bottom-20 text-white/5" size={300} />
                        </Card>

                        <Card className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <Target className="text-primary" size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Next Up</h3>
                            </div>
                            <div className="space-y-4">
                                {upcomingMilestones.map((m) => (
                                    <div key={m.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{m.title}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Due: {new Date(m.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Column 2: Achievement Showcase */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Trophy size={12} className="text-tangerine" /> ACHIEVEMENT HALL
                        </div>

                        {completedMilestones.length > 0 ? (
                            <div className="space-y-6">
                                {completedMilestones.slice(0, 3).map((m, i) => (
                                    <Card key={m.id} className={`p-8 border-l-4 ${i === 0 ? 'border-tangerine' : i === 1 ? 'border-primary' : 'border-sage'} relative overflow-hidden`}>
                                        <div className="flex items-start gap-4 z-10 relative">
                                            <div className="size-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <Award className={i === 0 ? 'text-tangerine' : 'text-primary'} size={20} />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(m.dueDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                                <h4 className="font-black text-lg leading-tight mt-1">{m.title}</h4>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <div className="size-1.5 rounded-full bg-sage"></div>
                                                    <span className="text-[10px] font-black text-sage uppercase tracking-widest">Victory Logged</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Trophy className="absolute -right-6 -bottom-6 text-gray-50 dark:text-white/5 rotate-12" size={120} />
                                    </Card>
                                ))}
                                {completedMilestones.length > 3 && (
                                    <button className="w-full py-4 border-2 border-dashed border-border-color rounded-3xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all bg-transparent">
                                        View All {completedMilestones.length} Achievements
                                    </button>
                                )}
                            </div>
                        ) : (
                            <Card className="p-12 text-center border-dashed">
                                <div className="size-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trophy size={32} className="text-gray-200" />
                                </div>
                                <h4 className="font-black text-gray-400 uppercase tracking-widest">No Trophies Yet</h4>
                                <p className="text-xs text-gray-400 mt-2">Complete your first milestone to start your hall of fame.</p>
                            </Card>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-6 text-center">
                                <Languages className="text-primary mx-auto mb-3" size={24} />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Fluency</p>
                                <span className="text-lg font-black italic">Daily Practice</span>
                            </Card>
                            <Card className="p-6 text-center">
                                <Terminal className="text-tangerine mx-auto mb-3" size={24} />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Code</p>
                                <span className="text-lg font-black italic">348 Days</span>
                            </Card>
                        </div>
                    </div>

                    {/* Column 3: Evolution & Discipline */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Dumbbell size={12} className="text-purple-600" /> DISCIPLINE TRACKER
                        </div>

                        <Card className="p-8 relative overflow-hidden">
                            <h3 className="font-black text-sm uppercase tracking-widest mb-6">Daily Commitment</h3>
                            <div className="space-y-6 relative z-10">
                                <textarea
                                    value={newThought}
                                    onChange={(e) => setNewThought(e.target.value)}
                                    placeholder="Log your big win or discipline milestone..."
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm italic outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none h-32 shadow-inner dark:text-white"
                                />
                                <button
                                    onClick={handleSaveReflection}
                                    className="w-full bg-slate-900 dark:bg-white dark:text-black text-white py-4 rounded-[1.2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all active:scale-95 border-none cursor-pointer"
                                >
                                    Record Evolution <Send size={14} />
                                </button>
                            </div>
                        </Card>

                        <div className="bg-primary/10 p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col gap-6 border border-primary/20">
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="animate-pulse" /> MASTERY MINDSET
                            </div>
                            <p className="text-lg italic leading-relaxed z-10 font-black text-slate-900 dark:text-white">
                                "Short-term comfort is the enemy of long-term greatness."
                            </p>
                            <p className="text-[10px] font-bold text-primary italic">Daily Reminder for August Job-Readiness</p>
                            <div className="absolute top-0 right-0 size-48 bg-primary/20 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthHub;
