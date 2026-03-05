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

// ─── Upsert user data ─────────────────────────────────────────────────────────
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

// ─── Realtime subscription ─────────────────────────────────────────────────────
export const subscribeToUserData = (
    email: string,
    onUpdate: (data: CloudUserData) => void
) => {
    if (!supabase) return null;
    const channel = supabase
        .channel(`user-data-${email.toLowerCase()}`)
        .on(
            'postgres_changes' as any,
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'user_data',
                filter: `email=eq.${email.toLowerCase()}`,
            },
            (payload: any) => {
                console.log('[Supabase Realtime] update received');
                onUpdate(payload.new as CloudUserData);
            }
        )
        .subscribe((status: string) => {
            console.log('[Supabase Realtime] status:', status);
        });
    return channel;
};

