<script>
	import { onMount, tick } from "svelte";
	import { supabase } from "$lib/supabaseClient";
	import { Chart, registerables } from "chart.js";
	import "chartjs-adapter-date-fns";
	Chart.register(...registerables);

	export let board;
	export let port;

	let canvas;
	let chart;
	let loading = true;
	let error = null;
	let shots = [];
	let interval = "hour";
	const simulatedNow = new Date("2020-09-30T23:59:59Z");

	// Fetch RPC with timeout + auto retry
	async function fetchAggregatedData() {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000); // 10s

		try {
			const params = {
				p_start: new Date("2020-09-01T00:00:00Z").toISOString(),
				p_end: simulatedNow.toISOString(),
				p_interval: interval,
				p_board: Number(board),
				p_port: Number(port)
			};

			console.log("▶️ RPC params:", params);
			const { data, error } = await supabase.rpc("get_shot_time_avg", params, {
				signal: controller.signal
			});
			if (error) throw error;
			console.log("✅ RPC returned", data?.length ?? 0, "rows");
			return data ?? [];
		} catch (err) {
			if (err.name === "AbortError") {
				throw new Error("⏱️ Query timed out");
			}
			throw err;
		} finally {
			clearTimeout(timeout);
		}
	}

	function downsample(arr, maxPoints = 1500) {
		if (arr.length <= maxPoints) return arr;
		const step = Math.ceil(arr.length / maxPoints);
		return arr.filter((_, i) => i % step === 0);
	}

	function buildChart() {
		if (!canvas || !shots?.length) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const sample = shots[0];
		const timeKey = "time_ts" in sample ? "time_ts" : "timestamp_used";
		const machineKey = "machine" in sample ? "machine" : "name";
		const avgKey = "avg_value" in sample ? "avg_value" : "avg";

		const grouped = {};
		for (const s of shots) {
			const machine = s[machineKey];
			const t = new Date(s[timeKey]);
			const val = Number(s[avgKey]);
			if (!grouped[machine]) grouped[machine] = [];
			grouped[machine].push({ x: t, y: val });
		}

		const datasets = Object.entries(grouped).map(([machine, arr]) => ({
			label: machine,
			data: downsample(arr.sort((a, b) => a.x - b.x)),
			borderColor: "#f97316",
			borderWidth: 2,
			pointRadius: 0,
			tension: 0.35,
			fill: false,
			cubicInterpolationMode: "monotone"
		}));

		if (chart) chart.destroy();

		chart = new Chart(ctx, {
			type: "line",
			data: { datasets },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: { duration: 800, easing: "easeOutCubic" },
				scales: {
					x: {
						type: "time",
						time: {
							unit:
								interval === "5min" || interval === "15min"
									? "minute"
									: interval,
							displayFormats: {
								minute: "MMM d HH:mm",
								hour: "MMM d HH:00",
								day: "MMM d"
							}
						},
						grid: { color: "#f3f4f6" },
						ticks: { color: "#6b7280" },
						title: { display: true, text: "Time", color: "#374151" }
					},
					y: {
						grid: { color: "#f3f4f6" },
						ticks: { color: "#6b7280" },
						title: {
							display: true,
							text: "Avg Shot Time (s)",
							color: "#374151"
						}
					}
				},
				plugins: {
					legend: {
						display: false,
						position: "bottom",
						labels: { color: "#374151" }
					},
					tooltip: {
						mode: "index",
						intersect: false,
						backgroundColor: "rgba(17,17,17,0.85)",
						callbacks: {
							title: (items) =>
								new Date(items[0].parsed.x).toLocaleString(),
							label: (ctx) =>
								`${ctx.dataset.label}: ${ctx.parsed.y.toFixed(3)} s`
						}
					}
				},
				interaction: { mode: "nearest", axis: "x", intersect: false }
			}
		});
	}

	async function rebuildChart(retryCount = 0) {
		loading = true;
		error = null;
		try {
			const raw = await fetchAggregatedData();
			let data = Array.isArray(raw) ? raw : raw.data ?? [];
			shots = data;
			if (shots.length > 3000) {
				console.warn("⚠️ Too many rows, downsampling client-side");
				const step = Math.ceil(shots.length / 1500);
				shots = shots.filter((_, i) => i % step === 0);
			}
			await tick();
			buildChart();
		} catch (e) {
			error = e.message ?? String(e);
			console.error("❌ rebuildChart error:", e);
			if (e.message.includes("timed out") && retryCount < 3) {
				const delay = 4000 * (retryCount + 1);
				console.warn(`⏳ Timeout. Retrying in ${delay / 1000}s...`);
				setTimeout(() => rebuildChart(retryCount + 1), delay);
			}
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		if (board == null || port == null) {
			error = "Missing board or port";
			loading = false;
			return;
		}
		await rebuildChart();
	});
</script>

<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-2 relative">
	<div class="h-[320px] w-full relative overflow-hidden">
		<canvas bind:this={canvas}></canvas>

		{#if loading}
			<div class="absolute inset-0 flex flex-col justify-center items-center bg-white/80 backdrop-blur-sm z-10">
				<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
				<p class="text-gray-500 text-sm mt-2">
					{error?.includes("timed") ? "Retrying..." : "Loading data..."}
				</p>
			</div>
		{:else if error}
			<div class="absolute inset-0 flex justify-center items-center bg-red-50 z-10">
				<p class="text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">
					{error}
				</p>
			</div>
		{:else if shots.length === 0}
			<div class="absolute inset-0 flex justify-center items-center bg-white/70 z-10">
				<p class="text-gray-500 italic text-center py-10">
					No data available for this board/port/time range.
				</p>
			</div>
		{/if}
	</div>

	<div class="flex justify-between items-center mt-3">
		<label class="text-sm text-gray-600 font-medium">
			Time scale:
			<select
				bind:value={interval}
				on:change={rebuildChart}
				class="ml-2 text-sm border-gray-300 rounded-md px-2 py-1 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
			>
				<option value="5min">Per 5 Minutes</option>
				<option value="15min">Per 15 Minutes</option>
				<option value="hour">Per Hour ⚡</option>
				<option value="day">Per Day ⚡</option>
			</select>
		</label>
		<p class="text-xs text-gray-400">Loaded {shots.length} rows</p>
	</div>
</div>

<style>
	canvas {
		width: 100% !important;
		height: 100% !important;
		opacity: 1 !important;
	}
</style>
