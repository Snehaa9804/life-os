import { useState } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Target,
    Map,
    Flag,
    Calendar,
    CheckCircle2,
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
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-background text-foreground transition-all">
            {/* Header */}
            <header className="h-24 px-12 flex items-center justify-between shrink-0 bg-card-bg border-b border-border-color">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                        <Compass className="text-primary" size={28} />
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Strategic <span className="text-primary italic">Direction</span></h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5 opacity-60 italic">Yearly Roadmap // {roadmap.year}</p>
                        </div>
                    </div>
                    <button
                        onClick={resetRoadmap}
                        className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-white transition-all group shadow-sm"
                        title="Apply Predefined Plan"
                    >
                        <RotateCcw size={14} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                        Apply Matrix Plan
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-12 py-10">
                <div className="max-w-[1200px] mx-auto space-y-12">

                    {/* 1-Year Main Goal */}
                    <div className="relative">
                        <div className="absolute inset-x-0 -bottom-10 h-20 bg-primary/20 blur-3xl rounded-full opacity-30"></div>
                        <Card className="relative z-10 p-16 bg-gradient-to-br from-primary to-rose-400 text-white border-none shadow-2xl rounded-[3.5rem] overflow-hidden group">
                            <div className="flex flex-col md:flex-row justify-between gap-16 items-center">
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2 rounded-full bg-white animate-pulse"></div>
                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em] italic">One Year Operational Mission</span>
                                    </div>
                                    {isEditingGoal ? (
                                        <div className="space-y-6 w-full max-w-2xl bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                            <input
                                                value={goalText}
                                                onChange={e => setGoalText(e.target.value)}
                                                className="bg-transparent border-b-2 border-white/20 pb-4 rounded-none text-4xl font-black w-full outline-none focus:border-white transition-all placeholder:text-white/20 italic tracking-tighter"
                                                placeholder="Define mission objective..."
                                                autoFocus
                                            />
                                            <div className="flex gap-4 p-1">
                                                <button
                                                    onClick={handleSaveGoal}
                                                    className="bg-white text-primary px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.05] active:scale-[0.98] transition-all"
                                                >
                                                    Confirm Objective
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingGoal(false)}
                                                    className="bg-white/10 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                                >
                                                    Abort
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group/goal flex items-start gap-6">
                                            <h2 className="text-6xl font-black tracking-tighter leading-none italic uppercase">
                                                {roadmap.mainGoal || 'ESTABLISH PRIMARY DIRECTIVE'}
                                            </h2>
                                            <button
                                                onClick={() => setIsEditingGoal(true)}
                                                className="size-12 bg-white/10 rounded-2xl opacity-0 group-hover/goal:opacity-100 border-none flex items-center justify-center hover:bg-white hover:text-primary transition-all cursor-pointer"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-sm">
                                            <Target size={16} className="text-white" /> Operational Status: Active
                                        </div>
                                        <div className="px-6 py-3 bg-black/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            Deadline // Dec {roadmap.year}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="size-56 rounded-full border-8 border-white/10 flex items-center justify-center relative shadow-2xl"
                                    style={{
                                        background: `conic-gradient(#fff ${progress}%, transparent 0)`
                                    }}
                                >
                                    <div className="absolute inset-4 bg-primary/20 backdrop-blur-3xl rounded-full flex items-center justify-center border-4 border-white/10">
                                        <div className="text-center">
                                            <span className="text-5xl font-black text-white italic tracking-tighter">{progress}%</span>
                                            <p className="text-[11px] font-black uppercase text-white/60 tracking-[0.2em] mt-1 italic leading-none">Complete</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Map className="absolute -right-16 -bottom-16 text-white/5 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-[2000ms]" size={400} />
                        </Card>
                    </div>

                    <div className="grid grid-cols-12 gap-10">
                        {/* Left: Road Map (Milestones) */}
                        <div className="col-span-12 lg:col-span-8 space-y-10">
                            <div className="flex items-center justify-between px-6">
                                <div className="flex items-center gap-6">
                                    <div className="size-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                        <Flag size={24} />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] italic text-foreground">Checkpoint Matrix</h3>
                                </div>
                                <button
                                    onClick={() => setIsAddingMilestone(true)}
                                    className="size-12 bg-primary text-white rounded-[1.2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center border-none cursor-pointer"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>

                            <div className="space-y-10 relative ml-12">
                                {/* Vertical Line */}
                                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-primary/30 to-rose-400/5 ml-[-40px] rounded-full"></div>

                                {isAddingMilestone && (
                                    <Card className="p-10 bg-card-bg border-none shadow-2xl rounded-[2.5rem] animate-fade-in-up duration-500 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-8 relative z-10">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Initialize Checkpoint</h4>
                                            <button onClick={() => setIsAddingMilestone(false)} className="size-8 rounded-xl bg-background border-2 border-border-color flex items-center justify-center text-foreground/40 hover:text-red-500 hover:border-red-500 transition-all cursor-pointer"><X size={16} /></button>
                                        </div>
                                        <div className="space-y-6 relative z-10">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Checkpoint Identity</label>
                                                <input
                                                    value={newMilestone.title}
                                                    onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                                    className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 italic tracking-tighter"
                                                    placeholder="Define your next peak..."
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Projected Deadline</label>
                                                    <input
                                                        type="date"
                                                        value={newMilestone.dueDate}
                                                        onChange={e => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                                                        className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={addMilestone}
                                                    className="mt-7 w-full bg-primary text-white py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                                                >
                                                    Establish Position
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {roadmap.milestones.map((m, i) => (
                                    <div key={m.id} className="relative group">
                                        {/* Point */}
                                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 size-6 rounded-2xl border-4 ml-[-50px] transition-all duration-500 z-10 shadow-sm ${m.status === 'completed'
                                            ? 'bg-primary border-primary rotate-[225deg] shadow-[0_0_15px_rgba(255,107,107,0.4)]'
                                            : 'bg-background border-border-color group-hover:border-primary/50 group-hover:rotate-45'
                                            }`}></div>

                                        <Card
                                            onClick={() => toggleMilestone(m.id)}
                                            className={`p-10 border-none shadow-sm transition-all duration-500 hover:translate-x-4 cursor-pointer group/item rounded-[2.5rem] relative overflow-hidden ${m.status === 'completed' ? 'bg-primary/5 opacity-60 scale-[0.98]' : 'bg-card-bg hover:shadow-2xl'}`}
                                        >
                                            <div className="flex justify-between items-center text-foreground relative z-10">
                                                <div className="flex items-center gap-8">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-[10px] font-black text-primary/40 italic">POINT-0{i + 1}</span>
                                                        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${m.status === 'completed' ? 'bg-primary text-white' : 'bg-background border-2 border-border-color text-primary/40 shadow-inner'}`}>
                                                            {m.title.toLowerCase().includes('trip') ? (
                                                                <Plane size={24} className="rotate-45" />
                                                            ) : (
                                                                <Layers size={24} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xl font-black italic tracking-tighter uppercase transition-all ${m.status === 'completed' ? 'line-through opacity-40' : 'text-foreground'}`}>{m.title}</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 italic flex items-center gap-3">
                                                            <Calendar size={14} className="text-primary/40" /> {new Date(m.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <button
                                                        onClick={(e) => deleteMilestone(m.id, e)}
                                                        className="size-10 rounded-xl bg-background border-2 border-border-color text-foreground/20 hover:text-red-500 hover:border-red-500 opacity-0 group-hover/item:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    <div className={`size-10 rounded-2xl flex items-center justify-center transition-all duration-700 ${m.status === 'completed' ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30 rotate-[360deg]' : 'bg-background border-2 border-border-color'}`}>
                                                        {m.status === 'completed' ? <CheckCircle2 size={24} /> : <div className="size-2 rounded-full bg-border-color" />}
                                                    </div>
                                                </div>
                                            </div>
                                            {m.status === 'completed' && <div className="absolute inset-y-0 left-0 w-2 bg-primary"></div>}
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

                            <Card className="p-12 bg-card-bg shadow-sm border-none rounded-[3rem] relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Current Alignment</span>
                                    </div>
                                    <button
                                        onClick={resetRoadmap}
                                        className="text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-2xl hover:bg-primary hover:text-white transition-all uppercase tracking-widest border-none cursor-pointer italic"
                                    >
                                        // RELOAD MATRIX
                                    </button>
                                </div>
                                <h4 className="text-5xl font-black mb-12 italic uppercase tracking-tighter text-foreground decoration-primary decoration-8">{currentMonth}</h4>

                                <div className="space-y-12 relative z-10">
                                    {(showAllMonths ? months : months.slice(months.indexOf(currentMonth), months.indexOf(currentMonth) + 4)).map(m => (
                                        <div key={m} className={`flex items-start gap-6 transition-all duration-700 ${m === currentMonth ? 'opacity-100 scale-100' : 'opacity-40 hover:opacity-100 scale-95 hover:scale-100'}`}>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className={`size-4 rounded-xl shadow-lg transition-all duration-700 rotate-[45deg] ${m === currentMonth ? 'bg-primary shadow-primary/30 scale-125' : 'bg-background border-2 border-border-color'}`}></div>
                                                <div className="w-1 h-12 bg-border-color/30 rounded-full"></div>
                                            </div>
                                            <div className="flex-1 pb-2 group/focus">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${m === currentMonth ? 'text-primary' : 'text-gray-400'}`}>{m}</p>
                                                    {editingFocus !== m && (
                                                        <button onClick={() => handleFocusEdit(m)} className="opacity-0 group-hover/focus:opacity-100 size-8 flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border-none bg-transparent cursor-pointer">
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                {editingFocus === m ? (
                                                    <div className="mt-4 flex gap-3 p-2 bg-background/50 rounded-2xl border-2 border-primary/20 shadow-inner">
                                                        <input
                                                            value={focusText}
                                                            onChange={e => setFocusText(e.target.value)}
                                                            className="flex-1 bg-transparent border-none rounded-xl p-3 text-sm font-black outline-none italic tracking-tight text-foreground"
                                                            autoFocus
                                                            onKeyDown={e => e.key === 'Enter' && saveFocus(m)}
                                                        />
                                                        <button onClick={() => saveFocus(m)} className="size-10 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"><Save size={16} /></button>
                                                        <button onClick={() => setEditingFocus(null)} className="size-10 bg-background border-2 border-border-color text-foreground/20 rounded-xl hover:text-red-500 hover:border-red-500 transition-all flex items-center justify-center cursor-pointer"><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <p className={`font-black text-lg tracking-tight italic uppercase transition-all ${m === currentMonth ? 'text-foreground' : 'text-foreground/40'}`}>
                                                        {roadmap.monthlyFocus[m] || PLAN_DEFAULTS[m as keyof typeof PLAN_DEFAULTS] || 'Planning Matrix...'}
                                                    </p>
                                                )}
                                            </div>
                                            {m === currentMonth && editingFocus !== m && <ChevronRight className="text-primary mt-4 animate-slide-in-right" size={24} />}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowAllMonths(!showAllMonths)}
                                    className="w-full mt-12 py-5 bg-primary text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/30 border-none cursor-pointer"
                                >
                                    {showAllMonths ? 'Close Matrix View' : 'Expand Full Journey Spectrum'}
                                </button>
                                <Calendar className="absolute -right-20 -top-20 text-primary opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-[3000ms] group-hover:rotate-180" size={400} />
                            </Card>

                            <div className="p-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-[3rem] border-2 border-primary/10 text-center relative overflow-hidden group shadow-sm">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 relative z-10 italic">Core Alignment Protocol</h3>
                                <p className="text-sm font-black italic tracking-tight text-foreground/60 leading-relaxed uppercase relative z-10 opacity-80">Does daily execution resonate with this directive? if not, a system recalibration is required.</p>
                                <ArrowUpRight className="absolute -right-8 -top-8 text-primary/10 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-1000 opacity-20" size={150} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GoalsRoadmap;
