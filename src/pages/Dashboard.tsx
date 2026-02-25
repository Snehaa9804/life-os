import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Activity,
    BookOpen,
    Wallet,
    CheckCircle2,
    Quote,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Edit3,
    Target
} from 'lucide-react';
import type { Habit } from '../types';

const Dashboard = () => {
    const navigate = useNavigate();
    const {
        habits,
        healthLogs,
        transactions,
        settings,
        roadmap,
        tasks,
        toggleHabit,
        deleteHabit,
        updateHabit,
        user
    } = useStore();

    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitCategory, setNewHabitCategory] = useState('Mind');

    const today = new Date().toLocaleDateString('en-CA');

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenseAllTime = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpenseAllTime;

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
        onClick
    }: {
        title: string;
        value: string | number;
        subtitle: string;
        icon: any;
        onClick: () => void;
    }) => (
        <Card
            onClick={onClick}
            className={`p-8 md:p-10 hover-lift transition-all cursor-pointer group relative overflow-hidden bg-card-bg border-none shadow-sm hover:shadow-2xl animate-fade-in-up flex flex-col justify-between`}
        >
            <div className={`size-12 md:size-14 rounded-2xl md:rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-6 md:mb-8 text-primary shadow-inner group-hover:scale-110 transition-transform`}>
                <Icon size={24} className="md:size-[28px]" />
            </div>
            <div>
                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-2 md:mb-3 italic opacity-60">{title}</span>
                <div className="flex items-baseline gap-2 mb-1 md:mb-2">
                    <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter text-foreground leading-none">{value}</h3>
                </div>
                <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest italic leading-none">{subtitle}</p>
            </div>
            <ArrowUpRight className="absolute top-6 md:top-8 right-6 md:right-8 text-primary/20 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all size-5 md:size-6" />
        </Card>
    );

    const [swipingId, setSwipingId] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);

    const handleHabitAction = (id: string, isDone: boolean) => {
        if (!isDone) {
            setSwipingId(id);
            setTimeout(() => {
                toggleHabit(id, today);
                setSwipingId(null);
            }, 600);
        } else {
            toggleHabit(id, today);
        }
    };

    const pendingHabits = habits.filter(h => !h.completedAt.includes(today));
    const completedHabitsCount = habits.length - pendingHabits.length;

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-background text-foreground">
            <header className="px-6 md:px-12 py-6 md:h-28 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 animate-fade-in bg-card-bg/30 backdrop-blur-sm border-b border-border-color/50">
                <div className="flex flex-col gap-1 text-center md:text-left">
                    <h1 className="text-xl md:text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">Welcome, <span className="text-primary">{user?.name || settings.name}</span></h1>
                    <p className="text-[9px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] italic opacity-60">
                        Operational Status: Nominal // {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                    </p>
                </div>
                <div className="size-12 md:size-14 rounded-2xl md:rounded-3xl bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-primary text-xl font-black shadow-inner overflow-hidden">
                    {user?.picture ? (
                        <img src={user.picture} alt="" className="size-full object-cover" />
                    ) : (
                        settings.name[0]
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 lg:pb-12">
                <div className="max-w-[1400px] mx-auto space-y-12">

                    {/* Today's Systems Checklist - TOP Priority */}
                    <div className="space-y-6 md:space-y-10 mt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between px-2 md:px-6 gap-6">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="size-10 md:size-14 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Activity className="size-6 md:size-7" />
                                </div>
                                <div>
                                    <h3 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-foreground italic">Execution Hub</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60 italic hidden md:block">Real-time performance monitoring</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between w-full md:w-auto gap-10">
                                {completedHabitsCount > 0 && (
                                    <button
                                        onClick={() => setShowCompleted(!showCompleted)}
                                        className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors bg-transparent border-none cursor-pointer italic"
                                    >
                                        {showCompleted ? '// Hide' : `// Show ${completedHabitsCount}`} Completed
                                    </button>
                                )}
                                <div className="text-right">
                                    <div className="flex items-baseline gap-2 justify-end">
                                        <span className="text-3xl md:text-4xl font-black text-primary italic tracking-tighter">{efficiency}%</span>
                                    </div>
                                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic opacity-60">Precision</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {(showCompleted ? habits : pendingHabits).map((habit, idx) => {
                                const isDone = habit.completedAt.includes(today);
                                const isSwiping = swipingId === habit.id;

                                return (
                                    <Card
                                        key={habit.id}
                                        onClick={() => handleHabitAction(habit.id, isDone)}
                                        className={`p-4 md:p-6 flex items-center justify-between transition-all duration-500 group relative border-none rounded-[1.5rem] md:rounded-[1.8rem] shadow-sm ${isSwiping ? 'opacity-0 translate-x-32 scale-95 pointer-events-none' : 'animate-fade-in-up'
                                            } ${isDone
                                                ? 'bg-primary/5 opacity-60 scale-[0.98]'
                                                : 'bg-card-bg hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl'
                                            }`}
                                        style={{ transitionDelay: `${isSwiping ? 0 : (idx % 10) * 100}ms` }}
                                    >
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className={`size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${isDone ? 'bg-primary text-white rotate-[360deg]' : 'bg-background border-2 border-border-color text-foreground/10 group-hover:border-primary/50 group-hover:text-primary/50'
                                                }`}>
                                                {isDone ? <CheckCircle2 className="size-5 md:size-6" /> : <div className="size-2 md:size-3 rounded-full bg-border-color group-hover:bg-primary/30 transition-colors" />}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm md:text-base font-black italic tracking-tight transition-all uppercase ${isDone ? 'text-primary/60 line-through' : 'text-foreground'}`}>
                                                    {habit.name}
                                                </h4>
                                                <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic opacity-60 leading-none mt-1">{habit.category}</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 md:px-5 py-2 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${isDone ? 'bg-primary/10 text-primary' : 'bg-background text-foreground/20 border-2 border-border-color'
                                            }`}>
                                            {isDone ? 'DONE' : 'PENDING'}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                        {(habits.length === 0 || (!showCompleted && pendingHabits.length === 0 && habits.length > 0)) && (
                            <Card className="p-16 border-2 border-dashed border-border-color flex flex-col items-center justify-center text-gray-400 italic bg-background/50 rounded-[2.5rem]">
                                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <CheckCircle2 size={40} className="text-primary animate-bounce-soft" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-widest text-foreground">Mission Critical <span className="text-primary italic">Status</span></h3>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">All systems operational // Locked for today</p>
                                <p className="text-[9px] mt-8 font-black text-primary uppercase tracking-widest cursor-pointer hover:underline italic" onClick={() => setShowCompleted(true)}>Review execution history //</p>
                            </Card>
                        )}
                    </div>

                    {/* Premium Habit Snapshot (With Auto-Scroll) */}
                    <Card className="p-0 border-none bg-card-bg shadow-sm rounded-[2.5rem] overflow-hidden my-12">
                        <div className="p-12 border-b border-border-color/50 bg-gradient-to-r from-background to-card-bg">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 italic">Habit Intelligence // Matrix View</h1>
                                    <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                                </div>
                                <button
                                    onClick={() => navigate('/habits')}
                                    className="px-6 py-3 bg-primary/10 text-primary rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all border-none cursor-pointer shadow-sm"
                                >
                                    Global Configuration
                                </button>
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-12">
                                <div className="flex items-center gap-6">
                                    <button onClick={prevMonth} className="size-10 rounded-2xl bg-background border-2 border-border-color flex items-center justify-center hover:border-primary hover:text-primary transition-all text-foreground/40 cursor-pointer">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">{monthName}</h2>
                                    <button onClick={nextMonth} className="size-10 rounded-2xl bg-background border-2 border-border-color flex items-center justify-center hover:border-primary hover:text-primary transition-all text-foreground/40 cursor-pointer">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                                <div className="hidden md:block h-12 w-px bg-border-color"></div>
                                <div className="flex gap-12">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Efficiency</span>
                                        <span className="text-2xl font-black text-primary italic tracking-tight">{efficiency}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Habits Active</span>
                                        <span className="text-2xl font-black text-foreground italic tracking-tight">{totalHabits}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar" ref={tableContainerRef}>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border-color bg-background/30 backdrop-blur-sm">
                                        <th className="p-8 text-left w-[280px] sticky left-0 z-20 bg-card-bg/80 border-r border-border-color group">
                                            <div className="flex items-center gap-3">
                                                <Activity size={16} className="text-primary/40 group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">System Protocol</span>
                                            </div>
                                        </th>
                                        {days.map(day => {
                                            const dateStr = day.date.toLocaleDateString('en-CA');
                                            const isToday = dateStr === today;
                                            return (
                                                <th
                                                    key={day.dayNum}
                                                    data-today={isToday ? "true" : "false"}
                                                    className={`w-[85px] min-w-[85px] py-6 border-r border-border-color/30 relative transition-all ${isToday ? 'bg-primary/10' : ''}`}
                                                >
                                                    {isToday && <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary shadow-[0_0_15px_rgba(255,107,107,0.5)] z-30"></div>}
                                                    <div className={`flex flex-col items-center gap-1 ${isToday ? 'text-primary' : 'text-foreground/20'}`}>
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic leading-none transition-colors`}>{day.dayName}</span>
                                                        <span className="text-sm font-black italic tracking-tighter leading-none">{day.dayNum}</span>
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {habits.map((habit, idx) => (
                                        <tr key={habit.id} className={`h-16 group/row transition-colors ${idx % 2 === 0 ? 'bg-background/20' : 'bg-card-bg/50'}`}>
                                            <td className="p-8 sticky left-0 z-20 bg-inherit border-r border-border-color group/name overflow-hidden">
                                                <div className="flex items-center justify-between gap-6 w-[220px] relative z-20">
                                                    <span className="text-xs font-black italic tracking-tight uppercase truncate flex-1 text-foreground/80 group-hover/row:text-primary transition-colors">{habit.name}</span>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                                        <button
                                                            onClick={() => openEditModal(habit)}
                                                            className="p-2 text-primary/40 hover:text-primary transition-all hover:bg-primary/5 rounded-lg border-none bg-transparent cursor-pointer"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { if (confirm('Purge habit protocol?')) deleteHabit(habit.id); }}
                                                            className="p-2 text-foreground/20 hover:text-red-500 transition-all hover:bg-red-500/5 rounded-lg border-none bg-transparent cursor-pointer"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-y-0 left-0 w-1.5 bg-primary opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                                            </td>
                                            {days.map(day => {
                                                const dateKey = day.date.toLocaleDateString('en-CA');
                                                const isToday = dateKey === today;
                                                const isDone = habit.completedAt.includes(dateKey);
                                                return (
                                                    <td key={day.dayNum} className={`border-r border-border-color/30 transition-all ${isToday ? 'bg-primary/5' : 'hover:bg-primary/5'}`}>
                                                        <div className="flex items-center justify-center h-full">
                                                            <button
                                                                onClick={() => toggleHabit(habit.id, dateKey)}
                                                                className={`size-6 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer shadow-sm ${isDone
                                                                    ? 'bg-primary border-primary text-white scale-110 rotate-[360deg] shadow-primary/30'
                                                                    : 'bg-background border-border-color hover:border-primary/50'
                                                                    }`}
                                                            >
                                                                {isDone && (
                                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white drop-shadow-md">
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
                                    <tr className="bg-primary/5 dark:bg-white/5 text-[9px] font-black uppercase tracking-wider text-gray-400 h-10">
                                        <td className="p-6 sticky left-0 z-20 bg-inherit shadow-[2px_0_10px_rgba(0,0,0,0.05)] border-r border-border-color before:absolute before:inset-0 before:bg-card-bg before:-z-10">Progress</td>
                                        {days.map(day => {
                                            const dateStr = day.date.toLocaleDateString('en-CA');
                                            const isToday = dateStr === today;
                                            const doneCount = habits.filter(h => h.completedAt.includes(dateStr)).length;
                                            const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;
                                            return <td key={day.dayNum} className={`text-center border-r border-gray-50 dark:border-slate-800/50 w-[80px] min-w-[80px] ${isToday ? 'bg-sage/10 dark:bg-sage/5 text-sage font-black' : ''}`}>{pct}%</td>;
                                        })}
                                    </tr>
                                    <tr className="text-[10px] font-black uppercase tracking-wider text-foreground h-10">
                                        <td className="p-6 sticky left-0 z-20 bg-inherit shadow-[2px_0_10_rgba(0,0,0,0.05)] border-r border-border-color before:absolute before:inset-0 before:bg-card-bg before:-z-10">Done</td>
                                        {days.map(day => {
                                            const dateStr = day.date.toLocaleDateString('en-CA');
                                            const isToday = dateStr === today;
                                            const doneCount = habits.filter(h => h.completedAt.includes(dateStr)).length;
                                            return <td key={day.dayNum} className={`text-center border-r border-gray-50 dark:border-slate-800/50 w-[80px] min-w-[80px] ${isToday ? 'bg-sage/10 dark:bg-sage/5 text-sage' : ''}`}>{doneCount}</td>;
                                        })}
                                    </tr>
                                    <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400 h-10">
                                        <td className="p-6 sticky left-0 z-20 bg-inherit shadow-[2px_0_10_rgba(0,0,0,0.05)] border-r border-border-color before:absolute before:inset-0 before:bg-card-bg before:-z-10">Not Done</td>
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
                            title="Habit Strength"
                            value={`${efficiency}%`}
                            subtitle={`${habits.filter(h => h.completedAt.includes(today)).length} Protocols Locked`}
                            icon={CheckCircle2}
                            onClick={() => navigate('/habits')}
                        />

                        <SummaryCard
                            title="Body Composition"
                            value={healthLogs.length > 0 ? `${healthLogs[0].weight || '--'} kg` : '--'}
                            subtitle="Latest Gravitational Log"
                            icon={Activity}
                            onClick={() => navigate('/health')}
                        />

                        <SummaryCard
                            title="Core Growth"
                            value={`${roadmap.milestones.filter(m => m.status === 'completed').length}/${roadmap.milestones.length}`}
                            subtitle="Strategic Checkpoints"
                            icon={Target}
                            onClick={() => navigate('/goals')}
                        />

                        <SummaryCard
                            title="Financial Flow"
                            value={balance.toLocaleString('en-US', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                            subtitle="Liquidity Status"
                            icon={Wallet}
                            onClick={() => navigate('/finance')}
                        />

                        <SummaryCard
                            title="Protocol Hub"
                            value={tasks.filter(t => !t.completed).length}
                            subtitle="Pending Executions"
                            icon={BookOpen}
                            onClick={() => navigate('/tasks')}
                        />

                        {/* DAILY MOTIVATION - Overriding reflections for pure motivation */}
                        <Card className="p-10 lg:col-span-1 bg-card-bg shadow-sm border-none rounded-[2.5rem] h-full flex flex-col justify-center relative overflow-hidden group hover-lift">
                            <Quote className="absolute -top-4 -right-4 text-primary opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-12" size={160} />
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-6 italic opacity-60">Daily Matrix Meditation</span>
                                <p className="text-2xl font-black leading-tight italic text-foreground tracking-tighter">"{quoteToShow}"</p>
                            </div>
                        </Card>

                        <Card
                            onClick={() => navigate('/goals')}
                            className="col-span-full p-8 md:p-14 bg-gradient-to-br from-primary to-rose-400 text-white rounded-[2.5rem] md:rounded-[3rem] border-none shadow-2xl relative overflow-hidden group cursor-pointer animate-fade-in-up delay-500 hover:scale-[1.01] transition-all"
                        >
                            <div className="relative z-10 max-w-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-2 rounded-full bg-white animate-pulse"></div>
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.5em] block italic">Strategic Roadmap // Active Protocol</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black mb-10 italic uppercase tracking-tighter leading-none">{roadmap.mainGoal || 'NO ACTIVE MISSION'}</h2>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-black uppercase tracking-widest shadow-xl">
                                        <div className="size-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,1)]"></div>
                                        Active: {activeMilestone?.title || 'Phase Complete'}
                                    </div>
                                    {nextMilestone && (
                                        <div className="flex items-center gap-4 px-6 py-3 bg-black/5 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-white/40">
                                            Next Cycle: {nextMilestone.title}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Activity className="absolute -right-20 -bottom-20 text-white/5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000 group-hover:rotate-12" size={450} />
                        </Card>
                    </div>
                </div>
            </main>

            {editingHabit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-10 bg-card-bg shadow-2xl rounded-[2.5rem] border-none overflow-hidden relative">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                                <Activity size={24} />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Protocol <span className="text-primary italic">Refactor</span></h2>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Habit Identification</label>
                                    <input
                                        autoFocus
                                        value={newHabitName}
                                        onChange={e => setNewHabitName(e.target.value)}
                                        placeholder="e.g. 5am Wake Up"
                                        className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 italic tracking-tighter"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Dimensional Category</label>
                                    <select
                                        value={newHabitCategory}
                                        onChange={e => setNewHabitCategory(e.target.value)}
                                        className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none transition-all appearance-none cursor-pointer focus:border-primary/50"
                                    >
                                        <option value="Mind">Mind</option>
                                        <option value="Body">Body</option>
                                        <option value="Work">Work</option>
                                        <option value="Spirit">Spirit</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setEditingHabit(null);
                                        setNewHabitName('');
                                    }}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleUpdateHabit}
                                    className="flex-1 py-5 bg-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all border-none flex items-center justify-center gap-3"
                                >
                                    <CheckCircle2 size={18} /> Re-Initialize
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
