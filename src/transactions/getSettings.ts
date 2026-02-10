import { getSupabaseClient } from "@/lib/supabase-client";

export interface Settings {
  language: string;
  analytics: boolean;
  levelName: string;
  keyboardName: string;
  whatsNewOnStartup: boolean;
  theme: string;
  publishToLeaderboard: boolean;
  blinker: boolean;
  punctuation: boolean;
  numbers: boolean;
  capital: boolean;
}

export async function getSettings(): Promise<Settings | null> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    return null;
  }

  // Convert from snake_case database columns to camelCase
  return {
    language: data.language || 'en',
    analytics: data.analytics ?? true,
    levelName: data.level_name || '1',
    keyboardName: data.keyboard_name || 'MACOS_US_QWERTY',
    whatsNewOnStartup: data.whats_new_on_startup ?? true,
    theme: data.theme || 'system',
    publishToLeaderboard: data.publish_to_leaderboard ?? true,
    blinker: data.blinker ?? true,
    punctuation: data.punctuation ?? false,
    numbers: data.numbers ?? false,
    capital: data.capital ?? false,
  };
}
