export interface Habit {
    id: string;
    name: string;
    category: string;
    frequency: 'daily' | 'weekly';
    priority: 'low' | 'medium' | 'high' | 'optional';
    streak: number;
    completedAt: string[]; // ISO dates of completion
    icon: string;
    createdAt: string;
}

export interface Task {
    id: string;
    name: string;
    time: string;
    priority: 'low' | 'medium' | 'high' | 'optional';
    completed: boolean;
    category: string;
    createdAt: string;
}

export interface Transaction {
    id: string;
    name: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    icon: string;
    isWaste?: boolean;
}

export interface YouTubeGrowth {
    subscribers: number;
    views: number;
    videosCount: number;
    lastUpdated: string;
    recentVideos?: {
        id: string;
        title: string;
        thumbnail: string;
        publishedAt: string;
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
    }[];
}

export interface Savings {
    currentAmount: number;
    goalAmount: number;
}

export interface Milestone {
    id: string;
    title: string;
    dueDate: string;
    status: 'pending' | 'completed';
}

export interface GoalRoadmap {
    mainGoal: string;
    year: number;
    milestones: Milestone[];
    monthlyFocus: Record<string, string>; // month name -> focus
}

export interface HealthLog {
    id: string;
    date: string;
    sleepHours: number;
    hydrationCups: number;
    mood: string;
    foodQuality: number; // 1-5
    junkFoodCount: number;
    weight?: number;
    calories?: number;
    protein?: number;
    foodLogContent?: string;
}

export interface PeriodData {
    startDate: string;
    endDate?: string;
    intensity: 'light' | 'medium' | 'heavy';
}

export interface UserSettings {
    name: string;
    profileImage?: string;
    notificationsEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    youtubeApiKey?: string;
    youtubeChannelId?: string;
    openaiApiKey?: string;
    monthlyBudget?: number;
    age?: number;
    height?: number;
    targetWeight?: number;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    dietaryPreference?: string;
    weightUnit?: 'kg' | 'lbs';
    hydrationGoalLiters?: number;
    sleepGoalHours?: number;
}

export interface Reflection {
    id: string;
    date: string;
    thought: string;
    tags: string[];
}

export interface VideoPlan {
    id: string;
    title: string;
    category: string;
    targetAudience: string;
    publishDate: string;
    checklist: { id: string; text: string; completed: boolean }[];
    notes: string;
    goals: { views: number; ctr: number; watchTime: number };
    status: 'draft' | 'scheduled' | 'published';
}

export interface StoreState {
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
}

export interface User {
    email: string;
    name: string;
    picture?: string;
}
