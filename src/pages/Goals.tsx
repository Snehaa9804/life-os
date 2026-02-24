import { useState } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Target,
    Map,
    Flag,
    Calendar,
    CheckCircle2,
    Circle,
    ChevronRight,
    Compass,
    ArrowUpRight,
    Plus,
    Trash2,
    X,
    Save,
    Edit2,
    Plane,
    Layers,
    RotateCcw
} from 'lucide-react';

const PLAN_DEFAULTS = {
    'January': 'Habit Tracker Core + UI Design',
    'February': 'Python Backend & AI (APIs, Auth)',
    'March': 'React Frontend & State Management',
    'April': 'PostgreSQL Depth & DB Optimization',
    'May': 'AI Engineering (LLM APIs, Embeddings)',
    'June': 'Portfolio Project 1: Full-stack + AI',
    'July': 'Portfolio Project 2: High Scalability',
    'August': 'Job Search & Deployment (Mastery)',
    'September': 'Career Expansion & Mentorship',
    'October': 'Advanced System Design',
    'November': 'FinOps & Analytics',
    'December': 'Yearly Review & 2027 Planning'
};

const GoalsRoadmap = () => {
    const { roadmap, updateRoadmap } = useStore();
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalText, setGoalText] = useState(roadmap.mainGoal);

    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
    const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0] });

    const [editingFocus, setEditingFocus] = useState<string | null>(null);
    const [focusText, setFocusText] = useState('');
    const [showAllMonths, setShowAllMonths] = useState(false);

    const handleSaveGoal = () => {
        updateRoadmap({ mainGoal: goalText });
        setIsEditingGoal(false);
    };

    const toggleMilestone = (id: string) => {
        const newMilestones = roadmap.milestones.map(m =>
            m.id === id ? { ...m, status: (m.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' } : m
        );
        updateRoadmap({ milestones: newMilestones });
    };

    const addMilestone = () => {
        if (!newMilestone.title) return;
        const milestone: any = {
            id: Math.random().toString(36).substr(2, 9),
            title: newMilestone.title,
            dueDate: newMilestone.dueDate,
            status: 'pending'
        };
        updateRoadmap({ milestones: [...roadmap.milestones, milestone].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) });
        setIsAddingMilestone(false);
        setNewMilestone({ title: '', dueDate: new Date().toISOString().split('T')[0] });
    };

    const deleteMilestone = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        updateRoadmap({ milestones: roadmap.milestones.filter(m => m.id !== id) });
    };

    const handleFocusEdit = (month: string) => {
        setEditingFocus(month);
        setFocusText(roadmap.monthlyFocus[month] || '');
    };

    const saveFocus = (month: string) => {
        updateRoadmap({
            monthlyFocus: {
                ...roadmap.monthlyFocus,
                [month]: focusText
            }
        });
        setEditingFocus(null);
    };

    const progress = roadmap.milestones.length > 0
        ? Math.round((roadmap.milestones.filter(m => m.status === 'completed').length / roadmap.milestones.length) * 100)
        : 0;

    const resetRoadmap = () => {
        const defaultRoadmap = {
            mainGoal: 'Full Stack + AI Mastery // Career Launch 🚀',
            year: 2026,
            milestones: [
                { id: 'm1', title: 'Habit Tracker UI & Core Logic', dueDate: '2026-01-20', status: 'completed' },
                { id: 'm2', title: 'Trip: Punjab', dueDate: '2026-01-25', status: 'completed' },
                { id: 'm3', title: 'Python Backend & Auth Mastery', dueDate: '2026-02-15', status: 'completed' },
                { id: 'm4', title: 'Trip: Banaras (Varanasi)', dueDate: '2026-02-22', status: 'pending' },
                { id: 'm5', title: 'React Frontend Mastery (JS/Hooks)', dueDate: '2026-03-25', status: 'pending' },
                { id: 'm6', title: 'PostgreSQL Advanced (Design/Optimization)', dueDate: '2026-04-15', status: 'pending' },
                { id: 'm7', title: 'Trip: Jagannath Puri', dueDate: '2026-04-20', status: 'pending' },
                { id: 'm8', title: 'AI Implementation (LLMs & Vector DBs)', dueDate: '2026-05-30', status: 'pending' },
                { id: 'm9', title: '2-3 Strong AI Portfolio Projects', dueDate: '2026-07-15', status: 'pending' },
                { id: 'm10', title: 'Job Placement: High-Paying Developer', dueDate: '2026-08-30', status: 'pending' }
            ],
            monthlyFocus: PLAN_DEFAULTS
        };
        updateRoadmap(defaultRoadmap as any);
        setGoalText(defaultRoadmap.mainGoal);
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-[#f9fafb] dark:bg-[#0b101b]">
            {/* Header */}
            <header className="h-20 px-12 flex items-center justify-between shrink-0 bg-card-bg border-b border-border-color">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Compass className="text-primary" size={24} />
                        <div>
                            <h1 className="text-xl font-black italic">Strategic Direction</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Year Roadmap // {roadmap.year}</p>
                        </div>
                    </div>
                    <button
                        onClick={resetRoadmap}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all group"
                        title="Apply Predefined Plan"
                    >
                        <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                        Apply Plan
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-12 py-10">
                <div className="max-w-[1200px] mx-auto space-y-12">

                    {/* 1-Year Main Goal */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
                        <Card className="relative z-10 p-12 bg-slate-900 text-white border-none shadow-2xl rounded-[3rem] overflow-hidden group">
                            <div className="flex flex-col md:flex-row justify-between gap-10 items-center">
                                <div className="flex-1 space-y-6">
                                    <span className="text-xs font-black text-primary uppercase tracking-[0.4em]">One Year Focus</span>
                                    {isEditingGoal ? (
                                        <div className="space-y-4 w-full max-w-2xl">
                                            <input
                                                value={goalText}
                                                onChange={e => setGoalText(e.target.value)}
                                                className="bg-white/5 border border-white/10 p-4 rounded-xl text-3xl font-black w-full outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="Enter mission objective..."
                                                autoFocus
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleSaveGoal}
                                                    className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                                >
                                                    Confirm Mission
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingGoal(false)}
                                                    className="bg-white/10 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group/goal flex items-start gap-4">
                                            <h2 className="text-5xl font-black tracking-tight leading-tight">
                                                {roadmap.mainGoal || 'SET YOUR MAIN GOAL'}
                                            </h2>
                                            <button
                                                onClick={() => setIsEditingGoal(true)}
                                                className="p-2 bg-white/5 rounded-lg opacity-0 group-hover/goal:opacity-100 hover:bg-white/10 transition-all"
                                            >
                                                <Edit2 size={16} className="text-primary" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <div className="px-6 py-2 bg-white/10 rounded-full border border-white/10 text-xs font-bold flex items-center gap-2">
                                            <Target size={14} className="text-primary" /> Goal Active
                                        </div>
                                        <div className="px-6 py-2 bg-white/10 rounded-full border border-white/10 text-xs font-bold">
                                            Deadline: Dec {roadmap.year}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="size-48 rounded-full border-4 border-primary/10 flex items-center justify-center relative"
                                    style={{
                                        background: `conic-gradient(var(--color-primary) ${progress}%, transparent 0)`
                                    }}
                                >
                                    <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                                        <div className="text-center">
                                            <span className="text-4xl font-black">{progress}%</span>
                                            <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Journey</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Map className="absolute -right-12 -bottom-12 text-white/5 group-hover:rotate-12 transition-transform duration-1000" size={300} />
                        </Card>
                    </div>

                    <div className="grid grid-cols-12 gap-10">
                        {/* Left: Road Map (Milestones) */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">
                            <div className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-3">
                                    <Flag className="text-primary" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-widest">Key Milestones</h3>
                                </div>
                                <button
                                    onClick={() => setIsAddingMilestone(true)}
                                    className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="space-y-6 relative ml-6">
                                {/* Vertical Line */}
                                <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gray-100 dark:bg-slate-800 ml-[-24px]"></div>

                                {isAddingMilestone && (
                                    <Card className="p-8 border-2 border-primary/20 bg-primary/5 shadow-xl animate-in slide-in-from-left-4 duration-300">
                                        <div className="flex justify-between items-start mb-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">New Milestone</h4>
                                            <button onClick={() => setIsAddingMilestone(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                                        </div>
                                        <div className="space-y-4">
                                            <input
                                                value={newMilestone.title}
                                                onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                                className="w-full bg-card-bg p-4 rounded-xl text-sm font-bold shadow-sm outline-none border border-border-color"
                                                placeholder="Milestone title..."
                                                autoFocus
                                            />
                                            <div className="flex gap-4">
                                                <input
                                                    type="date"
                                                    value={newMilestone.dueDate}
                                                    onChange={e => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                                                    className="flex-1 bg-card-bg p-4 rounded-xl text-sm font-bold shadow-sm outline-none border border-border-color"
                                                />
                                                <button
                                                    onClick={addMilestone}
                                                    className="bg-primary text-white px-8 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {roadmap.milestones.map((m, i) => (
                                    <div key={m.id} className="relative group">
                                        {/* Point */}
                                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 size-4 rounded-full border-4 ml-[-31px] transition-all z-10 ${m.status === 'completed' ? 'bg-primary border-primary shadow-[0_0_10px_rgba(0,122,138,0.5)]' : 'bg-card-bg border-gray-200 dark:border-slate-800'
                                            }`}></div>

                                        <Card
                                            onClick={() => toggleMilestone(m.id)}
                                            className={`p-8 border-none shadow-sm transition-all hover:translate-x-2 cursor-pointer group/item ${m.status === 'completed' ? 'bg-gray-50/50 dark:bg-slate-800/30' : 'bg-card-bg/50'}`}
                                        >
                                            <div className="flex justify-between items-center text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] font-black text-gray-300">0{i + 1}</span>
                                                        {m.title.toLowerCase().includes('trip') ? (
                                                            <Plane size={14} className="text-primary rotate-45" />
                                                        ) : (
                                                            <Layers size={14} className="text-primary/40" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-black text-lg ${m.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{m.title}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic flex items-center gap-2">
                                                            <Calendar size={10} /> {new Date(m.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={(e) => deleteMilestone(m.id, e)}
                                                        className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    {m.status === 'completed' ? <CheckCircle2 className="text-primary" size={24} /> : <Circle className="text-gray-200" size={24} />}
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                                {roadmap.milestones.length === 0 && !isAddingMilestone && (
                                    <div className="p-12 text-center border-2 border-dashed border-border-color rounded-[2.5rem]">
                                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No milestones defined for this journey.</p>
                                        <button onClick={() => setIsAddingMilestone(true)} className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest hover:underline">+ Define First Step</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Monthly Focus */}
                        <div className="col-span-12 lg:col-span-4 space-y-8">
                            <div className="flex items-center gap-3 px-4">
                                <Calendar className="text-primary" size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest">Monthly Focus</h3>
                            </div>

                            <Card className="p-10 bg-card-bg shadow-xl border-none">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Currently Centered</span>
                                    <button
                                        onClick={resetRoadmap}
                                        className="text-[9px] font-black text-primary bg-primary/5 px-2 py-1 rounded hover:bg-primary/10 transition-all uppercase tracking-tighter"
                                    >
                                        Apply My Plan
                                    </button>
                                </div>
                                <h4 className="text-3xl font-black mb-8">{currentMonth}</h4>

                                <div className="space-y-10">
                                    {(showAllMonths ? months : months.slice(months.indexOf(currentMonth), months.indexOf(currentMonth) + 4)).map(m => (
                                        <div key={m} className={`flex items-start gap-4 transition-all ${m === currentMonth ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`size-3 rounded-full ${m === currentMonth ? 'bg-primary' : 'bg-gray-200'}`}></div>
                                                <div className="w-px h-10 bg-gray-100 dark:bg-slate-800"></div>
                                            </div>
                                            <div className="flex-1 pb-4 group/focus">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-black uppercase text-gray-400">{m}</p>
                                                    {editingFocus !== m && (
                                                        <button onClick={() => handleFocusEdit(m)} className="opacity-0 group-hover/focus:opacity-100 p-1 text-primary hover:bg-primary/10 rounded">
                                                            <Edit2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                {editingFocus === m ? (
                                                    <div className="mt-2 flex gap-2">
                                                        <input
                                                            value={focusText}
                                                            onChange={e => setFocusText(e.target.value)}
                                                            className="flex-1 bg-gray-50 dark:bg-slate-800 border-none rounded-lg p-2 text-xs font-bold outline-none ring-1 ring-primary/20"
                                                            autoFocus
                                                            onKeyDown={e => e.key === 'Enter' && saveFocus(m)}
                                                        />
                                                        <button onClick={() => saveFocus(m)} className="p-2 bg-primary text-white rounded-lg shadow-sm"><Save size={12} /></button>
                                                        <button onClick={() => setEditingFocus(null)} className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-400 rounded-lg"><X size={12} /></button>
                                                    </div>
                                                ) : (
                                                    <p className="font-bold text-sm mt-1">
                                                        {roadmap.monthlyFocus[m] || PLAN_DEFAULTS[m as keyof typeof PLAN_DEFAULTS] || 'Planning...'}
                                                    </p>
                                                )}
                                            </div>
                                            {m === currentMonth && editingFocus !== m && <ChevronRight className="text-primary" size={20} />}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowAllMonths(!showAllMonths)}
                                    className="w-full mt-10 py-4 bg-[#1a1c1b] dark:bg-white dark:text-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                                >
                                    {showAllMonths ? 'Show Current Focus' : 'View Full Roadmap'}
                                </button>
                            </Card>

                            <div className="p-10 bg-primary/10 rounded-[2.5rem] border border-primary/20 text-center relative overflow-hidden group">
                                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-2 relative z-10">Alignment Check</h3>
                                <p className="text-xs font-semibold leading-relaxed opacity-70 relative z-10">Are your daily habits serving this goal? If not, recalibrate your focus.</p>
                                <ArrowUpRight className="absolute -right-4 -top-4 text-primary/5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" size={120} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GoalsRoadmap;
