import React, { useState, useEffect, createContext, useContext } from 'react';
import type {
    Habit, Task, Transaction, HealthLog, Reflection,
    YouTubeGrowth, Savings, GoalRoadmap, PeriodData, UserSettings, VideoPlan, User
} from '../types';

// Helper function for safe JSON parsing
const safeParseJSON = <T,>(json: string | null, fallback: T): T => {
    if (!json) return fallback;
    try {
        return JSON.parse(json) as T;
    } catch (error) {
        // Only log in development to avoid console noise in production
        if (import.meta.env.DEV) {
            console.error('Failed to parse JSON from localStorage:', error);
        }
        return fallback;
    }
};

// Helper function for generating unique IDs
const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// Debounce helper for localStorage writes - now more robust with cleanup
const useDebounce = () => {
    const timeoutRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const debounceSave = (key: string, value: unknown, delay: number = 500) => {
        if (timeoutRef.current[key]) {
            clearTimeout(timeoutRef.current[key]);
        }
        timeoutRef.current[key] = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                delete timeoutRef.current[key];
            } catch (error) {
                console.error(`Failed to save to localStorage (${key}):`, error);
            }
        }, delay);
    };

    return debounceSave;
};

const getDefaultSettings = (): UserSettings => ({
    name: 'User',
    notificationsEnabled: true,
    theme: 'dark',
    monthlyBudget: 0,
    weightUnit: 'kg',
    activityLevel: 'moderate',
    hydrationGoalLiters: 3.0,
    sleepGoalHours: 8,
    youtubeChannelId: undefined,
    youtubeApiKey: undefined,
    openaiApiKey: undefined,
});

const backfillSettings = (parsed: UserSettings) => {
    const isPlaceholder = (key?: string) => !key || key.startsWith('YOUR_') || key === 'PASTE_YOUR_OPENAI_API_KEY_HERE';
    const envYTKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const envYTChannel = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
    const envOpenAI = import.meta.env.VITE_OPENAI_API_KEY;

    if (isPlaceholder(parsed.youtubeApiKey) && envYTKey && !isPlaceholder(envYTKey)) parsed.youtubeApiKey = envYTKey;
    if (isPlaceholder(parsed.youtubeChannelId) && envYTChannel && !isPlaceholder(envYTChannel)) parsed.youtubeChannelId = envYTChannel;
    if (isPlaceholder(parsed.openaiApiKey) && envOpenAI && !isPlaceholder(envOpenAI)) parsed.openaiApiKey = envOpenAI;
    return parsed;
};

