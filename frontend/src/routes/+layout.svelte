<script>
  import { page } from "$app/stores";
  import "../app.css";
  import logo from "$lib/assets/logo.svg";
</script>

<svelte:head>
  <title>Q3 Maintenance</title>
  <meta
    name="description"
    content="Real-time machine and mold monitoring dashboard"
  />
  <link
    rel="icon"
    type="image/svg+xml"
    href="https://www.q3.nl/wp-content/themes/q3/favicon.ico"
  />
</svelte:head>

<div class="min-h-screen flex bg-gray-50 text-gray-900">
  <aside
    class="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-gray-300 flex flex-col border-r border-orange-500 z-40"
  >
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
    <nav class="flex-1 mt-6 px-4 space-y-2 text-sm font-medium overflow-y-auto">
      <!-- Overview -->
      <a
        href="/"
        class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white"
        class:bg-slate-800={$page.url.pathname === "/"}
        class:text-white={$page.url.pathname === "/"}
      >
        <!-- Home / Overview Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor"
             class="w-5 h-5 text-orange-400 flex-shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
        </svg>
        <span>Overview</span>
      </a>

      <!-- Machines -->
      <a
        href="/machines"
        class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white"
        class:bg-slate-800={$page.url.pathname.startsWith("/machines")}
        class:text-white={$page.url.pathname.startsWith("/machines")}
      >
        <!-- Factory / Machine Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor"
             class="w-5 h-5 text-orange-400 flex-shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 21V10l6 3V6l6 3V3l6 3v15H3z" />
        </svg>
        <span>Machines</span>
      </a>

      <!-- Machine History -->
      <a
        href="/machine_history"
        class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white"
        class:bg-slate-800={$page.url.pathname.startsWith("/machine_history")}
        class:text-white={$page.url.pathname.startsWith("/machine_history")}
      >
        <!-- Clock / History Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor"
             class="w-5 h-5 text-orange-400 flex-shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Machine History</span>
      </a>

      <!-- Mold History -->
      <a
        href="/molds"
        class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-slate-800 hover:text-white"
        class:bg-slate-800={$page.url.pathname.startsWith("/molds")}
        class:text-white={$page.url.pathname.startsWith("/molds")}
      >
        <!-- Cube / Mold Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="2" stroke="currentColor"
             class="w-5 h-5 text-orange-400 flex-shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 16V8a2 2 0 00-1-1.73L12 2 4 6.27A2 2 0 003 8v8a2 2 0 001 1.73L12 22l8-4.27A2 2 0 0021 16zM3.27 6.96L12 12l8.73-5.04" />
        </svg>
        <span>Mold History</span>
      </a>
    </nav>
  </aside>

  <div class="flex-1 flex flex-col ml-64">
    <!-- Top Navbar -->
    <header
      class="flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b-4 border-orange-500 sticky top-0 z-30"
    >
      <div class="flex items-center gap-3">
        <!-- optional page title -->
      </div>

      <div class="flex items-center gap-4">
        <button class="hover:text-orange-400 text-gray-300">
          <!-- Notification Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <button class="hover:text-orange-400 text-gray-300">
          <!-- User Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12zM4 21v-1a4 4 0 014-4h8a4 4 0 014 4v1" />
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
