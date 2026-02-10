import { getSupabaseClient } from "@/lib/supabase-client";

export interface LeaderboardInput {
  level?: string;
  keyboard?: string;
  language?: string;
}

export interface LeaderboardScore {
  username: string;
  time: number;
  correct: number;
  incorrect: number;
  datetime: string;
  cpm: number;
  level: string;
  keyboard: string;
}

export async function getLeaderboard(input: LeaderboardInput): Promise<LeaderboardScore[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('leaderboard_scores')
    .select('*')
    .order('cpm', { ascending: false })
    .limit(50);

  if (input.level) {
    query = query.eq('level', input.level);
  }
  if (input.keyboard) {
    query = query.eq('keyboard', input.keyboard);
  }
  if (input.language) {
    query = query.eq('language', input.language);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

// Legacy GraphQL query format - kept for reference during migration
// export const GET_LEADERBOARD = gql`
//   query($leaderboard: InputLeaderboard!) {
//     leaderboards(leaderboard: $leaderboard) {
//       username
//       time
//       correct
//       incorrect
//       datetime
//     }
//   }
// `;
