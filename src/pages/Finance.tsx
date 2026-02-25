import { useMemo, useState } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Plus,
    Wallet,
    PiggyBank,
    Search,
    Trash2,
    Settings as SettingsIcon,
    Check
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

const FinanceAudit = () => {
    const { transactions, addTransaction, deleteTransaction, savings, settings, updateSettings, updateSavings } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const [newTx, setNewTx] = useState<{ name: string; amount: string; type: 'expense' | 'income'; category: string }>({ name: '', amount: '', type: 'expense', category: 'Food' });

    // Goals State
    const [goalForm, setGoalForm] = useState({
        monthlyBudget: settings.monthlyBudget?.toString() || '0',
        goalAmount: savings.goalAmount.toString(),
        currentAmount: savings.currentAmount.toString()
    });

    const CATEGORIES = [
        'Food', 'Transport', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Travel', 'Income', 'Others'
    ];

    const CATEGORY_COLORS = {
        'Food': '#FDC3A1',
        'Transport': '#F57799',
        'Rent': '#FB9B8F',
        'Shopping': '#F57799',
        'Entertainment': '#FB9B8F',
        'Health': '#F57799',
        'Travel': '#FDC3A1',
        'Others': '#94a3b8',
        'Income': '#F57799'
    };

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const month = today.slice(0, 7);

        const monthTxs = transactions.filter(t => t.date.startsWith(month));
        const totalSpent = monthTxs
            .filter(t => t.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const totalIncome = monthTxs
            .filter(t => t.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0);

        // Simple chart data (last 7 days of spending)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const amount = transactions
                .filter(t => t.date.startsWith(dateStr) && t.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);
            return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), amount };
        });

        // Category breakdown
        const categoryData = CATEGORIES.map(cat => {
            const amount = monthTxs
                .filter(t => t.category === cat && t.type === 'expense')
                .reduce((acc, curr) => acc + curr.amount, 0);
            return { name: cat, value: amount, color: (CATEGORY_COLORS as any)[cat] || '#94a3b8' };
        }).filter(d => d.value > 0);

        return { totalSpent, totalIncome, last7Days, categoryData };
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t =>
            t.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(filterQuery.toLowerCase())
        );
    }, [transactions, filterQuery]);

    const handleSaveGoals = () => {
        updateSettings({ monthlyBudget: parseFloat(goalForm.monthlyBudget) || 0 });
        updateSavings({
            goalAmount: parseFloat(goalForm.goalAmount) || 0,
            currentAmount: parseFloat(goalForm.currentAmount) || 0
        });
        setIsEditingGoals(false);
    };

    const handleAdd = () => {
        if (!newTx.name || !newTx.amount) return;
        addTransaction({
            name: newTx.name,
            amount: parseFloat(newTx.amount),
            type: newTx.type,
            category: newTx.category,
            date: new Date().toISOString(),
            icon: newTx.category === 'Food' ? '🍱' :
                newTx.category === 'Transport' ? '🚗' :
                    newTx.category === 'Rent' ? '🏠' :
                        newTx.category === 'Shopping' ? '🛍️' :
                            newTx.category === 'Income' ? '💰' : '🏷️'
        });
        setNewTx({ name: '', amount: '', type: 'expense', category: 'Food' });
        setIsAdding(false);
    };

    const budget = settings.monthlyBudget || 0;
    const remaining = budget - stats.totalSpent;
    const savingsProgress = savings.goalAmount > 0 ? (savings.currentAmount / savings.goalAmount) * 100 : 0;

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-background text-foreground transition-all">
            {/* Header */}
            <header className="h-20 px-12 flex items-center justify-between shrink-0 bg-card-bg border-b border-border-color">
                <div>
                    <h1 className="text-xl font-black">Finance Awareness</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Resource Management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditingGoals(true)}
                        className="bg-primary/5 text-gray-400 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary/10 transition-all uppercase tracking-widest"
                    >
                        <SettingsIcon size={16} /> Edit Goals
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={18} /> NEW TRANSACTION
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-12 py-8">
                <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">

                    {/* Summary Row */}
                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="p-8 border-none shadow-sm bg-card-bg animate-fade-in-up delay-100 hover-lift">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Total Spent (Month)</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black text-foreground">₹{stats.totalSpent.toLocaleString()}</h3>
                            </div>
                        </Card>

                        <Card className="p-8 border-none shadow-sm bg-card-bg animate-fade-in-up delay-200 hover-lift">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Remaining Budget</span>
                            <div className="flex items-baseline gap-2">
                                <h3 className={`text-4xl font-black ${budget > 0 && remaining < 500 ? 'text-tangerine' : 'text-foreground'}`}>
                                    ₹{remaining.toLocaleString()}
                                </h3>
                                <span className="text-xs font-bold text-gray-400">{budget > 0 ? `of ₹${budget.toLocaleString()}` : 'No budget set'}</span>
                            </div>
                        </Card>

                        <Card className="p-8 bg-gradient-to-br from-primary to-sage text-white border-none shadow-xl overflow-hidden relative animate-fade-in-up delay-300 hover-lift">
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Savings Progress</span>
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="text-4xl font-black">₹{savings.currentAmount.toLocaleString()}</h3>
                                    <span className="text-xs font-bold text-primary">Target: ₹{savings.goalAmount.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${Math.min(savingsProgress, 100)}%` }}></div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-4 tracking-widest">{Math.round(savingsProgress)}% OF YOUR GOAL REACHED</p>
                            </div>
                            <PiggyBank className="absolute -right-6 -bottom-6 text-white/5 animate-float" size={120} />
                        </Card>
                    </div>

                    {/* Left: Transaction History */}
                    <Card className="col-span-12 lg:col-span-8 p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-sm font-black uppercase tracking-widest">Recent Activity</h3>
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/5 rounded-lg px-3 py-1.5 flex items-center gap-2 border border-border-color">
                                    <Search size={14} className="text-gray-400" />
                                    <input
                                        placeholder="Filter..."
                                        className="bg-transparent border-none outline-none text-xs w-24"
                                        value={filterQuery}
                                        onChange={e => setFilterQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredTransactions.map((t, idx) => (
                                <div key={t.id} className={`group flex items-center justify-between p-5 rounded-2xl bg-card-bg/30 hover:bg-primary/5 transition-all border border-border-color/50 hover:border-primary/30 hover-lift animate-fade-in-up delay-${(idx % 5 + 1) * 100}`}>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="size-12 rounded-xl bg-card-bg flex items-center justify-center text-xl transition-all group-hover:scale-110 shadow-sm border border-border-color"
                                            style={{ color: (CATEGORY_COLORS as any)[t.category] }}
                                        >
                                            {t.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-foreground">{t.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className={`text-sm font-black ${t.type === 'expense' ? 'text-foreground' : 'text-sage'}`}>
                                            {t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString()}
                                        </p>
                                        <button
                                            onClick={() => deleteTransaction(t.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <div className="text-center py-20 animate-fade-in">
                                    <Wallet size={48} className="mx-auto text-gray-200 mb-4 opacity-20" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No transactions found</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Right: Charts & Actions */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                        <Card className="p-10">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-10">Category Breakdown</h3>
                            <div className="h-64 relative">
                                {stats.categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.categoryData}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats.categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <PiggyBank size={32} className="mb-2 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No expenses tracked</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card className="p-10">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-10">Spending Trend</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.last7Days}>
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                            {stats.last7Days.map((_, index) => (
                                                <Cell key={index} fill={index === 6 ? 'var(--color-primary)' : '#e2e8f0'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <div className="bg-primary p-10 rounded-[2.5rem] text-white space-y-4">
                            <PiggyBank size={32} />
                            <h3 className="text-xl font-black">Capital Tip</h3>
                            <p className="text-sm opacity-80 leading-relaxed font-medium">
                                Tracking your small daily leaks helps you identify where you can save significantly over time. Consistency is key to reaching your target!
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-10 bg-card-bg border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-foreground">Log <span className="text-primary italic">Entry</span></h2>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Transaction Identity</label>
                                <input
                                    value={newTx.name}
                                    onChange={e => setNewTx({ ...newTx, name: e.target.value })}
                                    placeholder="e.g. Grocery Store"
                                    className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-base font-black outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 italic tracking-tighter"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Valuation</label>
                                    <input
                                        type="number"
                                        value={newTx.amount}
                                        onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Flow Type</label>
                                    <select
                                        value={newTx.type}
                                        onChange={e => setNewTx({ ...newTx, type: e.target.value as any })}
                                        className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer focus:border-primary/50 transition-all"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Category Classification</label>
                                    <select
                                        value={newTx.category}
                                        onChange={e => setNewTx({ ...newTx, category: e.target.value })}
                                        className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer focus:border-primary/50 transition-all"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Edit Goals Modal */}
            {isEditingGoals && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-12 bg-card-bg border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                                <SettingsIcon size={24} />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Financial <span className="text-primary italic">Targets</span></h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Monthly Spending Limit (₹)</label>
                                <input
                                    type="number"
                                    value={goalForm.monthlyBudget}
                                    onChange={e => setGoalForm({ ...goalForm, monthlyBudget: e.target.value })}
                                    className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all"
                                    placeholder="e.g. 2000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Savings Goal (₹)</label>
                                    <input
                                        type="number"
                                        value={goalForm.goalAmount}
                                        onChange={e => setGoalForm({ ...goalForm, goalAmount: e.target.value })}
                                        className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all"
                                        placeholder="e.g. 10000"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Current Balance (₹)</label>
                                    <input
                                        type="number"
                                        value={goalForm.currentAmount}
                                        onChange={e => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                                        className="w-full bg-background border-2 border-border-color p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all"
                                        placeholder="e.g. 3200"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsEditingGoals(false)}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveGoals}
                                    className="flex-1 py-5 bg-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-none"
                                >
                                    <Check size={18} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FinanceAudit;
