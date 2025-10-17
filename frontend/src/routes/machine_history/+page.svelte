<svelte:head>
  <title>Machine History | Machine Monitoring</title>
</svelte:head>
<script>
	import { onMount, tick } from 'svelte'
	import { browser } from '$app/environment'
	import { supabase } from '$lib/supabaseClient'

	let canvas
	let chart
	let loading = true
	let error = null
	let chartData = []
	let filteredData = []
	let selectedMachine = 'ALL'
	let selectedDate = ''
	const SIM_DATE = new Date('2021-09-11T00:00:00Z')

	let Chart, zoomPlugin, annotationPlugin

	onMount(async () => {
		try {
			if (browser) {
				const chartModule = await import('chart.js')
				const zoomModule = await import('chartjs-plugin-zoom')
				const annotationModule = await import('chartjs-plugin-annotation')
				await import('chartjs-adapter-date-fns')

				Chart = chartModule.Chart
				zoomPlugin = zoomModule.default
				annotationPlugin = annotationModule.default
				Chart.register(...chartModule.registerables, zoomPlugin, annotationPlugin)
			}

			const { data, error: err } = await supabase.rpc('get_mold_machine_history')
			if (err) throw err

			const normalized = (data ?? []).map((item) => ({
				machine: String(item.machine ?? '').trim(),
				mold: String(item.mold_name ?? '').trim(),
				start: item.latest_start_date ? new Date(item.latest_start_date) : null,
				end: item.latest_end_date ? new Date(item.latest_end_date) : SIM_DATE,
				isActive: !item.latest_end_date
			}))

			chartData = normalized
				.filter((r) => r.machine && r.mold && r.start)
				.sort((a, b) => a.machine.localeCompare(b.machine))

			filterByDate(selectedDate)
		} catch (e) {
			console.error('[molds] error:', e)
			error = e.message ?? String(e)
		} finally {
			loading = false
		}
	})

	function filterByDate(dateStr) {
		if (!dateStr) {
			filteredData = chartData
		} else {
			const current = new Date(dateStr)
			filteredData = chartData.map((d) => {
				const start = new Date(d.start)
				const end = d.end ? new Date(d.end) : SIM_DATE
				const active = start <= current && current <= end
				return { ...d, isVisible: active }
			})
		}
		buildChart()
	}

	async function buildChart() {
		await tick()
		if (!canvas || !Chart) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return
		if (chart) chart.destroy()

		const machines = [...new Set(chartData.map((d) => d.machine))].sort()
		const palette = [
			'#f97316', '#10b981', '#3b82f6', '#6366f1',
			'#84cc16', '#eab308', '#ec4899', '#14b8a6'
		]

		const shownData =
			selectedMachine === 'ALL'
				? filteredData
				: filteredData.filter((d) => d.machine === selectedMachine)

		const dataPoints = shownData.map((d) => ({
			x: [d.start, d.end],
			y: d.machine,
			mold: d.mold,
			active: d.isVisible ?? true
		}))

		const datasets = [
			{
				label: 'Mold Usage',
				data: dataPoints,
				backgroundColor: (ctx) => {
					const raw = ctx.raw ?? {}
					if (!raw.active) return '#d1d5db'
					const mold = raw.mold || ''
					const idx = mold.charCodeAt(0) % palette.length
					return palette[idx]
				},
				borderRadius: 5,
				borderSkipped: false
			}
		]

		const minDate = Math.min(...chartData.map((d) => d.start))
		const maxDate = Math.max(...chartData.map((d) => d.end))

		let zoomMin = minDate
		let zoomMax = maxDate
		if (selectedDate) {
			const day = new Date(selectedDate).getTime()
			const oneDay = 1000 * 60 * 60 * 24
			zoomMin = day - oneDay * 3
			zoomMax = day + oneDay * 3
		}

		chart = new Chart(ctx, {
			type: 'bar',
			data: { datasets },
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				layout: {
					padding: { top: 20, bottom: 10, left: 10, right: 30 }
				},
				scales: {
					x: {
						type: 'time',
						min: zoomMin,
						max: zoomMax,
						time: { unit: selectedDate ? 'day' : 'month', tooltipFormat: 'MMM dd yyyy' },
						grid: { color: '#e5e7eb' },
						ticks: {
							color: '#6b7280',
							font: { size: 12 },
							padding: 6
						},
						title: {
							display: true,
							text: 'Date',
							color: '#6b7280'
						}
					},
					y: {
						type: 'category',
						labels: machines,
						offset: true,
						grid: { display: false },
						ticks: {
							color: '#111827',
							font: { size: 14, weight: '500' },
							padding: 12,
							autoSkip: false
						}
					}
				},
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#111827',
						titleColor: '#fff',
						bodyColor: '#d1d5db',
						callbacks: {
							title: (items) => items[0]?.raw?.mold ?? 'Unknown mold',
							label: (ctx) => {
								const r = ctx.raw
								const start = new Date(r.x[0]).toLocaleDateString()
								const end = new Date(r.x[1]).toLocaleDateString()
								return `${start} → ${end}`
							}
						}
					}
				},
				elements: { bar: { barThickness: 18 } }
			}
		})
	}

	function handleMachineChange(e) {
		selectedMachine = e.target.value
		filterByDate(selectedDate)
	}

	function handleDateChange(e) {
		selectedDate = e.target.value
		filterByDate(selectedDate)
	}
</script>

<div class="p-10 bg-gray-50 text-gray-900 min-h-screen">
	<header class="mb-8 text-center">
		<h1 class="text-2xl font-semibold mb-1">Machine Mold History</h1>
		<p class="text-gray-500 text-sm"> 
			<span class="text-gray-400">(Simulated current date: <strong>11 Sep 2021</strong>)</span>
		</p>
	</header>

	<div class="flex flex-wrap justify-center gap-8 mb-6">
		<div>
			<label for="machine" class="text-sm font-medium text-gray-700 block mb-1">Filter by Machine</label>
			<select id="machine" bind:value={selectedMachine} on:change={handleMachineChange} class="input w-40">
				<option value="ALL">All Machines</option>
				{#each [...new Set(chartData.map((d) => d.machine))] as machine}
					<option value={machine}>{machine}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="date" class="text-sm font-medium text-gray-700 block mb-1">Select Date</label>
			<input type="date" id="date" bind:value={selectedDate} on:change={handleDateChange} class="input w-44" />
			<p class="text-xs text-gray-400 mt-1 text-center">Leave empty to show full history</p>
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
		</div>

	{:else if error}
		<p class="text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg text-center">{error}</p>

	{:else if chartData && chartData.length > 0}
		<div class="bg-white border border-gray-200 rounded-xl shadow-sm p-8 h-[600px]">
			<div class="h-full">
				<canvas bind:this={canvas} class="!w-full !h-full"></canvas>
			</div>
		</div>

	{:else}
		<p class="text-gray-500 italic text-center py-10">No data available.</p>
	{/if}
</div>

<style>
	.input {
		height: 42px;
		padding: 0.5rem 0.75rem;
		font-size: 0.9rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background-color: white;
	}
	canvas {
		width: 100% !important;
		height: 100% !important;
	}
</style>
