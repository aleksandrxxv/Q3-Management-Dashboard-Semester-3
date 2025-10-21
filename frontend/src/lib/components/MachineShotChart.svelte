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
	const simulatedNow = new Date("2020-10-30T23:59:59Z");

	// Fixed display window: full September 2020
	const startOfMonth = new Date("2020-09-01T00:00:00Z");
	const endOfMonth = new Date("2020-09-30T23:59:59Z");

	// -----------------------------
	// HYBRID FETCH: chunked for fine intervals, single query for coarse
	// -----------------------------
	function getChunkHours() {
		if (interval === "5min") return 32; // small chunks
		if (interval === "15min") return 48;
		return null; // no chunking for hour/day
	}

	async function fetchHybridData() {
		const chunkHours = getChunkHours();
		if (!chunkHours) {
			// Fast single RPC for hour/day
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 10000);
			try {
				const params = {
					p_start: startOfMonth.toISOString(),
					p_end: simulatedNow.toISOString(),
					p_interval: interval,
					p_board: Number(board),
					p_port: Number(port)
				};
				const { data, error } = await supabase.rpc("get_shot_time_avg", params, {
					signal: controller.signal
				});
				if (error) throw error;
				return data ?? [];
			} finally {
				clearTimeout(timeout);
			}
		}

		// Chunked for fine intervals
		let allData = [];
		let cursor = new Date(startOfMonth);
		let chunkIndex = 0;

		while (cursor < endOfMonth) {
			const next = new Date(cursor.getTime() + chunkHours * 3600 * 1000);
			const rangeEnd = next > endOfMonth ? endOfMonth : next;

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 8000);

			try {
				const params = {
					p_start: cursor.toISOString(),
					p_end: rangeEnd.toISOString(),
					p_interval: interval,
					p_board: Number(board),
					p_port: Number(port)
				};

				console.log(`⏳ Chunk ${++chunkIndex}: ${params.p_start} → ${params.p_end}`);

				const { data, error } = await supabase.rpc("get_shot_time_avg", params, {
					signal: controller.signal
				});

				if (error) throw error;
				if (data?.length) allData.push(...data);
			} catch (err) {
				console.warn("Chunk failed:", err.message);
			} finally {
				clearTimeout(timeout);
			}

			cursor = rangeEnd;
			await tick();
		}

		console.log(`Loaded ${allData.length} rows in ${chunkIndex} chunks`);
		return allData;
	}

	// -----------------------------
	// Utility functions
	// -----------------------------
	function downsample(arr, maxPoints = 1500) {
		if (arr.length <= maxPoints) return arr;
		const step = Math.ceil(arr.length / maxPoints);
		return arr.filter((_, i) => i % step === 0);
	}

	function detectGaps(data) {
		if (!data?.length) return [];
		let thresholdMinutes;
		if (interval === "5min") thresholdMinutes = 15;
		else if (interval === "15min") thresholdMinutes = 16;
		else if (interval === "hour") thresholdMinutes = 61;
		else thresholdMinutes = 24 * 60 * 2;

		const sorted = [...data].sort(
			(a, b) =>
				new Date(a.time_ts || a.timestamp_used) - new Date(b.time_ts || b.timestamp_used)
		);

		const ranges = [];
		const first = new Date(sorted[0].time_ts || sorted[0].timestamp_used);
		if (first - startOfMonth > thresholdMinutes * 60 * 1000 * 1.5)
			ranges.push({ start: startOfMonth, end: first });

		for (let i = 1; i < sorted.length; i++) {
			const prev = new Date(sorted[i - 1].time_ts || sorted[i - 1].timestamp_used);
			const curr = new Date(sorted[i].time_ts || sorted[i].timestamp_used);
			const diffMinutes = (curr - prev) / (1000 * 60);
			if (diffMinutes > thresholdMinutes) ranges.push({ start: prev, end: curr });
		}

		const last = new Date(sorted[sorted.length - 1].time_ts || sorted[sorted.length - 1].timestamp_used);
		if (endOfMonth - last > thresholdMinutes * 60 * 1000 * 1.5)
			ranges.push({ start: last, end: endOfMonth });

		// Merge overlapping
		const merged = [];
		for (const range of ranges.sort((a, b) => a.start - b.start)) {
			if (!merged.length) merged.push(range);
			else {
				const last = merged[merged.length - 1];
				if (range.start <= last.end) last.end = new Date(Math.max(last.end, range.end));
				else merged.push(range);
			}
		}
		return merged;
	}

	const gapHighlightPlugin = {
		id: "gapHighlight",
		beforeDraw(chart) {
			const { ctx, chartArea, scales } = chart;
			if (!chart.data.gaps?.length) return;

			ctx.save();
			for (const gap of chart.data.gaps) {
				const x1 = scales.x.getPixelForValue(gap.start);
				const x2 = scales.x.getPixelForValue(gap.end);
				const width = x2 - x1;
				ctx.fillStyle = "rgba(255, 0, 0, 0.07)";
				ctx.fillRect(x1, chartArea.top, width, chartArea.bottom - chartArea.top);
			}
			ctx.restore();
		}
	};

	// -----------------------------
	// Chart builder
	// -----------------------------
	function buildChart() {
		let simulated = false;
		if (!shots.length) {
			const zeroLine = [];
			let cursor = new Date(startOfMonth);
			while (cursor <= endOfMonth) {
				zeroLine.push({ x: new Date(cursor), y: 0 });
				cursor.setDate(cursor.getDate() + 1);
			}
			shots = zeroLine;
			simulated = true;
		}

		if (!canvas || !shots?.length) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const sample = shots[0];
		const timeKey = "time_ts" in sample ? "time_ts" : "timestamp_used";
		const machineKey = "machine" in sample ? "machine" : "name";
		const avgKey = "avg_value" in sample ? "avg_value" : "avg";

		let gaps = simulated ? [{ start: startOfMonth, end: endOfMonth }] : detectGaps(shots);

		const grouped = {};
		for (const s of shots) {
			const machine = s[machineKey] ?? "Simulated";
			const t = new Date(s[timeKey] ?? s.x);
			const val = Number(s[avgKey] ?? s.y);
			if (!grouped[machine]) grouped[machine] = [];
			grouped[machine].push({ x: t, y: val });
		}

		const datasets = Object.entries(grouped).map(([machine, arr]) => {
			const sorted = arr.sort((a, b) => a.x - b.x);
			const firstTime = sorted[0].x;
			const lastTime = sorted[sorted.length - 1].x;
			if (firstTime > startOfMonth) sorted.unshift({ x: startOfMonth, y: 0 });
			if (lastTime < endOfMonth) sorted.push({ x: endOfMonth, y: 0 });

			return {
				label: machine,
				data: downsample(sorted),
				borderColor: simulated ? "rgba(249,115,22,0.6)" : "#f97316",
				borderDash: simulated ? [6, 4] : [],
				borderWidth: 2,
				pointRadius: 0,
				tension: 0.35,
				fill: false,
				cubicInterpolationMode: "monotone"
			};
		});

		if (chart) chart.destroy();

		chart = new Chart(ctx, {
			type: "line",
			data: { datasets, gaps },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						type: "time",
						time: {
							unit: interval === "5min" || interval === "15min" ? "minute" : interval,
							displayFormats: {
								minute: "MMM d HH:mm",
								hour: "MMM d HH:00",
								day: "MMM d"
							}
						},
						min: startOfMonth,
						max: endOfMonth,
						grid: { color: "#f3f4f6" },
						ticks: { color: "#6b7280" },
						title: { display: true, text: "Time", color: "#374151" }
					},
					y: {
						grid: { color: "#f3f4f6" },
						ticks: { color: "#6b7280" },
						title: { display: true, text: "Avg Shot Time (s)", color: "#374151" }
					}
				},
				plugins: {
					legend: { display: false },
					tooltip: {
						mode: "index",
						intersect: false,
						backgroundColor: "rgba(17,17,17,0.85)",
						callbacks: {
							title: (items) => new Date(items[0].parsed.x).toLocaleString(),
							label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(3)} s`
						}
					}
				},
				interaction: { mode: "nearest", axis: "x", intersect: false }
			},
			plugins: [gapHighlightPlugin]
		});
	}

	// -----------------------------
	// 🚀 Lifecycle
	// -----------------------------
	async function rebuildChart(retryCount = 0) {
		loading = true;
		error = null;
		try {
			const data = await fetchHybridData();
			shots = Array.isArray(data) ? data : [];
			if (shots.length > 3000) {
				const step = Math.ceil(shots.length / 1500);
				shots = shots.filter((_, i) => i % step === 0);
			}
			await tick();
			buildChart();
		} catch (e) {
			error = e.message ?? String(e);
			console.error("rebuildChart error:", e);
			if (e.message.includes("timed out") && retryCount < 2) {
				const delay = 3000 * (retryCount + 1);
				console.warn(`Timeout. Retrying in ${delay / 1000}s...`);
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
