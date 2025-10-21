<script>
  export let current = ''
</script>

<nav class="bg-slate-900 text-gray-100 border-b border-slate-800 shadow-sm">
  <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
    <!-- Logo / App name -->
    <div class="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        class="w-6 h-6 text-blue-500"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18m9-9H3" />
      </svg>
      <h1 class="font-semibold text-lg tracking-tight">Machine Monitor</h1>
    </div>

    <!-- Nav links -->
    <div class="flex items-center gap-6 text-sm font-medium">
      <a
        href="/"
        class="transition-colors hover:text-blue-400"
        class:text-blue-400={current === 'dashboard'}
      >
        Dashboard
      </a>
      <a
        href="/machines"
        class="transition-colors hover:text-blue-400"
        class:text-blue-400={current === 'machines'}
      >
        Machines
      </a>
      <a
        href="/analytics"
        class="transition-colors hover:text-blue-400"
        class:text-blue-400={current === 'analytics'}
      >
        Analytics
      </a>
      <a
        href="/settings"
        class="transition-colors hover:text-blue-400"
        class:text-blue-400={current === 'settings'}
      >
        Settings
      </a>
    </div>
  </div>
</nav>
