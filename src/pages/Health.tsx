import { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card';
import { useStore } from '../hooks/useStore';
import {
    Heart,
    Calendar,
    Plus,
    Flame,
    Zap,
    History,
    Scale,
    Utensils,
    User,
    Check,
    Moon,
    RotateCcw,
    Trash2,
    TrendingUp,
    Droplets,
    Sparkles,
    AlertCircle,
    Info
} from 'lucide-react';
import {
    LineChart, Line, XAxis, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { analyzeFoodWithAI } from '../services/ai';
import { Loader2 } from 'lucide-react';

const HealthHub = () => {
    const { healthLogs, updateHealth, periods, addPeriod, deletePeriod, settings, updateSettings } = useStore();

    // UI States
    const [isLoggingFood, setIsLoggingFood] = useState(false);
    const [isLoggingCycle, setIsLoggingCycle] = useState(false);
    const [isLoggingWeight, setIsLoggingWeight] = useState(false);
    const [isLoggingSleep, setIsLoggingSleep] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [activeTab, setActiveTab] = useState<'track' | 'gain'>('track');

    // Form States
    const [cycleIntensity, setCycleIntensity] = useState<'light' | 'medium' | 'heavy'>('medium');
    const [foodInput, setFoodInput] = useState('');
    const [weightInput, setWeightInput] = useState('');
    const [sleepInput, setSleepInput] = useState('');
    const [manualCalories, setManualCalories] = useState('');
    const [manualProtein, setManualProtein] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [cycleStartDate, setCycleStartDate] = useState(new Date().toLocaleDateString('en-CA'));

    const [profileForm, setProfileForm] = useState({
        age: settings.age?.toString() || '',
        height: settings.height?.toString() || '',
        targetWeight: settings.targetWeight?.toString() || '',
        activityLevel: settings.activityLevel || 'moderate',
        dietaryPreference: settings.dietaryPreference || '',
        hydrationGoal: settings.hydrationGoalLiters?.toString() || '3.0',
        sleepGoal: settings.sleepGoalHours?.toString() || '8'
    });

    useEffect(() => {
        setProfileForm({
            age: settings.age?.toString() || '',
            height: settings.height?.toString() || '',
            targetWeight: settings.targetWeight?.toString() || '',
            activityLevel: settings.activityLevel || 'moderate',
            dietaryPreference: settings.dietaryPreference || '',
            hydrationGoal: settings.hydrationGoalLiters?.toString() || '3.0',
            sleepGoal: settings.sleepGoalHours?.toString() || '8'
        });
    }, [settings]);

    const today = new Date().toLocaleDateString('en-CA');

    const todayLog = useMemo(() => {
        const log = healthLogs.find(l => l.date === today);
        const lastWeight = [...healthLogs]
            .filter(l => l.weight)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weight || 0;

        return log || {
            id: 'today',
            date: today,
            sleepHours: 0,
            hydrationCups: 0,
            mood: '😐',
            foodQuality: 3,
            junkFoodCount: 0,
            weight: lastWeight,
            calories: 0,
            protein: 0,
            foodLogContent: ''
        };
    }, [healthLogs, today]);

    const last7Days = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toLocaleDateString('en-CA');
            const log = healthLogs.find(l => l.date === dateStr) || { hydrationCups: 0, foodQuality: 1, junkFoodCount: 0, weight: 0 };
            return {
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                water: log.hydrationCups || 0,
                food: log.foodQuality || 0,
                junk: log.junkFoodCount || 0,
                weight: log.weight || 0
            };
        });
    }, [healthLogs]);

    const handleHydration = (ml: number) => {
        const currentLog = (todayLog.hydrationCups || 0);
        const newCups = ml === -1 ? Math.max(0, currentLog - 1) : currentLog + (ml / 250);
        updateHealth({ hydrationCups: newCups });
    };

    const calculateCycleStats = useMemo(() => {
        if (!periods || periods.length === 0) return null;

        const sortedPeriods = [...periods].sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );

        const lastPeriodDate = new Date(sortedPeriods[0].startDate);
        const todayDate = new Date();

        let avgCycleLength = 28;
        let isIrregular = false;
        if (sortedPeriods.length >= 2) {
            const cycleLengths: number[] = [];
            for (let i = 0; i < sortedPeriods.length - 1; i++) {
                const diff = Math.abs(
                    new Date(sortedPeriods[i].startDate).getTime() -
                    new Date(sortedPeriods[i + 1].startDate).getTime()
                );
                cycleLengths.push(Math.round(diff / (1000 * 60 * 60 * 24)));
            }
            avgCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) || 28;

            // Irregularity: Variablity > 7 days or outside 21-35 days
            const min = Math.min(...cycleLengths);
            const max = Math.max(...cycleLengths);
            if (max - min > 7 || avgCycleLength < 21 || avgCycleLength > 35) {
                isIrregular = true;
            }
        }

        const nextPeriod = new Date(lastPeriodDate);
        nextPeriod.setDate(nextPeriod.getDate() + (avgCycleLength || 28));

        const daysUntilNext = Math.round((nextPeriod.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
        const dayInCycle = Math.round((todayDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const ovulationDay = avgCycleLength - 14;
        const fertileStart = ovulationDay - 5;
        const fertileEnd = ovulationDay + 1;

        // PMS usually 5-7 days before period
        const isPms = daysUntilNext <= 5 && daysUntilNext > 0;

        let phase = 'Luteal';
        if (dayInCycle <= 5) phase = 'Menstrual';
        else if (dayInCycle <= fertileStart) phase = 'Follicular';
        else if (dayInCycle >= fertileStart && dayInCycle <= fertileEnd) phase = 'Fertile Window';
        else if (dayInCycle > fertileEnd && dayInCycle <= ovulationDay + 3) phase = 'Ovulation';
        else phase = 'Luteal';

        return {
            lastPeriodDate,
            nextPeriod,
            daysUntilNext: Math.max(0, daysUntilNext),
            avgCycleLength,
            dayInCycle,
            ovulationDay,
            fertileStart,
            fertileEnd,
            phase,
            isPms,
            isIrregular
        };
    }, [periods]);

    const handleFoodLog = () => {
        const cal = parseInt(manualCalories) || 0;
        const pro = parseInt(manualProtein) || 0;

        updateHealth({
            calories: (todayLog.calories || 0) + cal,
            protein: (todayLog.protein || 0) + pro,
            foodLogContent: (todayLog.foodLogContent ? todayLog.foodLogContent + ' | ' : '') + (foodInput || 'Meal Log')
        });

        setIsLoggingFood(false);
        setFoodInput('');
        setManualCalories('');
        setManualProtein('');
        setAiError(null);
    };

    const handleAIAnalysis = async () => {
        if (!foodInput) return;

        setIsAnalyzing(true);
        setAiError(null);

        try {
            // Priority order for API keys: env -> local settings
            const envKey = import.meta.env.VITE_OPENAI_API_KEY;
            const settingsKey = settings.openaiApiKey;
            const apiKey = (envKey && !envKey.startsWith('YOUR_')) ? envKey : settingsKey;

            if (!apiKey || apiKey.startsWith('YOUR_')) {
                throw new Error("OpenAI API key missing. Please set it in Settings or .env");
            }

            const result = await analyzeFoodWithAI(foodInput, apiKey);

            setManualCalories(result.calories.toString());
            setManualProtein(result.protein.toString());

            // Optionally update quality if it's high junk
            if (result.isJunkFood) {
                updateHealth({ junkFoodCount: (todayLog.junkFoodCount || 0) + 1 });
            }

        } catch (error: any) {
            console.error(error);
            setAiError(error.message || "Failed to analyze food. Check your API key.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveProfile = () => {
        updateSettings({
            age: parseInt(profileForm.age) || undefined,
            height: parseFloat(profileForm.height) || undefined,
            targetWeight: parseFloat(profileForm.targetWeight) || undefined,
            activityLevel: profileForm.activityLevel as any,
            dietaryPreference: profileForm.dietaryPreference,
            hydrationGoalLiters: parseFloat(profileForm.hydrationGoal) || 3.0,
            sleepGoalHours: parseFloat(profileForm.sleepGoal) || 8
        });
        setIsEditingProfile(false);
    };

    const handleWeightLog = () => {
        const weight = parseFloat(weightInput);
        if (!isNaN(weight)) {
            updateHealth({ weight });
            setIsLoggingWeight(false);
            setWeightInput('');
        }
    };

    const handleSleepLog = () => {
        const hours = parseFloat(sleepInput);
        if (!isNaN(hours)) {
            updateHealth({ sleepHours: hours });
            setIsLoggingSleep(false);
            setSleepInput('');
        }
    };

    const handleCycleLog = (customDate?: string) => {
        addPeriod({
            startDate: customDate || cycleStartDate,
            intensity: cycleIntensity
        });
        setIsLoggingCycle(false);
        setCycleIntensity('medium');
        setCycleStartDate(today);
    };

    const getGainSupport = useMemo(() => {
        const weight = todayLog.weight || settings.targetWeight || 60;
        const height = settings.height || 170;
        const age = settings.age || 25;
        const activity = settings.activityLevel || 'moderate';

        // Harris-Benedict (Female approx)
        let bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
        const tdee = bmr * (multipliers[activity as keyof typeof multipliers] || 1.55);
        const targetCalories = Math.round(tdee + 400); // 400 surplus
        const proteinGoal = Math.round(weight * 1.8);

        return { targetCalories, proteinGoal, bmr: Math.round(bmr) };
    }, [todayLog.weight, settings]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden fade-in bg-background text-foreground">
            {/* Header */}
            <header className="h-16 px-12 flex items-center justify-between shrink-0 bg-card-bg border-b border-border-color">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Heart className="text-primary" size={20} />
                        <h1 className="text-lg font-black tracking-tight italic">Health Hub</h1>
                    </div>

                    <nav className="flex gap-1 bg-gray-50 dark:bg-border-color p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('track')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'track' ? 'bg-background text-primary shadow-sm' : 'text-gray-400'}`}
                        >
                            Daily Tracker
                        </button>
                        <button
                            onClick={() => setActiveTab('gain')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gain' ? 'bg-background text-primary shadow-sm' : 'text-gray-400'}`}
                        >
                            Gain Support
                        </button>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsEditingProfile(true)} className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
                        <User size={18} />
                    </button>
                    <button onClick={() => setIsLoggingSleep(true)} className="p-2.5 bg-gray-50 dark:bg-border-color text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
                        <Moon size={18} />
                    </button>
                    <button onClick={() => setIsLoggingWeight(true)} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all uppercase tracking-widest">
                        <Scale size={16} /> Log Weight
                    </button>
                    <button onClick={() => setIsLoggingFood(true)} className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all uppercase tracking-widest">
                        <Utensils size={16} /> Log Meals
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-12 py-8">
                {activeTab === 'track' ? (
                    <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
                        {/* Left: General Tracking */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">

                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="p-8 border-none shadow-sm dark:bg-slate-900/50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Nutrition</span>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-3xl font-black italic">{todayLog.calories || 0}</h3>
                                                <span className="text-[10px] font-bold text-gray-400">KCAL</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-sage" style={{ width: `${Math.min(((todayLog.calories || 0) / 2500) * 100, 100)}%` }}></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-gray-400">Protein</span>
                                            <span className="text-sage">{todayLog.protein || 0}g</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-8 border-none shadow-sm dark:bg-slate-900/50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Weight progress</span>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h3 className="text-4xl font-black italic">{todayLog.weight || '--'}</h3>
                                        <span className="text-xs font-bold text-gray-400">{settings.weightUnit}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                                        {todayLog.weight && settings.targetWeight && (
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${Math.min(((todayLog.weight || 0) / (settings.targetWeight || 1)) * 100, 100)}%` }}
                                            ></div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right block">
                                        Goal: {settings.targetWeight || '--'}
                                    </span>
                                </Card>

                                <Card className="p-8 border-none shadow-sm dark:bg-slate-900/50 relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Water intake</span>
                                        {todayLog.hydrationCups > 0 && (
                                            <button
                                                onClick={() => handleHydration(-1)}
                                                className="p-1.5 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                                title="Undo last glass"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h3 className="text-4xl font-black italic">{(todayLog.hydrationCups || 0) * 0.25}</h3>
                                        <span className="text-xs font-bold text-gray-400">L / {settings.hydrationGoalLiters}L</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(((todayLog.hydrationCups || 0) * 0.25 / (settings.hydrationGoalLiters || 3)) * 100, 100)}%` }}></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleHydration(250)} className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all">
                                            + Glass
                                        </button>
                                        <button onClick={() => handleHydration(1000)} className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all">
                                            + Litre
                                        </button>
                                    </div>
                                </Card>

                                <Card className="p-8 border-none shadow-sm dark:bg-slate-900/50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Sleep cycle</span>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <h3 className="text-4xl font-black italic">{todayLog.sleepHours || 0}</h3>
                                        <span className="text-xs font-bold text-gray-400">Hrs / {settings.sleepGoalHours}h</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min(((todayLog.sleepHours || 0) / (settings.sleepGoalHours || 8)) * 100, 100)}%` }}></div>
                                    </div>
                                    <button onClick={() => setIsLoggingSleep(true)} className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">
                                        Log Sleep
                                    </button>
                                </Card>
                            </div>

                            {/* Motivation/Alert Card */}
                            <div className="bg-[#1a1c1b] p-8 rounded-[2.5rem] text-white flex items-center gap-8 relative overflow-hidden group">
                                <div className="size-16 bg-sage/20 rounded-2xl flex items-center justify-center relative z-10">
                                    {calculateCycleStats?.isPms ? <AlertCircle className="text-primary animate-pulse" size={32} /> : <Flame className="text-sage" size={32} />}
                                </div>
                                <div className="relative z-10 flex-1">
                                    <h3 className={`font-bold mb-1 italic ${calculateCycleStats?.isPms ? 'text-primary' : 'text-sage'}`}>
                                        {calculateCycleStats?.isPms ? 'PMS Protocol Active' : 'The Gain Protocol'}
                                    </h3>
                                    <p className="text-sm opacity-80 leading-relaxed font-medium">
                                        {calculateCycleStats?.isPms
                                            ? "Early cycle warnings detected. Increase hydration and prioritize high-magnesium foods to support your body."
                                            : ((todayLog.calories || 0) > 2200
                                                ? "Perfect surplus detected! Your body has the resources to build muscle and healthy tissue."
                                                : `You're currently in a deficit. To reach ${settings.targetWeight || '--'}kg, prioritize healthy fats.`)}
                                    </p>
                                </div>
                                <Zap className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={160} />
                            </div>

                            {/* Weekly Trends */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="p-8">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Weekly Nutrition</h3>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={last7Days}>
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                <Line type="monotone" dataKey="water" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
                                                <Line type="monotone" dataKey="food" stroke="#6AA094" strokeWidth={3} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <Card className="p-8">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Weight Trends</h3>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={last7Days}>
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                                                    {last7Days.map((entry, index) => (
                                                        <Cell key={index} fill={entry.weight > 0 ? 'var(--color-primary)' : '#e2e8f0'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Right Sidebar: Cycle Tracking */}
                        <div className="col-span-12 lg:col-span-4 space-y-8">
                            <Card className="p-10 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-10 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <Calendar size={18} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest italic">Cycle Tracker</h3>
                                    </div>
                                    {calculateCycleStats?.isIrregular && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                                            <AlertCircle size={12} />
                                            <span className="text-[8px] font-black uppercase">Irregular</span>
                                        </div>
                                    )}
                                </div>

                                {calculateCycleStats ? (
                                    <>
                                        <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 text-center mb-8 relative z-10">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Expected In</span>
                                            <h4 className="text-4xl font-black text-primary italic leading-tight">
                                                {calculateCycleStats.daysUntilNext <= 0 ? (calculateCycleStats.phase === 'Menstrual' ? 'Flowing' : 'Delayed') : `${calculateCycleStats.daysUntilNext} Days`}
                                            </h4>
                                            <p className="text-[10px] font-bold text-gray-400 mt-4 bg-white dark:bg-slate-800 inline-block px-4 py-1 rounded-full shadow-sm">
                                                {calculateCycleStats.nextPeriod.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="space-y-4 mb-10 relative z-10">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase</span>
                                                <span className="text-xs font-black text-primary px-3 py-1 bg-primary/10 rounded-lg uppercase tracking-wider">{calculateCycleStats.phase}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cycle Day</span>
                                                <span className="text-xs font-black">{calculateCycleStats.dayInCycle} <span className="text-gray-400 opacity-50">/ {calculateCycleStats.avgCycleLength}</span></span>
                                            </div>
                                        </div>

                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-10 relative z-10">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min((calculateCycleStats.dayInCycle / (calculateCycleStats.avgCycleLength || 28)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-10 bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] text-center mb-8 italic">
                                        <p className="text-xs text-gray-400 font-bold opacity-60">Log your cycle to unlock insights.</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsLoggingCycle(true)}
                                    className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all relative z-10"
                                >
                                    <Plus size={14} className="inline mb-0.5 mr-2" /> Mark Start Date
                                </button>

                                <Calendar className="absolute -right-12 -bottom-12 text-gray-100 dark:text-white/5" size={200} />
                            </Card>

                            <Card className="p-10 relative overflow-hidden bg-slate-900 border-none text-white">
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <h3 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                                        <History size={18} className="text-primary" /> Logged Cycles
                                    </h3>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    {periods.length > 0 ? periods.slice(0, 4).map((p, i) => (
                                        <div key={i} className="group flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-2 rounded-full ${p.intensity === 'heavy' ? 'bg-red-500' : p.intensity === 'medium' ? 'bg-primary' : 'bg-sage'}`} />
                                                <span className="text-xs font-black">{new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <button
                                                onClick={() => deletePeriod(p.startDate)}
                                                className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all scale-75"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )) : (
                                        <p className="text-[10px] font-bold text-gray-500 italic px-2">No history logged yet.</p>
                                    )}
                                </div>
                                <History className="absolute -right-8 -bottom-8 text-white/5" size={120} />
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* Gain Support Content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="p-8 text-center bg-primary/5 border-primary/20">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">TARGET CALORIES</span>
                                <h3 className="text-4xl font-black text-primary italic">{getGainSupport.targetCalories}</h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 italic">~400 kcal surplus</p>
                            </Card>
                            <Card className="p-8 text-center bg-sage/5 border-sage/20">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">PROTEIN GOAL</span>
                                <h3 className="text-4xl font-black text-sage italic">{getGainSupport.proteinGoal}g</h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 italic">1.8g / kg weight</p>
                            </Card>
                            <Card className="p-8 text-center bg-blue-500/5 border-blue-500/20">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">BASAL METABOLIC RATE</span>
                                <h3 className="text-4xl font-black text-blue-500 italic">{getGainSupport.bmr}</h3>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 italic">Resting expenditure</p>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="p-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <TrendingUp className="text-primary" size={24} />
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter">Gain Guide</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <Flame size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black mb-1">High-Calorie Healthy Foods</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed">Avocados, nuts/seeds, peanut butter, whole eggs, oats, and full-fat dairy.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                                        <div className="size-10 bg-sage/10 rounded-xl flex items-center justify-center text-sage shrink-0">
                                            <Utensils size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black mb-1">Meal Timing</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed">Aim for 3 large meals and 2-3 calorie-dense snacks. Don't skip breakfast.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                                        <div className="size-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                            <Droplets size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black mb-1">Hydration Timing</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed">Avoid drinking water 30 min before meals to keep your appetite high.</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-10 bg-slate-900 text-white border-none">
                                <div className="flex items-center gap-3 mb-8">
                                    <Sparkles className="text-primary" size={20} />
                                    <h3 className="text-sm font-black uppercase tracking-widest italic">Sample Meal Plan</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="border-l-2 border-primary/30 pl-4 py-1">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Breakfast</h4>
                                        <p className="text-xs opacity-70">Oatmeal with peanut butter, banana & protein scoop.</p>
                                    </div>
                                    <div className="border-l-2 border-white/10 pl-4 py-1">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Lunch</h4>
                                        <p className="text-xs opacity-70">200g chicken breast or paneer, 1 cup rice, avocado.</p>
                                    </div>
                                    <div className="border-l-2 border-white/10 pl-4 py-1">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pre-Workout Snack</h4>
                                        <p className="text-xs opacity-70">Handful of almonds & dates or a fruit smoothie.</p>
                                    </div>
                                    <div className="border-l-2 border-primary/30 pl-4 py-1">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Dinner</h4>
                                        <p className="text-xs opacity-70">Grilled salmon or tofu, sweet potato, and olive oil dressing.</p>
                                    </div>
                                </div>
                                <p className="mt-8 text-[9px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <Info size={12} /> Consult with a nutritionist for personalized medical advice.
                                </p>
                            </Card>
                        </div>
                    </div>
                )}
            </main>

            {/* Food Log Modal */}
            {isLoggingFood && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-10 bg-card-bg shadow-2xl">
                        <h2 className="text-xl font-black mb-8 text-center uppercase tracking-widest italic tracking-tighter">
                            🥗 Log Your Meals
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">What did you eat?</label>
                                    <div className="relative">
                                        <input
                                            value={foodInput}
                                            onChange={e => setFoodInput(e.target.value)}
                                            placeholder="e.g. 200g chicken breast, 1 bowl rice..."
                                            className="w-full bg-background p-4 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-primary/20"
                                        />
                                        <button
                                            onClick={handleAIAnalysis}
                                            disabled={isAnalyzing || !foodInput}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-primary text-white p-2 rounded-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 text-[10px] font-black uppercase"
                                        >
                                            {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                            Analyze
                                        </button>
                                    </div>
                                    {aiError && <p className="text-[10px] text-red-500 mt-2 font-bold px-2">{aiError}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Calories</label>
                                        <input
                                            type="number"
                                            value={manualCalories}
                                            onChange={e => setManualCalories(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-background p-4 rounded-xl text-xl font-black outline-none border-2 border-primary/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Protein (g)</label>
                                        <input
                                            type="number"
                                            value={manualProtein}
                                            onChange={e => setManualProtein(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-background p-4 rounded-xl text-xl font-black outline-none border-2 border-sage/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setIsLoggingFood(false);
                                        setFoodInput('');
                                    }}
                                    className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFoodLog}
                                    disabled={!manualCalories && !manualProtein}
                                    className="flex-1 py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Check size={16} /> Confirm Log
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Profile Modal */}
            {isEditingProfile && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-10 bg-card-bg overflow-y-auto max-h-[90vh] scrollbar-hide shadow-2xl">
                        <h2 className="text-xl font-black mb-8 text-center uppercase tracking-widest italic">User Profile</h2>
                        <div className="space-y-6 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age</label>
                                    <input value={profileForm.age} onChange={e => setProfileForm({ ...profileForm, age: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-bold outline-none" placeholder="24" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Height (cm)</label>
                                    <input value={profileForm.height} onChange={e => setProfileForm({ ...profileForm, height: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-bold outline-none" placeholder="170" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Weight ({settings.weightUnit})</label>
                                <input value={profileForm.targetWeight} onChange={e => setProfileForm({ ...profileForm, targetWeight: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-bold outline-none border-2 border-sage/20" placeholder="65" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hydration Goal (L)</label>
                                    <input value={profileForm.hydrationGoal} onChange={e => setProfileForm({ ...profileForm, hydrationGoal: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-bold outline-none" placeholder="3.0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sleep Goal (H)</label>
                                    <input value={profileForm.sleepGoal} onChange={e => setProfileForm({ ...profileForm, sleepGoal: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-bold outline-none" placeholder="8" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity Level</label>
                                <select value={profileForm.activityLevel} onChange={e => setProfileForm({ ...profileForm, activityLevel: e.target.value as any })} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-bold outline-none appearance-none">
                                    <option value="sedentary">Sedentary</option>
                                    <option value="light">Lightly Active</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="active">Active</option>
                                    <option value="very_active">Very Active</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dietary Preference</label>
                                <input value={profileForm.dietaryPreference} onChange={e => setProfileForm({ ...profileForm, dietaryPreference: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-bold outline-none" placeholder="Veg, Non-Veg, Vegan..." />
                            </div>
                            <button onClick={handleSaveProfile} className="w-full py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 mt-4">
                                <Check size={18} /> Save Profile
                            </button>
                            <button onClick={() => setIsEditingProfile(false)} className="w-full text-xs font-black text-gray-400 uppercase py-2">Cancel</button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Weight Logging Modal */}
            {isLoggingWeight && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm p-10 bg-card-bg shadow-2xl">
                        <h2 className="text-xl font-black mb-8 text-center uppercase tracking-widest italic">Log Weight</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">New Entry ({settings.weightUnit})</label>
                                <input value={weightInput} onChange={e => setWeightInput(e.target.value)} type="number" className="w-full bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl text-4xl font-black text-center outline-none border-2 border-primary/20" placeholder="00.0" autoFocus />
                            </div>
                            <button onClick={handleWeightLog} className="w-full py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">
                                Confirm & Log
                            </button>
                            <button onClick={() => setIsLoggingWeight(false)} className="w-full text-xs font-black text-gray-400 uppercase py-2">Cancel</button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Sleep Logging Modal */}
            {isLoggingSleep && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm p-10 bg-card-bg shadow-2xl">
                        <h2 className="text-xl font-black mb-8 text-center uppercase tracking-widest italic">Log Sleep</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">Hours Slept</label>
                                <input value={sleepInput} onChange={e => setSleepInput(e.target.value)} type="number" className="w-full bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl text-4xl font-black text-center outline-none border-2 border-indigo-500/20" placeholder="7.5" autoFocus />
                            </div>
                            <button onClick={handleSleepLog} className="w-full py-4 bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">
                                Confirm & Log
                            </button>
                            <button onClick={() => setIsLoggingSleep(false)} className="w-full text-xs font-black text-gray-400 uppercase py-2">Cancel</button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Cycle Log Modal */}
            {isLoggingCycle && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md p-10 bg-card-bg shadow-2xl">
                        <h2 className="text-xl font-black mb-8 text-center uppercase tracking-widest italic">Log Cycle Start</h2>
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 text-center">Start Date</label>
                                <input
                                    type="date"
                                    value={cycleStartDate}
                                    onChange={e => setCycleStartDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-sm font-bold outline-none border-2 border-primary/10 mb-6"
                                />
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 text-center">Flow Intensity</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['light', 'medium', 'heavy'] as const).map(intensity => (
                                        <button
                                            key={intensity}
                                            onClick={() => setCycleIntensity(intensity)}
                                            className={`py-4 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-wider ${cycleIntensity === intensity
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                                }`}
                                        >
                                            {intensity}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsLoggingCycle(false)}
                                    className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleCycleLog()}
                                    className="flex-1 py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    Log Period
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default HealthHub;
