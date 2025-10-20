<svelte:head>
  <title>Q3 Maintenance Dashboard</title>
  <meta
    name="description"
    content="Real-time insights into machine activity, mold health, and factory performance."
  />
  <link
    rel="icon"
    type="image/svg+xml"
    href="https://www.q3.nl/wp-content/themes/q3/favicon.ico"
  />
</svelte:head>

<script>
  export let data;
  import logo from '$lib/assets/q3_logo_darkmode.png';

  
  // fallback
  $: stats = data.stats ?? {
    totalMachines: 0,
    activeMachines: 0,
    inactiveMachines: 0,
    totalMolds: 0,
    activeMolds: 0,
    inactiveMolds: 0,
    totalShotRows: 0,
    bestMachine: { name: 'Loading...', uptime: 0, cycles: 0 },
    topMold: { name: 'Loading...', uses: 0 },
  };
</script>

<div class="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 p-5">
  <!-- Header -->
  <div class="text-center max-w-3xl mt-2">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Q3 Maintenance Dashboard</h1>
    <p class="text-gray-500 text-lg mb-8">
      Overview of active and inactive machines and molds, updated in real time.
    </p>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-6xl w-full">
    <!-- Machine summary -->
    <div on:click={() => window.location.href = '/machines'} class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <h3 class="text-gray-600 text-sm font-medium mb-2">Machines</h3>
      <p class="text-3xl font-semibold text-gray-900">{stats.totalMachines} Total</p>

      <div class="flex flex-wrap justify-between mt-2 text-sm">
        <p class="text-green-600 font-medium">{stats.activeMachines} Active</p>
        <p class="text-gray-500 font-medium">{stats.inactiveMachines} Inactive</p>
        <p class="text-blue-600 font-medium">{stats.operational} In Operation</p>
        <p class="text-yellow-500 font-medium">{stats.standstill} Standstill</p>
      </div>
    </div>


    <!-- Molds -->
    <div on:click={() => window.location.href = '/molds'} class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <h3 class="text-gray-600 text-sm font-medium mb-2">Molds</h3>
      <p class="text-3xl font-semibold text-gray-900">{stats.totalMolds} Total</p>
      <div class="flex justify-between mt-1 text-sm">
        <p class="text-green-600 font-medium">{stats.activeMolds} Active</p>
        <p class="text-gray-500 font-medium">{stats.inactiveMolds} Inactive</p>
      </div>
    </div>
  </div>

  <!-- Best performing -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14 max-w-6xl w-full">

    <!-- Best Machine -->
    <div on:click={() => window.location.href = '/machines'} class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <!-- <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor" class="w-5 h-5 text-orange-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13h2l2-3 4 6 3-4 5 7h3" />
        </svg> -->
        Best Performing Machine
      </h3>
      <p class="text-xl font-medium text-gray-800">{stats.bestMachine.name}</p>
      <p class="text-sm text-gray-500 mt-1">
        Recorded <span class="font-semibold">{stats.totalShotRows}</span> shot time entries.
      </p>
    </div>

    <!-- Top Mold -->
    <div on:click={() => window.location.href = '/molds'} class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <!-- <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor" class="w-5 h-5 text-orange-500">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4a2 2 0 001-1.73z" />
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M3.27 6.96L12 12l8.73-5.04M12 22V12" />
        </svg> -->
        Most Used Mold
      </h3>
      <p class="text-xl font-medium text-gray-800">{stats.topMold.name}</p>
      <p class="text-sm text-gray-500 mt-1">
        Has been used by <span class="font-semibold">{stats.topMold.uses}</span> machines.
      </p>
    </div>
  </div>
</div>
