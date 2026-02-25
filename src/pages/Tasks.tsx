import { useState, useMemo } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Plus,
    Search,
    Filter,
    Clock,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    Trash2,
    Calendar,
    Tag,
    ChevronDown
} from 'lucide-react';

const Tasks = () => {
    const { tasks, addTask, toggleTask, deleteTask, settings, logout } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        name: '',
        time: new Date().toISOString().split('T')[0],
        priority: 'medium' as 'low' | 'medium' | 'high' | 'optional',
        category: 'Work'
    });

    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        category: 'all',
        search: ''
    });

    const today = new Date().toLocaleDateString('en-CA');

    const stats = useMemo(() => {
        const todayTasks = tasks.filter(t => t.time === today).length;
        const total = tasks.length;
        const overdue = tasks.filter(t => !t.completed && new Date(t.time) < new Date(today)).length;
        const notCompleted = tasks.filter(t => !t.completed).length;
        const completionRate = total > 0 ? Math.round(((total - notCompleted) / total) * 100) : 0;

        return { todayTasks, total, overdue, notCompleted, completionRate };
    }, [tasks, today]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            if (filters.status !== 'all') {
                if (filters.status === 'completed' && !t.completed) return false;
                if (filters.status === 'pending' && t.completed) return false;
            }
            if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
            if (filters.category !== 'all' && t.category !== filters.category) return false;
            if (filters.search && !t.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
            return true;
        });
    }, [tasks, filters]);

    const handleAddTask = () => {
        if (!newTask.name.trim()) return;
        addTask(newTask);
        setNewTask({ name: '', time: today, priority: 'medium', category: 'Work' });
        setIsModalOpen(false);
    };

    const priorityColors = {
        low: 'text-blue-500 bg-blue-500/10',
        medium: 'text-amber-500 bg-amber-500/10',
        high: 'text-red-500 bg-red-500/10',
        optional: 'text-gray-500 bg-gray-500/10'
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-background text-foreground transition-all">
            {/* Header / Breadcrumb */}
            <header className="px-6 md:px-12 py-6 md:h-20 flex flex-col md:flex-row items-center justify-between shrink-0 border-b border-border-color bg-card-bg/30 backdrop-blur-md gap-4 md:gap-0">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 shrink-0">Life OS v.2</span>
                    <span className="text-gray-300 shrink-0">/</span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary shrink-0">Task Engine</span>
                </div>
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="size-1.5 md:size-2 rounded-full bg-sage animate-pulse shrink-0"></div>
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-500 truncate">Active // {settings.name.toLowerCase()}@life.os</span>
                    </div>
                    <button
                        onClick={() => { if (confirm('Terminate secure session?')) logout(); }}
                        className="px-3 md:px-4 py-1.5 rounded-lg border border-border-color text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 pb-32">
                <div className="max-w-[1400px] mx-auto space-y-12">

                    {/* Stats Header Section */}
                    <Card className="p-6 md:p-10 border-none shadow-xl bg-card-bg animate-fade-in-up">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
                            <div className="flex flex-col items-center lg:items-start">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">DATE</span>
                                <span className="text-xl font-black italic">{new Date().toLocaleDateString('en-GB')}</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground text-center">Task List</h1>
                            </div>

                            <div className="grid grid-cols-2 md:flex items-center gap-6 md:gap-10 w-full lg:w-auto">
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">TODAY</span>
                                    <span className="text-3xl md:text-4xl font-black text-primary italic leading-none">{stats.todayTasks}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">TOTAL</span>
                                    <span className="text-3xl md:text-4xl font-black italic leading-none">{stats.total}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 text-red-500 italic">OVERDUE</span>
                                    <span className="text-3xl md:text-4xl font-black text-red-500 italic leading-none">{stats.overdue}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 text-amber-500 italic">PENDING</span>
                                    <span className="text-3xl md:text-4xl font-black text-amber-500 italic leading-none">{stats.notCompleted}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Progress Bar Label */}
                    <div className="flex items-center justify-between px-4">
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{stats.completionRate}%</span>
                        <div className="flex-1 mx-8 h-3 bg-primary/5 rounded-full overflow-hidden relative border border-border-color">
                            <div
                                className="absolute inset-y-0 left-0 bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${stats.completionRate}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <Card className="p-0 border-none shadow-2xl overflow-hidden bg-card-bg/80 backdrop-blur-md animate-fade-in-up delay-400">
                        {/* Action Bar */}
                        <div className="p-6 md:p-8 border-b border-gray-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full md:w-auto bg-primary text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 shrink-0"
                            >
                                <Plus size={18} strokeWidth={3} />
                                <span className="text-xs font-black uppercase tracking-widest">Add Task</span>
                            </button>

                            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                                    <div className="relative group shrink-0">
                                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <select
                                            value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            className="appearance-none bg-primary/5 dark:bg-white/5 pl-10 pr-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary/20 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="all">Status</option>
                                            <option value="completed">Done</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>

                                    <div className="relative group shrink-0">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <select
                                            value={filters.priority}
                                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                            className="appearance-none bg-primary/5 dark:bg-white/5 pl-10 pr-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary/20 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="all">Priority</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="relative w-full md:min-w-[240px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full bg-primary/5 dark:bg-white/5 pl-10 pr-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent focus:border-primary/20 outline-none transition-all placeholder:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="overflow-x-auto min-h-[500px]">
                            {filteredTasks.length > 0 ? (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-primary/5 border-b border-border-color">
                                            <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Task Overview</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Timeline</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Urgency</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Progress</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Tag</th>
                                            <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-color/50">
                                        {filteredTasks.map((task, idx) => (
                                            <tr key={task.id} className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all group animate-fade-in-up delay-${(idx % 5 + 1) * 100}`}>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => toggleTask(task.id)}
                                                            className={`size-6 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 ${task.completed ? 'bg-sage border-sage text-white' : 'border-border-color hover:border-primary bg-background'}`}
                                                        >
                                                            {task.completed && <CheckCircle2 size={12} strokeWidth={3} />}
                                                        </button>
                                                        <span className={`text-sm font-bold ${task.completed ? 'text-gray-400 line-through' : 'text-foreground'}`}>
                                                            {task.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Calendar size={14} className="opacity-50" />
                                                        <span className="text-[11px] font-bold">{new Date(task.time).toLocaleDateString('en-GB')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${priorityColors[task.priority] || priorityColors.medium}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`size-1.5 rounded-full ${task.completed ? 'bg-sage shadow-[0_0_8px_rgba(106,160,148,0.5)]' : 'bg-gray-300 animate-pulse'}`}></div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${task.completed ? 'text-sage' : 'text-gray-400'}`}>
                                                            {task.completed ? 'Completed' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{task.category}</span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => deleteTask(task.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                                                            <MoreVertical size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                    <div className="size-24 rounded-full bg-primary/5 flex items-center justify-center border-4 border-card-bg shadow-inner">
                                        <AlertCircle className="text-primary/20" size={48} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground">No Tasks Yet</h3>
                                        <p className="text-xs text-foreground/40 font-black uppercase tracking-widest max-w-[280px]">Start adding tasks to take control of your productivity engine today.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-8 py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                    >
                                        Initialize First Task
                                    </button>
                                </div>
                            )}
                        </div>
                    </Card>

                    <footer className="pt-10 text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Life OS v.2 // Task Engine</span>
                    </footer>
                </div>
            </main>

            {/* Add Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-10 bg-card-bg rounded-[2.5rem] overflow-hidden relative border-none shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">New Task</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="size-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all border-none cursor-pointer"
                            >
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Task Specification</label>
                                <input
                                    autoFocus
                                    value={newTask.name}
                                    onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                                    placeholder="What needs to be done?"
                                    className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 italic tracking-tighter"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Due Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={newTask.time}
                                            onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                                            className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
                                        />
                                        <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-primary opacity-50 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Priority</label>
                                    <div className="relative">
                                        <select
                                            value={newTask.priority}
                                            onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                                            className="w-full bg-background border-2 border-border-color p-5 pl-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="optional">Optional</option>
                                        </select>
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 size-3 rounded-full bg-amber-400 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Status</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-background border-2 border-border-color p-5 pl-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
                                        >
                                            <option>Not Started</option>
                                            <option>In Progress</option>
                                            <option>Completed</option>
                                        </select>
                                        <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={16} />
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Category</label>
                                    <div className="relative">
                                        <select
                                            value={newTask.category}
                                            onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                                            className="w-full bg-background border-2 border-border-color p-5 pl-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
                                        >
                                            {['Work', 'Money', 'Ideas', 'Chores', 'Health', 'Spirituality', 'Personal'].map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" size={16} />
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAddTask}
                                className="w-full py-5 bg-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 border-none cursor-pointer"
                            >
                                Initialize Entry
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Tasks;
