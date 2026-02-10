"use client";

import { getLeaderboard, type LeaderboardScore } from "@/transactions/getLeaderboard";
import { toast } from "react-toastify";
import { Notification } from "../Notification";
import { Duration } from "luxon";
import { useEffect, useState } from "react";

export interface LeaderboardSectionProps {
  keyboard: string;
  language: string;
  level: string;
}

export default function LeaderboardSection({
  keyboard,
  language,
  level,
}: LeaderboardSectionProps) {
  const [scores, setScores] = useState<LeaderboardScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const data = await getLeaderboard({
          keyboard,
          language,
          level,
        });
        setScores(data);
      } catch (err) {
        setError(err as Error);
        toast(Notification, {
          data: {
            title: "Error",
            message: (err as Error).message,
            type: "error",
          },
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [keyboard, language, level]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">Failed to load leaderboard</p>;
  }

  if (scores.length === 0) {
    return <p className="text-gray-500">No scores yet. Be the first!</p>;
  }

  return (
    <ul role="list" className="divide-y divide-gray-100">
      {scores.map((score) => (
        <li
          key={`${score.username}-${score.datetime}`}
          className="flex justify-between gap-x-6 py-5"
        >
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {score.username}
              </p>
              <time
                className="mt-1 text-xs leading-5 text-gray-500"
                dateTime={score.datetime}
              >
                {new Date(score.datetime).toLocaleString()}
              </time>
            </div>
          </div>
          <div className="shrink-0 flex gap-6 items-center">
            <div className="">
              <p className="flex gap-1 truncate text-xs leading-5 text-gray-500">
                <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  Correct: {score.correct}
                </span>
                <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                  Incorrect: {score.incorrect}
                </span>
                <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                  CPM: {score.cpm?.toFixed(2) || ((score.correct + score.incorrect) / score.time * 60000).toFixed(2)}
                </span>
              </p>
            </div>

            <div className="">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {Duration.fromMillis(score.time)
                  .rescale()
                  .toFormat("m:s.SSS")}
              </p>
              <p className="text-xs leading-2 text-gray-900">
                {(
                  score.correct /
                  (score.incorrect + score.correct)
                ).toLocaleString("en-US", {
                  style: "percent",
                  minimumFractionDigits: 3,
                })}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