// Create context type
type StoreType = {
    habits: Habit[];
    tasks: Task[];
    transactions: Transaction[];
    healthLogs: HealthLog[];
    reflections: Reflection[];
    youtube: YouTubeGrowth;
    savings: Savings;
    roadmap: GoalRoadmap;
    periods: PeriodData[];
    settings: UserSettings;
    studyHours: Record<string, number>;
    videoPlans: VideoPlan[];
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => boolean;
    logout: () => void;
    addHabit: (h: Omit<Habit, 'id' | 'completedAt' | 'streak' | 'createdAt'>) => void;
    updateHabit: (id: string, h: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    toggleHabit: (id: string, dateStr?: string) => void;
    moveHabit: (id: string, direction: 'up' | 'down') => void;
    addTask: (t: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    addTransaction: (t: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    updateHealth: (log: Partial<HealthLog>) => void;
    addReflection: (r: Omit<Reflection, 'id' | 'date'>) => void;
    updateYoutube: (data: Partial<YouTubeGrowth>) => void;
    updateSavings: (data: Partial<Savings>) => void;
    updateSettings: (data: Partial<UserSettings>) => void;
    logStudyHours: (hours: number) => void;
    addPeriod: (data: PeriodData) => void;
    deletePeriod: (startDate: string) => void;
    updateRoadmap: (data: Partial<GoalRoadmap>) => void;
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    fetchYouTubeStats: () => Promise<void>;
    addVideoPlan: (plan: Omit<VideoPlan, 'id'>) => void;
    updateVideoPlan: (id: string, plan: Partial<VideoPlan>) => void;
    deleteVideoPlan: (id: string) => void;
};

const StoreContext = createContext<StoreType | null>(null);

// Provider component
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const initialUser = (() => {
        const saved = localStorage.getItem('life-os-user');
        return safeParseJSON(saved, null) as User | null;
    })();

    const [user, setUser] = useState<User | null>(initialUser);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('life-os-auth') === 'true';
    });

    const getUserKey = (baseKey: string, specificUser?: User | null) => {
        const activeUser = specificUser !== undefined ? specificUser : user;
        return activeUser?.email ? `life-os-${activeUser.email}-${baseKey}` : `life-os-${baseKey}`;
    };

    const debounceSave = useDebounce();

    // 1. Basic Lists - Load with initialUser to avoid guest data flash
    const [habits, setHabits] = useState<Habit[]>(() => safeParseJSON(localStorage.getItem(getUserKey('habits', initialUser)), []));
    const [tasks, setTasks] = useState<Task[]>(() => safeParseJSON(localStorage.getItem(getUserKey('tasks', initialUser)), []));
    const [transactions, setTransactions] = useState<Transaction[]>(() => safeParseJSON(localStorage.getItem(getUserKey('transactions', initialUser)), []));
    const [healthLogs, setHealthLogs] = useState<HealthLog[]>(() => safeParseJSON(localStorage.getItem(getUserKey('health', initialUser)), []));
    const [reflections, setReflections] = useState<Reflection[]>(() => safeParseJSON(localStorage.getItem(getUserKey('reflections', initialUser)), []));

    // 2. Specialized State
    const [youtube, setYoutube] = useState<YouTubeGrowth>(() => safeParseJSON(localStorage.getItem(getUserKey('youtube', initialUser)), { subscribers: 0, views: 0, videosCount: 0, lastUpdated: new Date().toISOString() }));
    const [savings, setSavings] = useState<Savings>(() => safeParseJSON(localStorage.getItem(getUserKey('savings', initialUser)), { currentAmount: 0, goalAmount: 0 }));
    const [roadmap, setRoadmap] = useState<GoalRoadmap>(() => safeParseJSON(localStorage.getItem(getUserKey('roadmap', initialUser)), {
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
        monthlyFocus: {
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
        }
    }));
    const [periods, setPeriods] = useState<PeriodData[]>(() => safeParseJSON(localStorage.getItem(getUserKey('periods', initialUser)), []));
    const [settings, setSettings] = useState<UserSettings>(() => backfillSettings(safeParseJSON(localStorage.getItem(getUserKey('settings', initialUser)), getDefaultSettings())));
    const [studyHours, setStudyHours] = useState<Record<string, number>>(() => safeParseJSON(localStorage.getItem(getUserKey('study', initialUser)), {}));
    const [videoPlans, setVideoPlans] = useState<VideoPlan[]>(() => safeParseJSON(localStorage.getItem(getUserKey('videoplans', initialUser)), []));

    // Data reloading logic when user switches
    const isFirstRun = React.useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            // On initial boot, load data for the stored user
            // Actually, the initial state is already set by the useState initializers.
            // But if we want to be 100% sure we can reload here.
            return;
        }

        // When user changes, reload everything from the new user's keys
        const email = user?.email;
        const prefix = email ? `life-os-${email}-` : `life-os-`;

        setHabits(safeParseJSON(localStorage.getItem(prefix + 'habits'), []));
        setTasks(safeParseJSON(localStorage.getItem(prefix + 'tasks'), []));
        setTransactions(safeParseJSON(localStorage.getItem(prefix + 'transactions'), []));
        setHealthLogs(safeParseJSON(localStorage.getItem(prefix + 'health'), []));
        setReflections(safeParseJSON(localStorage.getItem(prefix + 'reflections'), []));
        setYoutube(safeParseJSON(localStorage.getItem(prefix + 'youtube'), { subscribers: 0, views: 0, videosCount: 0, lastUpdated: new Date().toISOString() }));
        setSavings(safeParseJSON(localStorage.getItem(prefix + 'savings'), { currentAmount: 0, goalAmount: 0 }));
        setStudyHours(safeParseJSON(localStorage.getItem(prefix + 'study'), {}));
        setVideoPlans(safeParseJSON(localStorage.getItem(prefix + 'videoplans'), []));
        setPeriods(safeParseJSON(localStorage.getItem(prefix + 'periods'), []));

        const loadedSettings = safeParseJSON(localStorage.getItem(prefix + 'settings'), getDefaultSettings());
        setSettings(backfillSettings(loadedSettings));

        // Roadmap usually has a lot of static initial data, so we merge carefully
        setRoadmap(safeParseJSON(localStorage.getItem(prefix + 'roadmap'), roadmap));

    }, [user?.email]);

    // Persistence with debouncing
    useEffect(() => {
        debounceSave(getUserKey('habits'), habits);
    }, [habits, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('tasks'), tasks);
    }, [tasks, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('transactions'), transactions);
    }, [transactions, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('health'), healthLogs);
    }, [healthLogs, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('reflections'), reflections);
    }, [reflections, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('youtube'), youtube);
    }, [youtube, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('savings'), savings);
    }, [savings, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('roadmap'), roadmap);
    }, [roadmap, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('periods'), periods);
    }, [periods, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('settings'), settings);
    }, [settings, user?.email]);

    useEffect(() => {
        debounceSave(getUserKey('study'), studyHours);
    }, [studyHours, user?.email]);

    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.theme]);

    useEffect(() => {
        debounceSave(getUserKey('videoplans'), videoPlans);
    }, [videoPlans, user?.email]);

    useEffect(() => {
        localStorage.setItem('life-os-auth', isAuthenticated.toString());
    }, [isAuthenticated]);

    useEffect(() => {
        localStorage.setItem('life-os-user', JSON.stringify(user));
    }, [user]);

    const addHabit = (h: Omit<Habit, 'id' | 'completedAt' | 'streak' | 'createdAt'>) => {
        setHabits(prev => [...prev, {
            ...h,
            id: generateId(),
            completedAt: [],
            streak: 0,
            createdAt: new Date().toISOString()
        }]);
    };

    const deleteHabit = (id: string) => setHabits(prev => prev.filter(h => h.id !== id));

    const toggleHabit = (id: string, dateStr?: string) => {
        const targetDate = dateStr || new Date().toISOString().split('T')[0];
        setHabits(prev => prev.map(h => {
            if (h.id !== id) return h;
            const isCompleted = h.completedAt.includes(targetDate);
            return {
                ...h,
                completedAt: isCompleted
                    ? h.completedAt.filter(d => d !== targetDate)
                    : [...h.completedAt, targetDate],
                // Simple streak logic (could be more complex if we check chronological order)
                streak: isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1
            };
        }));
    };

    const addTask = (t: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
        setTasks(prev => [{
            ...t,
            id: generateId(),
            completed: false,
            createdAt: new Date().toISOString()
        }, ...prev]);
    };

    const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

    const addTransaction = (t: Omit<Transaction, 'id'>) => setTransactions(p => [{ ...t, id: generateId() }, ...p]);
    const deleteTransaction = (id: string) => setTransactions(p => p.filter(t => t.id !== id));

    const updateHealth = (log: Partial<HealthLog>) => {
        const today = new Date().toISOString().split('T')[0];
        setHealthLogs(prev => {
            const existing = prev.find(l => l.date === today);
            if (existing) return prev.map(l => l.date === today ? { ...l, ...log } : l);
            return [{ id: generateId(), date: today, sleepHours: 0, hydrationCups: 0, mood: '😐', foodQuality: 3, junkFoodCount: 0, ...log }, ...prev];
        });
    };

    const addReflection = (r: Omit<Reflection, 'id' | 'date'>) => setReflections(p => [{ ...r, id: generateId(), date: new Date().toISOString() }, ...p]);

    const updateYoutube = (data: Partial<YouTubeGrowth>) => setYoutube(prev => ({ ...prev, ...data, lastUpdated: new Date().toISOString() }));
    const updateSavings = (data: Partial<Savings>) => setSavings(prev => ({ ...prev, ...data }));
    const updateSettings = (data: Partial<UserSettings>) => setSettings(prev => ({ ...prev, ...data }));
    const logStudyHours = (hours: number) => {
        const today = new Date().toISOString().split('T')[0];
        setStudyHours(prev => ({ ...prev, [today]: (prev[today] || 0) + hours }));
    };

    const updateHabit = (id: string, h: Partial<Habit>) => {
        setHabits(prev => prev.map(habit => habit.id === id ? { ...habit, ...h } : habit));
    };

    const moveHabit = (id: string, direction: 'up' | 'down') => {
        setHabits(prev => {
            const index = prev.findIndex(h => h.id === id);
            if (index === -1) return prev;
            if (direction === 'up' && index === 0) return prev;
            if (direction === 'down' && index === prev.length - 1) return prev;

            const newHabits = [...prev];
            const swapIndex = direction === 'up' ? index - 1 : index + 1;
            [newHabits[index], newHabits[swapIndex]] = [newHabits[swapIndex], newHabits[index]];
            return newHabits;
        });
    };

    const addPeriod = (data: PeriodData) => setPeriods(prev => [data, ...prev].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
    const deletePeriod = (startDate: string) => setPeriods(prev => prev.filter(p => p.startDate !== startDate));
    const updateRoadmap = (data: Partial<GoalRoadmap>) => setRoadmap(prev => ({ ...prev, ...data }));

    const addVideoPlan = (plan: Omit<VideoPlan, 'id'>) => {
        setVideoPlans(prev => [{ ...plan, id: generateId() }, ...prev]);
    };

    const updateVideoPlan = (id: string, plan: Partial<VideoPlan>) => {
        setVideoPlans(prev => prev.map(p => p.id === id ? { ...p, ...plan } : p));
    };

    const deleteVideoPlan = (id: string) => {
        setVideoPlans(prev => prev.filter(p => p.id !== id));
    };

    const login = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
        // Sync name to settings if it's the first login
        setSettings(s => ({ ...s, name: userData.name || s.name }));
        return true;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    const fetchYouTubeStats = async () => {
        const apiKey = settings.youtubeApiKey || import.meta.env.VITE_YOUTUBE_API_KEY;
        const channelId = settings.youtubeChannelId || import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

        if (!apiKey || !channelId) {
            console.warn("YouTube credentials missing");
            return;
        }

        try {
            // 1. Fetch Channel Statistics & Upload Playlist ID
            const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${channelId}&key=${apiKey}`);
            const channelData = await channelRes.json();

            let recentVideos: any[] = [];
            let stats = { subscriberCount: '0', viewCount: '0', videoCount: '0' };

            if (channelData.items && channelData.items.length > 0) {
                const item = channelData.items[0];
                stats = item.statistics;
                const uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;

                // 2. Fetch Recent Uploads from the Upload Playlist
                if (uploadsPlaylistId) {
                    const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10&key=${apiKey}`);
                    const videosData = await videosRes.json();

                    if (videosData.items) {
                        // Get video IDs to fetch detailed stats
                        const videoIds = videosData.items.map((v: any) => v.snippet.resourceId.videoId).join(',');

                        // Explicitly fetch snippet,statistics,contentDetails to ensure we cover everything
                        const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`);
                        const statsData = await statsRes.json();

                        const statsMap = new Map(statsData.items?.map((v: any) => [v.id, v]) || []);

                        console.log("YouTube API Debug - Raw Stats:", statsData);

                        recentVideos = videosData.items.map((v: any) => {
                            const videoId = v.snippet.resourceId.videoId;
                            const details: any = statsMap.get(videoId) || {};
                            const vidStats = details.statistics || {};

                            // Parse duration (PT4M13S format) to human readable if needed, for now keep simple or mock
                            return {
                                id: videoId,
                                title: v.snippet.title,
                                thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
                                publishedAt: v.snippet.publishedAt.split('T')[0],
                                viewCount: vidStats.viewCount || '0',
                                likeCount: vidStats.likeCount || '0',
                                commentCount: vidStats.commentCount || '0',
                                duration: details.contentDetails?.duration || ''
                            };
                        });
                    }
                }
            } else {
                console.error("No YouTube channel found", channelData);
            }

            setYoutube(prev => ({
                ...prev,
                subscribers: parseInt(stats.subscriberCount, 10),
                views: parseInt(stats.viewCount, 10),
                videosCount: parseInt(stats.videoCount, 10),
                lastUpdated: new Date().toISOString(),
                recentVideos
            }));

        } catch (error) {
            console.error("Failed to fetch YouTube stats:", error);
        }
    };

    const store: StoreType = {
        habits, tasks, transactions, healthLogs, reflections,
        youtube, savings, roadmap, periods, settings, studyHours,
        addHabit, updateHabit, deleteHabit, toggleHabit, moveHabit, addTask, toggleTask, deleteTask,
        addTransaction, deleteTransaction, updateHealth,
        addReflection, updateYoutube, updateSavings, updateSettings, logStudyHours,
        addPeriod, deletePeriod, updateRoadmap,
        setHabits, setTasks, fetchYouTubeStats,
        videoPlans, addVideoPlan, updateVideoPlan, deleteVideoPlan,
        isAuthenticated, user, login, logout
    };

    return React.createElement(
        StoreContext.Provider,
        { value: store },
        children
    );
};

// Hook to use the store
export const useStore = () => {
    const store = useContext(StoreContext);
    if (!store) {
        throw new Error('useStore must be used within StoreProvider');
    }
    return store;
};
