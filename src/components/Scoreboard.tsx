import supabase from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScoreboardProps = {
  isAdmin?: boolean;
  hideAdmin?: string;
};

export default function Scoreboard({
  isAdmin = false,
  hideAdmin = "false",
}: ScoreboardProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [frozenTime, setFrozenTime] = useState<Date>(new Date());

  async function updateFrozenState() {
    const { error } = await supabase
      .from("zest_state")
      .update({ value: !isFrozen, time_updated: new Date() })
      .eq("state", "freeze")
      .select();
    setIsFrozen((prev) => !prev);
    if (error) {
      console.log(error);
      return;
    }
  }
  async function getFrozenState() {
    const { data, error } = await supabase
      .from("zest_state")
      .select()
      .eq("state", "freeze");
    if (error) {
      console.log(error);
      return;
    }
    if (data.length) {
      setIsFrozen(data[0].value == "true");
      setFrozenTime(data[0].time_updated);
    }
  }

  useEffect(() => {
    getFrozenState();
  }, []);

  useEffect(() => {
    if (!frozenTime) {
      return;
    }
    console.log(frozenTime, "HI");

    getLeaderboard();
  }, [frozenTime]);

  async function getTeamName() {
    const { data, error } = await supabase
      .from("zo_camp_25_team")
      .select("*")
      .order("team_name", { ascending: true });
    if (error) {
      console.log(error);
      return;
    }
    return data;
  }

  async function getLeaderboard() {
    let teamName = await getTeamName();
    if (!teamName) {
      return "ERROR";
    }
    const { data, error } = await supabase.from("zo_camp_25_score").select();
    if (error) {
      console.log(error);
      return error;
    }
    let scoreData = [...data];
    console.log(scoreData, "hi");
    if (isFrozen) {
      scoreData = scoreData.filter((e) => {
        return new Date(e.created_at) <= new Date(frozenTime);
      });
      console.log("FROZEN");
      console.log(scoreData, frozenTime);
    }
    for (const score of scoreData) {
      const team = teamName.find((e) => e.id === score.team_id);

      if (!team) continue;

      team.score = (team.score || 0) + (score.score || 0);
    }

    console.log(teamName);
    let newData = teamName.map((e) => {
      if (!("score" in e)) {
        e.score = 0;
      }
      return e;
    });
    newData.sort((a, b) => b.score - a.score);
    setLeaderboard(newData);
  }

  useEffect(() => {
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zo_camp_25_score" },
        async (payload) => {
          console.log("Score change received!", payload);
          await getLeaderboard();
        }
      )
      .subscribe();
    console.log("HELLO");
    getLeaderboard();

    // Clean up to avoid duplicate subscriptions
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      {isAdmin && (
        <div
          className={cn(
            "fixed bottom-3 right-3",
            hideAdmin == "false" ? "opacity-100" : "opacity-0"
          )}
        >
          <Button onClick={() => updateFrozenState()}>
            {isFrozen ? "Unfreeze" : "Freeze"} Leaderboard
          </Button>
        </div>
      )}
      <div className="h-fit">
        <h1 className="text-3xl text-center flex flex-col gap-2 font-bold pt-2">
          <span>Z+O Camp 2025</span>
        </h1>
        <div className="text-center italic text-sm h-[20px]">
          <span>{isFrozen ? "Leaderboard Frozen" : ""}</span>
        </div>
      </div>
      <div className="flex flex-col items-center w-full gap-6 mt-6 px-4">
        {leaderboard.map((team, idx) => {
          // Determine border color based on rank

          return (
            <div
              key={team.team_name}
              className={`w-full max-w-md flex items-center justify-between px-4 py-3 rounded-xl`}
              style={{ backgroundColor: team.color }}
            >
              {/* Rank Badge */}
              <div className="w-10 h-10 rounded-full bg-black bg-opacity-30 text-white flex items-center justify-center font-bold">
                {idx + 1}
              </div>

              {/* Team Name */}
              <span className="font-semibold text-black text-lg truncate">
                {team.team_name}
              </span>

              {/* Score */}
              <span className="text-black font-bold text-lg">{team.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
