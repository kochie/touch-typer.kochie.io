import { getSupabaseClient } from "@/lib/supabase-client";
import type { Settings } from "./getSettings";

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Convert from camelCase to snake_case database columns
  const updateData: Record<string, any> = {};
  
  if (settings.language !== undefined) updateData.language = settings.language;
  if (settings.analytics !== undefined) updateData.analytics = settings.analytics;
  if (settings.levelName !== undefined) updateData.level_name = settings.levelName;
  if (settings.keyboardName !== undefined) updateData.keyboard_name = settings.keyboardName;
  if (settings.whatsNewOnStartup !== undefined) updateData.whats_new_on_startup = settings.whatsNewOnStartup;
  if (settings.theme !== undefined) updateData.theme = settings.theme;
  if (settings.publishToLeaderboard !== undefined) updateData.publish_to_leaderboard = settings.publishToLeaderboard;
  if (settings.blinker !== undefined) updateData.blinker = settings.blinker;
  if (settings.punctuation !== undefined) updateData.punctuation = settings.punctuation;
  if (settings.numbers !== undefined) updateData.numbers = settings.numbers;
  if (settings.capital !== undefined) updateData.capital = settings.capital;

  const { data, error } = await supabase
    .from('settings')
    .upsert({
      user_id: user.id,
      ...updateData,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Convert back to camelCase
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
