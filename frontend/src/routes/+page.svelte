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
  import logo from '$lib/assets/q3_logo_darkmode.png';

  // Simulated summary data (replace later with real Supabase queries)
  let stats = {
    totalMachines: 27,
    activeMachines: 25,
    totalMolds: 132,
    activeMolds: 97,
    bestMachine: {
      name: "Injection M-23",
      uptime: 99.2,
      cycles: 58320
    },
    topMold: {
      name: "Q3-Mold-87",
      uses: 14122
    }
  };
</script>

<!-- MAIN CONTENT -->
<div class="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 p-10">
  <!-- Hero Header -->
  <div class="text-center max-w-3xl mt-10">
    <div class="flex justify-center mb-6">
      <img src={logo} alt="Q3 Logo" class="h-24 w-auto drop-shadow-md" />
    </div>
    <h1 class="text-3xl font-semibold text-gray-900 mb-2">Q3 Maintenance Dashboard</h1>
    <p class="text-gray-500 text-lg mb-8">
      Gain real-time insights into machine activity, mold performance, and production efficiency.
    </p>

    <div class="flex flex-wrap justify-center gap-4 mb-12">
      <a
        href="/machines"
        class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full shadow-sm transition transform hover:scale-105"
      >
        View Machines
      </a>
      <a
        href="/molds"
        class="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-100 transition transform hover:scale-105"
      >
        Mold Dashboard
      </a>
    </div>
  </div>

  <!-- Insight Summary Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols- gap-6 max-w-6xl w-full">
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <h3 class="text-gray-600 text-sm font-medium mb-1">Total Machines</h3>
      <p class="text-3xl font-semibold text-gray-900">{stats.totalMachines}</p>
      <p class="text-green-600 text-sm mt-1">{stats.activeMachines} Active</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <h3 class="text-gray-600 text-sm font-medium mb-1">Total Molds</h3>
      <p class="text-3xl font-semibold text-gray-900">{stats.totalMolds}</p>
      <p class="text-green-600 text-sm mt-1">{stats.activeMolds} Active</p>
    </div>
  </div>

  <!-- Best Performing Sections -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14 max-w-6xl w-full">
    <!-- Best Machine -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke-width="2" stroke="currentColor" class="w-5 h-5 text-orange-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13h2l2-3 4 6 3-4 5 7h3" />
          </svg>
          Best Performing Machine
        </h3>
      </div>
      <div class="text-gray-800">
        <p class="text-xl font-medium">{stats.bestMachine.name}</p>
        <p class="text-sm text-gray-500 mt-1">
          Uptime: <span class="font-semibold text-green-600">{stats.bestMachine.uptime}%</span>
        </p>
        <p class="text-sm text-gray-500">
          Total Cycles: <span class="font-semibold">{stats.bestMachine.cycles.toLocaleString()}</span>
        </p>
      </div>
    </div>

    <!-- Top Mold -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke-width="2" stroke="currentColor" class="w-5 h-5 text-orange-500">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4a2 2 0 001-1.73z" />
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.27 6.96L12 12l8.73-5.04M12 22V12" />
          </svg>
          Most Used Mold
        </h3>
      </div>
      <div class="text-gray-800">
        <p class="text-xl font-medium">{stats.topMold.name}</p>
        <p class="text-sm text-gray-500 mt-1">
          Total Uses: <span class="font-semibold">{stats.topMold.uses.toLocaleString()}</span>
        </p>
        <p class="text-sm text-gray-500">
          Last Maintenance: <span class="text-orange-500 font-medium">2 days ago</span>
        </p>
      </div>
    </div>
  </div>

</div>
