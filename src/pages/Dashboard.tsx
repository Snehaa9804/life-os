import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Activity,
    BookOpen,
    Play,
    Wallet,
    Heart,
    CheckCircle2,
    Quote,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Edit3
} from 'lucide-react';
import type { Habit } from '../types';

const Dashboard = () => {
    const navigate = useNavigate();
    const {
        habits,
        healthLogs,
        youtube,
        transactions,
        studyHours,
        settings,
        roadmap,
        toggleHabit,
        deleteHabit,
        updateHabit
    } = useStore();

    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitCategory, setNewHabitCategory] = useState('Mind');

    const today = new Date().toLocaleDateString('en-CA');

    // 1. Habit Status
    const completedToday = habits.filter(h => h.completedAt.includes(today)).length;
    const habitProgress = habits.length > 0 ? (completedToday / habits.length) * 100 : 0;

    // 2. Health Summary
    const latestHealth = healthLogs[0] || { sleepHours: 0, hydrationCups: 0, mood: '😐' };

    // 3. Study Progress
    const studyToday = studyHours[today] || 0;

    // 4. Finance Summary
    const monthTransactions = transactions.filter(t => t.date.startsWith(today.slice(0, 7)));
    const totalSpent = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

    // 5. Daily Mastery Quote (Changes every day)
    const DAILY_QUOTES = [
        "Mastery is not a destination, it is a continuous journey. Brick by brick, line by line.",
        "Your future is built on what you do today, not what you plan to do tomorrow.",
        "Discipline is the bridge between goals and accomplishment.",
        "The best way to predict the future is to create it. Keep coding, keep building.",
        "Don't stop until you're proud. Today's effort is tomorrow's victory.",
        "Mastery requires the persistence to keep going when the initial excitement fades.",
        "Success is the sum of small efforts, repeated day in and day out.",
        "Focus on progress, not perfection. Every line of code brings you closer to mastery.",
        "The only way to do great work is to love what you do and stay committed.",
        "Great things are not done by impulse, but by a series of small things brought together."
    ];

    const dailyQuote = useMemo(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
    }, []);

    // Prioritize dailyQuote for motivation
    const quoteToShow = dailyQuote;

    // Habit Tracker Snapshot Logic
    const days = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(year, month, i + 1);
            return {
                date,
                dayNum: date.getDate(),
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
            };
        });
    }, [currentDate]);

    const prevMonth = () => {
        setCurrentDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const efficiency = useMemo(() => {
        if (habits.length === 0) return 0;
        const doneToday = habits.filter(h => h.completedAt.includes(today)).length;
        return Math.round((doneToday / habits.length) * 100);
    }, [habits, today]);

    const activeMilestone = useMemo(() => {
        if (!roadmap.milestones) return null;
        return roadmap.milestones.find(m => m.status === 'pending') || roadmap.milestones[roadmap.milestones.length - 1];
    }, [roadmap.milestones]);

    const nextMilestone = useMemo(() => {
        if (!roadmap.milestones) return null;
        const pending = roadmap.milestones.filter(m => m.status === 'pending');
        return pending.length > 1 ? pending[1] : null;
    }, [roadmap.milestones]);

    const totalHabits = habits.length;

    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (tableContainerRef.current) {
            const todayCol = tableContainerRef.current.querySelector('[data-today="true"]');
            if (todayCol) {
                const containerWidth = tableContainerRef.current.offsetWidth;
                const colLeft = (todayCol as HTMLElement).offsetLeft;
                const colWidth = (todayCol as HTMLElement).offsetWidth;

                tableContainerRef.current.scrollTo({
                    left: colLeft - (containerWidth / 2) + (colWidth / 2),
                    behavior: 'smooth'
                });
            }
        }
    }, [days, today]);

    const handleUpdateHabit = () => {
        if (!editingHabit || !newHabitName.trim()) return;
        updateHabit(editingHabit.id, {
            name: newHabitName,
            category: newHabitCategory
        });
        setNewHabitName('');
        setEditingHabit(null);
    };

    const openEditModal = (habit: Habit) => {
        setEditingHabit(habit);
        setNewHabitName(habit.name);
        setNewHabitCategory(habit.category);
    };

    const SummaryCard = ({
        title,
        value,
        subtitle,
        icon: Icon,
        color,
        onClick
    }: {
        title: string;
        value: string | number;
        subtitle: string;
        icon: any;
        color: string;
        onClick: () => void;
    }) => (
        <Card
            onClick={onClick}
            className={`p-8 hover-lift transition-all cursor-pointer group relative overflow-hidden bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm border-gray-100/50 dark:border-slate-800/50 animate-fade-in-up shadow-sm hover:shadow-xl`}
        >
            <div className={`size-12 rounded-2xl ${color} flex items-center justify-center mb-6 text-white shadow-lg`}>
                <Icon size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">{title}</span>
            <h3 className="text-3xl font-black mb-1 text-slate-900 dark:text-white">{value}</h3>
            <p className="text-sm font-medium text-gray-500">{subtitle}</p>
            <ArrowUpRight className="absolute top-6 right-6 text-gray-300 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={20} />
        </Card>
    );

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-background text-foreground">
            <header className="h-24 px-12 flex items-center justify-between shrink-0 animate-fade-in">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back, {settings.name}</h1>
                    <p className="text-sm font-medium text-gray-500">Your life at a glance. Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
                </div>
                <div className="size-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black animate-pulse-soft">
                    {settings.name[0]}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-12 pb-12">
                <div className="max-w-[1400px] mx-auto space-y-8">

                    {/* Today's Systems Checklist - TOP Priority */}
                    <Card className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-widest">Daily Execution</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Priority Systems for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-primary">{efficiency}%</span>
                                    <p className="text-[9px] font-black text-gray-500 uppercase">Today's Precision</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {habits.map((habit, idx) => (
                                    <button
                                        key={habit.id}
                                        onClick={() => toggleHabit(habit.id, today)}
                                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all border-2 animate-fade-in-up delay-${(idx + 1) * 100} ${habit.completedAt.includes(today)
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[0.98]'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary/50'}`}
                                    >
                                        <div className={`size-12 rounded-full flex items-center justify-center ${habit.completedAt.includes(today) ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-600'}`}>
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center truncate w-full">
                                            {habit.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {habits.length === 0 && (
                                <p className="text-xs text-center text-gray-500 italic py-4">Establish your habits in global config.</p>
                            )}
                        </div>
                        <Activity className="absolute -right-20 -top-20 text-white/5" size={300} />
                    </Card>

                    {/* Premium Habit Snapshot (With Auto-Scroll) */}
                    <Card className="p-0 border-border-color bg-white/50 dark:bg-slate-900/40 backdrop-blur-md overflow-hidden">
                        <div className="p-8 border-b border-gray-50 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Life OS v.2 // Habit Intelligence</h1>
                                <button
                                    onClick={() => navigate('/habits')}
                                    className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border-none cursor-pointer"
                                >
                                    Global Config
                                </button>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <button onClick={prevMonth} className="size-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all border-none cursor-pointer">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <h2 className="text-3xl font-black">{monthName}</h2>
                                    <button onClick={nextMonth} className="size-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all border-none cursor-pointer">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
                                <div className="flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                                        <span className="text-lg font-black text-sage">{efficiency}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Habits Active</span>
                                        <span className="text-lg font-black">{totalHabits}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar" ref={tableContainerRef}>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-50 dark:border-slate-800">
                                        <th className="p-6 text-left w-[240px] sticky left-0 z-20 bg-[#f8fafc] dark:bg-[#0f172a] shadow-[2px_0_10px_rgba(0,0,0,0.05)] border-r border-border-color">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Habit</span>
                                        </th>
                                        {days.map(day => {
                                            const dateStr = day.date.toLocaleDateString('en-CA');
                                            const isToday = dateStr === today;
                                            return (
                                                <th
                                                    key={day.dayNum}
                                                    data-today={isToday ? "true" : "false"}
                                                    className={`w-[80px] min-w-[80px] py-4 border-r border-gray-50 dark:border-slate-800/50 relative ${isToday ? 'bg-sage/10 dark:bg-sage/5' : ''}`}
                                                >
                                                    {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-sage"></div>}
                                                    <div className={`flex flex-col items-center ${isToday ? 'text-sage font-black' : 'opacity-40'}`}>
                                                        <span className={`text-[9px] font-black uppercase leading-none mb-1 transition-colors ${isToday ? 'text-sage' : 'text-gray-400 dark:text-gray-500'}`}>{day.dayName}</span>
                                                        <span className="text-xs font-black leading-none">{day.dayNum}</span>
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {habits.map((habit, idx) => (
                                        <tr key={habit.id} className={`h-14 group/row ${idx % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/30 dark:bg-white/[0.02]'}`}>
                                            <td className="p-6 sticky left-0 z-20 bg-inherit shadow-[2px_0_10px_rgba(0,0,0,0.05)] border-r border-gray-50 dark:border-slate-800 before:absolute before:inset-0 before:bg-[#f8fafc] dark:before:bg-[#0f172a] before:-z-10">
                                                <div className="flex items-center justify-between gap-4 w-[180px]">
                                                    <span className="text-xs font-bold truncate flex-1">{habit.name}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(habit)}
                                                            className="p-1 text-gray-400 hover:text-primary transition-colors border-none bg-transparent cursor-pointer"
                                                        >
                                                            <Edit3 size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => { if (confirm('Delete habit?')) deleteHabit(habit.id); }}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            {days.map(day => {
                                                const dateKey = day.date.toLocaleDateString('en-CA');
                                                const isToday = dateKey === today;
                                                const isDone = habit.completedAt.includes(dateKey);
                                                return (
                                                    <td key={day.dayNum} className={`border-r border-gray-50 dark:border-slate-800/50 ${isToday ? 'bg-sage/10 dark:bg-sage/5' : ''}`}>
                                                        <div className="flex items-center justify-center h-full">
                                                            <button
                                                                onClick={() => toggleHabit(habit.id, dateKey)}
                                                                className={`size-5 rounded-md border transition-all flex items-center justify-center cursor-pointer ${isDone
                                                                    ? 'bg-sage border-sage text-white'
                                                                    : 'bg-white dark:bg-transparent border-gray-200 dark:border-slate-800 hover:border-sage'
                                                                    }`}
                                                            >
                                                                {isDone && (
                                                                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none" className="text-white">
                                                                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-border-color">
                                    <tr className="bg-gray-50/20 dark:bg-white/[0.02] text-[9px] font-black uppercase tracking-wider text-gray-400 h-10">
                                        <td className="p-6 sticky left-0 z-20 bg-inherit shadow-[2px_0_10px_rgba(0,0,0,0.05)] border-r border-gray-50 dark:border-slate-800">Progress</td>
                                        {days.map(day => {
                                            const dateStr = day.date.toLocaleDateString('en-CA');
                                            const isToday = dateStr === today;
                                            const doneCount = habits.filter(h => h.completedAt.includes(dateStr)).length;
                                            const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;
                                            return <td key={day.dayNum} className={`text-center border-r border-gray-50 dark:border-slate-800/50 w-[80px] min-w-[80px] ${isToday ? 'bg-sage/10 dark:bg-sage/5 text-sage font-black' : ''}`}>{pct}%</td>;
                                        })}
                                    </tr>
                                    <tr className="text-[10px] font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 h-10">
                                        <td className="p-6 sticky left-0 z-20 bg-inherit shadow-[2px_0_10_rgba(0,0,0,0.05)] border-r border-gray-50 dark:border-slate-800">Done</td>
                                        {days.map(day => {
                                            const dateStr = day.date.toLocaleDateString('en-CA');
                                            const isToday = dateStr === today;
                                            const doneCount = habits.filter(h => h.completedAt.includes(dateStr)).length;
                                            return <td key={day.dayNum} className={`text-center border-r border-gray-50 dark:border-slate-800/50 w-[80px] min-w-[80px] ${isToday ? 'bg-sage/10 dark:bg-sage/5 text-sage' : ''}`}>{doneCount}</td>;
                                        })}
                                    </tr>
                                    <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 h-10">
                                        <td className="p-6 sticky left-0 z-20 bg-inherit shadow-[2px_0_10_rgba(0,0,0,0.05)] border-r border-gray-50 dark:border-slate-800">Not Done</td>
                                        {days.map(day => {
                                            const dateStr = day.date.toLocaleDateString('en-CA');
                                            const isToday = dateStr === today;
                                            const doneCount = habits.filter(h => h.completedAt.includes(dateStr)).length;
                                            return <td key={day.dayNum} className={`text-center border-r border-gray-50 dark:border-slate-800/50 w-[80px] min-w-[80px] ${isToday ? 'bg-sage/10 dark:bg-sage/5' : ''}`}>{habits.length - doneCount}</td>;
                                        })}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Summary Cards */}
                        <SummaryCard
                            title="Habits Status"
                            value={`${Math.round(habitProgress)}%`}
                            subtitle={`${completedToday} of ${habits.length} done today`}
                            icon={CheckCircle2}
                            color="bg-sage"
                            onClick={() => navigate('/habits')}
                        />

                        <SummaryCard
                            title="Physical Health"
                            value={latestHealth.mood}
                            subtitle={`${latestHealth.sleepHours}h Sleep • ${latestHealth.hydrationCups} Cups Water`}
                            icon={Heart}
                            color="bg-primary"
                            onClick={() => navigate('/health')}
                        />

                        <SummaryCard
                            title="Study Progress"
                            value={`${studyToday}h`}
                            subtitle="Focus session duration today"
                            icon={BookOpen}
                            color="bg-purple-500"
                            onClick={() => navigate('/growth')}
                        />

                        <SummaryCard
                            title="YouTube Growth"
                            value={youtube.subscribers.toLocaleString()}
                            subtitle={`${youtube.videosCount} Videos • Channel is healthy`}
                            icon={Play}
                            color="bg-red-500"
                            onClick={() => navigate('/youtube')}
                        />

                        <SummaryCard
                            title="Spending"
                            value={`₹${totalSpent.toLocaleString()}`}
                            subtitle="Total expenses this month"
                            icon={Wallet}
                            color="bg-tangerine"
                            onClick={() => navigate('/finance')}
                        />

                        {/* DAILY MOTIVATION - Overriding reflections for pure motivation */}
                        <Card className="p-8 lg:col-span-1 bg-card-bg shadow-sm border-border-color h-full flex flex-col justify-center relative overflow-hidden group">
                            <Quote className="absolute top-6 right-6 text-gray-100 dark:text-gray-800 group-hover:text-primary/20 transition-colors" size={64} />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-4">Daily Motivation</span>
                            <p className="text-xl font-bold leading-relaxed italic relative z-10">"{quoteToShow}"</p>
                        </Card>

                        <Card
                            onClick={() => navigate('/goals')}
                            className="col-span-full p-10 bg-[#1a1c1b] dark:bg-white/5 text-white rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group cursor-pointer animate-fade-in-up delay-500"
                        >
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-4">Current Roadmap</span>
                                <h2 className="text-3xl font-black mb-6">{roadmap.mainGoal || 'NO ACTIVE MISSION'}</h2>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 text-xs font-bold animate-float">
                                        <div className="size-2 rounded-full bg-sage shadow-[0_0_8px_rgba(106,160,148,1)]"></div>
                                        Active: {activeMilestone?.title || 'Phase Complete'}
                                    </div>
                                    {nextMilestone && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 text-xs font-bold text-gray-400">
                                            Next: {nextMilestone.title}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Activity className="absolute -right-12 -bottom-12 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={300} />
                        </Card>
                    </div>
                </div>
            </main>

            {editingHabit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-10 bg-white dark:bg-[#1a1d1c]">
                        <h2 className="text-xl font-black mb-8">RECONFIGURE HABIT</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Habit Name</label>
                                <input
                                    value={newHabitName}
                                    onChange={e => setNewHabitName(e.target.value)}
                                    placeholder="e.g. 5am Wake Up"
                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage/20 border border-transparent focus:border-sage/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                                <select
                                    value={newHabitCategory}
                                    onChange={e => setNewHabitCategory(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sage/20 border border-transparent"
                                >
                                    <option value="Mind">Mind</option>
                                    <option value="Body">Body</option>
                                    <option value="Work">Work</option>
                                    <option value="Spirit">Spirit</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setEditingHabit(null);
                                        setNewHabitName('');
                                    }}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleUpdateHabit}
                                    className="flex-1 py-4 bg-sage text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-sage/20 hover:scale-[1.02] transition-all border-none cursor-pointer"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
