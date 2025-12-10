import { supabase } from "./client";
import { Machine } from "../../types/supabase";

/**
 * Time window used for fake stats
 * (keep consistent with charts)
 */
const START_DATE = "2020-09-01 00:00:00";
const END_DATE = "2020-09-30 23:59:59";
const INTERVAL = "hour";

/**
 * Fetch all fake machines
 */
export const fetchFakeMachines = async (): Promise<Machine[]> => {
  // 1️ load fake machines
  const { data: machines, error } = await supabase
    .from("fake_machines")
    .select("*")
    .order("machine_id");

  if (error) {
    throw new Error(`Error fetching fake machines: ${error.message}`);
  }

  if (!machines) return [];

  // 2️ fetch stats for each machine (parallel)
  const results = await Promise.all(
    machines.map(async (m) => {
      const { data, error } = await supabase.rpc(
        "get_fake_monitoring_intervals",
        {
          board_input: m.board,
          port_input: m.port,
          start_date: START_DATE,
          end_date: END_DATE,
          interval_input: INTERVAL,
        }
      );

      if (error) {
        console.error(
          `[fake machine stats failed] board=${m.board} port=${m.port}`,
          error
        );
        return null;
      }

      let totalShots = 0;
      let weightedShotTime = 0;

      for (const row of data ?? []) {
        totalShots += row.total_shots;
        weightedShotTime +=
          (row.average_shot_time ?? 0) * row.total_shots;
      }

      return {
        machine_id: m.machine_id,
        machine_name: `${m.machine_name}`,
        board: m.board,
        port: m.port,
        status: "Actief", // fake default
        total_shots: totalShots,
        avg_shot_time:
          totalShots > 0 ? weightedShotTime / totalShots : 0,
        last_update: END_DATE,
      } satisfies Machine;
    })
  );

  return results.filter(Boolean) as Machine[];
};

/**
 * Fetch single fake machine
 */
export const fetchFakeMachine = async (
  machine_id: string
): Promise<Machine> => {
  const { data: machine, error } = await supabase
    .from("fake_machines")
    .select("*")
    .eq("machine_id", machine_id)
    .single();

  if (error) {
    throw new Error(`Error fetching fake machine: ${error.message}`);
  }

  const { data: stats } = await supabase.rpc(
    "get_fake_monitoring_intervals",
    {
      board_input: machine.board,
      port_input: machine.port,
      start_date: START_DATE,
      end_date: END_DATE,
      interval_input: INTERVAL,
    }
  );

  let totalShots = 0;
  let weightedShotTime = 0;

  for (const row of stats ?? []) {
    totalShots += row.total_shots;
    weightedShotTime +=
      (row.average_shot_time ?? 0) * row.total_shots;
  }

  return {
    machine_id: machine.machine_id,
    machine_name: `Machine ${machine.machine_id}`,
    board: machine.board,
    port: machine.port,
    status: "Actief",
    total_shots: totalShots,
    avg_shot_time:
      totalShots > 0 ? weightedShotTime / totalShots : 0,
    last_update: END_DATE,
  };
};
