// src/routes/+page.server.js
import { supabase } from '$lib/supabaseClient';

export async function load() {
  // Fetch from your existing RPCs
  const [machinesRes, activeMoldsRes, historyRes] = await Promise.all([
    supabase.rpc('get_machine_activity_status'),
    supabase.rpc('get_molds_on_machine'),
    supabase.rpc('get_mold_machine_history'),
  ]);

  // Handle errors safely
  if (machinesRes.error || activeMoldsRes.error || historyRes.error) {
    console.error('Supabase errors:', machinesRes.error || activeMoldsRes.error || historyRes.error);
    return {
      stats: {
        totalMachines: 0,
        activeMachines: 0,
        inactiveMachines: 0,
        totalMolds: 0,
        activeMolds: 0,
        inactiveMolds: 0,
        bestMachine: { name: 'No data', uptime: 0, cycles: 0 },
        topMold: { name: 'No data', uses: 0 },
      },
    };
  }

  const machines = machinesRes.data ?? [];
  const activeMolds = activeMoldsRes.data ?? [];
  const history = historyRes.data ?? [];

  // MACHINE COUNTS
  const totalMachines = machines.length;
  const activeMachines = machines.filter((m) => m.is_active === 'active').length;
  const inactiveMachines = totalMachines - activeMachines;

  // MOLD COUNTS
  const uniqueMoldIds = [...new Set(history.map((h) => h.mold_id))];
  const totalMolds = uniqueMoldIds.length;
  const activeMoldsCount = activeMolds.length;
  const inactiveMolds = totalMolds - activeMoldsCount;

  // BEST MACHINE (most linked in history)
  const machineCounts = history.reduce((acc, h) => {
    acc[h.machine] = (acc[h.machine] || 0) + 1;
    return acc;
  }, {});
  const bestMachineName = Object.entries(machineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No data';

  // MOST USED MOLD (most linked in history)
  const moldCounts = history.reduce((acc, h) => {
    acc[h.mold_name] = (acc[h.mold_name] || 0) + 1;
    return acc;
  }, {});
  const topMoldName = Object.entries(moldCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No data';

  return {
    stats: {
      totalMachines,
      activeMachines,
      inactiveMachines,
      totalMolds,
      activeMolds: activeMoldsCount,
      inactiveMolds,
      bestMachine: { name: bestMachineName, uptime: 0, cycles: machineCounts[bestMachineName] ?? 0 },
      topMold: { name: topMoldName, uses: moldCounts[topMoldName] ?? 0 },
    },
  };
}
