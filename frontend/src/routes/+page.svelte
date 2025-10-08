<svelte:head>
  <title>Q3 Maintenance</title>
  <meta name="description" content="Real-time machine and mold monitoring dashboard" />
  <link
    rel="icon"
    type="image/svg+xml"
    href="https://www.q3.nl/wp-content/themes/q3/favicon.ico"
  />
</svelte:head>
<script>
  import logo from '$lib/assets/q3_logo_darkmode.png'; // optional: replace with your logo file
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-6">
  <!-- Hero Section -->
  <div class="text-center max-w-2xl">
    <!-- Logo -->
    <div class="flex justify-center mb-6">
      <img src={logo} alt="Machine Monitor Logo" class="h-30 w-auto drop-shadow-md" />
    </div>

    <!-- Subtitle -->
    <p class="text-gray-500 text-lg mb-8">
      Real-time insights into machine activity and mold performance.
    </p>

    <!-- CTA Buttons -->
    <div class="flex flex-wrap justify-center gap-4">
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
        Mold History Dashboard
      </a>
    </div>
  </div>

  <!-- Features Section -->
  <div class="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl w-full text-center">
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-orange-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 13h2l2-3 4 6 3-4 5 7h3" />
      </svg>
      <h3 class="font-semibold text-gray-900 mb-1">Machine Status Overview</h3>
      <p class="text-gray-500 text-sm">
        Monitor real-time machine activity and operational status.
      </p>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-orange-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 .843 3 1.875S13.657 11.75 12 11.75 9 10.907 9 9.875 10.343 8 12 8z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12v6m6 0H6" />
      </svg>
      <h3 class="font-semibold text-gray-900 mb-1">Mold Health Dashboard</h3>
      <p class="text-gray-500 text-sm">
        View mold operation counts and performance trends.
      </p>
    </div>
  </div>

</div>
