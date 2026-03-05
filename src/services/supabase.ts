import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

export const isSupabaseEnabled = !!(supabaseUrl && supabaseAnonKey);

// ─── Types ────────────────────────────────────────────────────────────────────
export type CloudUserData = {
    email: string;
    habits: unknown;
    tasks: unknown;
    transactions: unknown;
    health_logs: unknown;
    reflections: unknown;
    youtube: unknown;
    savings: unknown;
    roadmap: unknown;
    periods: unknown;
    settings: unknown;
    study_hours: unknown;
    video_plans: unknown;
    updated_at: string;
};

// ─── Fetch all data for a user ────────────────────────────────────────────────
export const fetchUserData = async (email: string): Promise<CloudUserData | null> => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
            .from('user_data')
            .select('*')
            .eq('email', email.toLowerCase())
            .maybeSingle();
        if (error) {
            console.error('[Supabase] fetch error:', error.message);
            return null;
        }
        return data as CloudUserData | null;
    } catch (e) {
        console.error('[Supabase] fetch exception:', e);
        return null;
    }
};

// ─── Save/update data for a user ──────────────────────────────────────────────
export const upsertUserData = async (
    email: string,
    updates: Partial<Omit<CloudUserData, 'email' | 'updated_at'>>
): Promise<void> => {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('user_data').upsert(
            { email: email.toLowerCase(), ...updates, updated_at: new Date().toISOString() },
            { onConflict: 'email' }
        );
        if (error) console.error('[Supabase] upsert error:', error.message);
    } catch (e) {
        console.error('[Supabase] upsert exception:', e);
    }
};
