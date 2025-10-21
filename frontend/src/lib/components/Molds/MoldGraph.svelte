<script>
  import { onMount, tick } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { Chart, registerables } from "chart.js";
  import "chartjs-adapter-date-fns";
  Chart.register(...registerables);

  export let moldId;

  let canvas;
  let chart;
  let loading = true;
  let error = null;
  let shots = [];

  async function fetchMoldData() {
    try {
      const { data, error } = await supabase.rpc(
        "get_mold_shot_totals_cached",
        { p_mold_id: moldId }
      );
      if (error) throw error;
      return data ?? [];
    } catch (e) {
      console.error("RPC error:", e);
      throw e;
    }
  }

  function buildChart() {
    if (!canvas || !shots?.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Group data by machine
    const grouped = {};
    for (const s of shots) {
      const m = s.machine;
      if (!grouped[m]) grouped[m] = [];
      grouped[m].push({
        x: new Date(s.timestamp_used), // week_start from your cache
        y: Number(s.total_shots),
      });
    }

    const datasets = Object.entries(grouped).map(([machine, arr]) => ({
      label: machine,
      data: arr.sort((a, b) => a.x - b.x),
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 3,
      fill: false,
    }));

    if (chart) chart.destroy();

    // Build the new chart
    chart = new Chart(ctx, {
      type: "bar",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: "easeOutCubic" },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "week",
              displayFormats: { week: "'Week' w, yyyy" },
            },
            title: { display: true, text: "Week" },
            grid: { color: "#f3f4f6" },
            ticks: { color: "#6b7280" },
          },
          y: {
            title: { display: true, text: "Total Shots" },
            grid: { color: "#f3f4f6" },
            ticks: { color: "#6b7280" },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: { position: "bottom", labels: { color: "#374151" } },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              title: (items) =>
                new Date(items[0].parsed.x).toLocaleDateString(),
              label: (ctx) =>
                `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} shots`,
            },
          },
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
      },
    });
  }

  async function reloadData() {
    loading = true;
    error = null;
    try {
      const data = await fetchMoldData();
      shots = data;
      await tick();
      buildChart();
    } catch (e) {
      error = e.message ?? "Failed to load data";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    console.log("Loading cached mold data for", moldId);
    reloadData();
  });
</script>

<div class="relative">
  <div class="h-[320px] w-full relative overflow-hidden">
    <canvas bind:this={canvas}></canvas>

    {#if loading}
      <div class="absolute inset-0 flex justify-center items-center bg-white/80 z-10">
        <div class="animate-spin h-8 w-8 border-t-2 border-orange-500 rounded-full"></div>
        <p class="ml-3 text-gray-500 text-sm">Loading data...</p>
      </div>
    {:else if error}
      <div class="absolute inset-0 flex justify-center items-center bg-red-50 z-10">
        <p class="text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">
          {error}
        </p>
      </div>
    {:else if shots.length === 0}
      <div class="absolute inset-0 flex justify-center items-center bg-white/70 z-10">
        <p class="text-gray-500 italic">No data available for this mold.</p>
      </div>
    {/if}
  </div>

  <p class="mt-3 text-sm text-gray-500 italic text-center">
    Showing total shots per <strong>week</strong> (cached)
  </p>
</div>
