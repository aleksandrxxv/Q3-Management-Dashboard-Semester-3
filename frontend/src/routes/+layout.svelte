<script>
  import { page } from '$app/stores';
  import '../app.css';
  import logo from '$lib/assets/logo.svg';
</script>

<svelte:head>
  <title>Q3 Maintenance</title>
  <meta name="description" content="Real-time machine and mold monitoring dashboard" />
  <link
    rel="icon"
    type="image/svg+xml"
    href="https://www.q3.nl/wp-content/themes/q3/favicon.ico"
  />
</svelte:head>

{#if $page.url.pathname !== '/'}
  <!-- App Layout (Navbar + Sidebar) -->
  <div class="flex min-h-screen bg-gray-50 text-gray-900">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-gray-300 flex flex-col border-r border-orange-500">
      <div class="p-6 border-b border-slate-800 flex items-center gap-3">
        <a href="/" class="flex items-center gap-3">
          <img
            src={logo}
            alt="Q3 Maintenance Software"
            class="h-10 cursor-pointer hover:opacity-90 transition"
          />
        </a>
      </div>

      <!-- Sidebar Nav -->
      <nav class="flex-1 mt-6 px-4 space-y-2 text-sm font-medium">
        <!-- Machines -->
        <a
          href="/machines"
          class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white"
          class:bg-slate-800={$page.url.pathname.startsWith('/machines')}
          class:text-white={$page.url.pathname.startsWith('/machines')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 text-orange-400 flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 13h2l2-3 4 6 3-4 5 7h3"
            />
          </svg>
          <span>Machines</span>
        </a>

        <!-- Machine History -->
        <a
          href="/machine_history"
          class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white"
          class:bg-slate-800={$page.url.pathname.startsWith('/machine_history')}
          class:text-white={$page.url.pathname.startsWith('/machine_history')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 text-orange-400 flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4a2 2 0 001-1.73z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.27 6.96L12 12l8.73-5.04M12 22V12"
            />
          </svg>
          <span>Machine History</span>
        </a>

        <!-- Molds -->
        <a
          href="/molds"
          class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white"
          class:bg-slate-800={$page.url.pathname.startsWith('/molds')}
          class:text-white={$page.url.pathname.startsWith('/molds')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 text-orange-400 flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4a2 2 0 001-1.73z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.27 6.96L12 12l8.73-5.04M12 22V12"
            />
          </svg>
          <span>Mold History</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- 🧭 Top Navbar -->
      <header
        class="flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b-4 border-orange-500"
      >
        <div class="flex items-center gap-3">
          <!-- optional page title here -->
        </div>

        <!-- Icons -->
        <div class="flex items-center gap-4">
          <!-- Bell icon -->
          <button class="hover:text-orange-400 text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          <!-- User icon -->
          <button class="hover:text-orange-400 text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12zM4 21v-1a4 4 0 014-4h8a4 4 0 014 4v1"
              />
            </svg>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <slot />
      </main>
    </div>
  </div>
{:else}
  <!-- Home page without layout -->
  <slot />
{/if}
