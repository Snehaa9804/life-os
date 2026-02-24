import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card from '../components/Card';
import type { Habit } from '../types';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Edit3
} from 'lucide-react';

const HabitIntelligence = () => {
    const { habits, addHabit, deleteHabit, updateHabit } = useStore();
    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitCategory, setNewHabitCategory] = useState('Mind');

    const handleAddHabit = () => {
        if (!newHabitName.trim()) return;
        addHabit({
            name: newHabitName,
            category: newHabitCategory,
            icon: newHabitCategory === 'Body' ? 'fitness_center' : 'self_improvement',
            priority: 'medium',
            frequency: 'daily'
        });
        setNewHabitName('');
        setIsAdding(false);
    };

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

    // Navigation logic for stats
    const prevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const efficiency = useMemo(() => {
        if (habits.length === 0) return 0;
        const today = new Date().toLocaleDateString('en-CA');
        const doneToday = habits.filter(h => h.completedAt.includes(today)).length;
        return Math.round((doneToday / habits.length) * 100);
    }, [habits]);

    const monthlyGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const anyDone = habits.some(h => h.completedAt.includes(dateStr));
            return { day, done: anyDone };
        });
    }, [habits, currentDate]);


    // Prepare data for the intensity chart (last 30 days)
    const intensityData = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateStr = date.toLocaleDateString('en-CA');
            const done = habits.filter(h => h.completedAt.includes(dateStr)).length;
            const pct = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;
            return {
                name: (29 - i) === 0 ? 'Today' : '',
                intensity: pct
            };
        });
    }, [habits]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-[#f4f7f6] dark:bg-[#0f1211] text-[#1a1c1b] dark:text-gray-100">
            {/* Top Status Bar */}
            <div className="h-10 bg-white dark:bg-[#1a1d1c] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-12 text-sm font-bold text-gray-500 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-sage"></div>
                        Consistency System: Active // snehapal1090@gmail.com
                    </div>
                </div>
                <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Logout</button>
            </div>

            {/* Integrated Header */}
            <div className="px-12 py-8 flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400 mb-1">Life OS v.2 // Habit Intelligence</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <button onClick={prevMonth} className="size-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <h2 className="text-3xl font-black">{monthName}</h2>
                            <button onClick={nextMonth} className="size-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
                        <div className="flex gap-6">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                                <span className="text-lg font-black text-sage">{efficiency}%</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Habits Active</span>
                                <span className="text-lg font-black">{habits.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-12 pb-12">
                <div className="max-w-[1400px] mx-auto flex flex-col gap-8">


                    {/* Habit Management List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black uppercase tracking-widest text-gray-400">Habit Management</h3>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-sage/10 text-sage rounded-xl text-sm font-black uppercase tracking-widest hover:bg-sage hover:text-white transition-all"
                            >
                                <Plus size={14} /> Add System
                            </button>
                        </div>

                        {/* Inline Quick Add */}
                        <Card className="p-6 bg-white dark:bg-[#1a1d1c] border-dashed border-2 border-gray-200 dark:border-gray-800 hover:border-sage/50 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-sage/10 flex items-center justify-center">
                                    <Plus size={20} className="text-sage" />
                                </div>
                                <input
                                    type="text"
                                    value={newHabitName}
                                    onChange={e => setNewHabitName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                                    placeholder="Enter habit name to initiate..."
                                    className="bg-transparent border-none outline-none text-lg font-bold w-full placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                />
                                <div className="text-sm font-black text-gray-300 uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">Press Enter to Commit</div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {habits.map((habit) => (
                                <Card key={habit.id} className="p-6 bg-white dark:bg-[#1a1d1c] hover:shadow-xl hover:shadow-sage/5 transition-all group border-gray-100 dark:border-gray-800 relative overflow-hidden">
                                    <div className="flex items-start justify-between relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-sm font-black uppercase tracking-widest bg-sage/10 text-sage border border-sage/20">
                                                    {habit.category}
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black mb-1 group-hover:text-sage transition-colors">{habit.name}</h4>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">System Active // Protection Enabled</p>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(habit)}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-sage transition-colors"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => { if (confirm('Delete this habit?')) deleteHabit(habit.id); }}
                                                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex -space-x-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`size-1.5 rounded-full border border-white dark:border-[#1a1d1c] ${i <= 3 ? 'bg-sage' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                                            ))}
                                        </div>
                                        <span className="text-sm font-black text-gray-400 uppercase">Status // Locked</span>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 size-24 bg-sage/5 rounded-full blur-2xl group-hover:bg-sage/10 transition-colors"></div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Analysis & Motivation Through Proof Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        {/* Analysis Card */}
                        <Card className="p-10 bg-white dark:bg-[#1a1d1c] flex flex-col">
                            <h2 className="text-base font-black mb-8 text-center uppercase tracking-widest">Analytics Dashboard</h2>

                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-3 text-sm font-black text-gray-400 uppercase tracking-widest text-center mb-4">
                                    <span>Goal</span>
                                    <span>Actual</span>
                                    <span>Progress</span>
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {habits.map(habit => {
                                        const actual = habit.completedAt.length;
                                        const goal = 30; // Mock goal
                                        const progress = (actual / goal) * 100;

                                        return (
                                            <div key={habit.id} className="grid grid-cols-3 items-center text-center">
                                                <span className="text-lg font-black">{goal}</span>
                                                <span className="text-lg font-black">{actual}</span>
                                                <div className="flex justify-center">
                                                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-tangerine" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8 p-10 bg-white dark:bg-transparent border border-gray-100 dark:border-gray-800 rounded-[2.5rem] flex-1">
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8">Daily Execution Intensity</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={intensityData}>
                                            <defs>
                                                <linearGradient id="intensityColor" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2D5A27" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#2D5A27" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="intensity"
                                                stroke="#2D5A27"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#intensityColor)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-10 bg-white dark:bg-[#1a1d1c]">
                            <h3 className="text-base font-black uppercase tracking-widest mb-8">Completed Habits Graph</h3>
                            <div className="h-48 flex items-end gap-1">
                                {intensityData.map((d, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm"
                                        style={{ height: `${Math.max(d.intensity, 5)}%` }}
                                        title={d.name || `Day ${i + 1}`}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-sm font-black text-gray-400 uppercase tracking-widest">
                                <span>30 Days Ago</span>
                                <span>Today</span>
                            </div>
                        </Card>

                        <Card className="p-10 bg-white dark:bg-[#1a1d1c]">
                            <h3 className="text-base font-black uppercase tracking-widest mb-8">Monthly Visual proof</h3>
                            <div className="grid grid-cols-7 gap-2">
                                {monthlyGrid.map((d, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-md flex items-center justify-center text-sm font-bold transition-all ${d.done ? 'bg-sage text-white shadow-lg shadow-sage/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                                    >
                                        {d.day}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-6 text-sm font-medium text-gray-500 text-center">Consistency is the bridge between goals and achievement.</p>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Add/Edit Habit Modal */}
            {(isAdding || editingHabit) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-10 bg-white dark:bg-[#1a1d1c]">
                        <h2 className="text-xl font-black mb-8">{editingHabit ? 'RECONFIGURE HABIT' : 'INITIATE NEW HABIT'}</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Habit Name</label>
                                <input
                                    value={newHabitName}
                                    onChange={e => setNewHabitName(e.target.value)}
                                    placeholder="e.g. 5am Wake Up"
                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-base outline-none focus:ring-2 focus:ring-sage/20 border border-transparent focus:border-sage/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Category</label>
                                <select
                                    value={newHabitCategory}
                                    onChange={e => setNewHabitCategory(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-base outline-none focus:ring-2 focus:ring-sage/20 border border-transparent"
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
                                        setIsAdding(false);
                                        setEditingHabit(null);
                                        setNewHabitName('');
                                    }}
                                    className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={editingHabit ? handleUpdateHabit : handleAddHabit}
                                    className="flex-1 py-4 bg-sage text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-sage/20 hover:scale-[1.02] transition-all"
                                >
                                    {editingHabit ? 'Update' : 'Establish'}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default HabitIntelligence;
