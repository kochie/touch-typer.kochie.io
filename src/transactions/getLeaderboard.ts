import { gql } from "@apollo/client";

export const GET_LEADERBOARD = gql`
  query($leaderboard: InputLeaderboard!) {
    leaderboards(leaderboard: $leaderboard) {
      username
      time
      correct
      incorrect
      datetime
    }
  }
`;
