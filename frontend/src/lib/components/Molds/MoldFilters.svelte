<script>
  export let filter = 'all';
  export let search = '';
  export let onFilter;
  export let onSearch;
</script>

<div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
  <!-- Search -->
  <div class="relative w-full sm:w-64">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         stroke-width="2" stroke="currentColor"
         class="w-4 h-4 absolute left-3 top-2.5 text-gray-400">
      <path stroke-linecap="round" stroke-linejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
    </svg>
    <input
      type="text"
      placeholder="Search mold..."
      class="pl-9 pr-3 py-2 text-sm bg-white text-gray-900 border border-gray-300 rounded-full
             focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
      bind:value={search}
      on:input={(e) => onSearch(e.target.value)}
    />
  </div>

  <!-- Filter bar -->
  <div class="flex bg-white rounded-full overflow-hidden border border-gray-300 shadow-sm">
    <button
      class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
      class:bg-orange-500={filter === 'all'}
      class:text-white={filter === 'all'}
      on:click={() => onFilter('all')}
    >All</button>

    <button
      class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
      class:bg-orange-500={filter === 'inuse'}
      class:text-white={filter === 'inuse'}
      on:click={() => onFilter('inuse')}
    >In Use</button>

    <button
      class="px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none"
      class:bg-orange-500={filter === 'idle'}
      class:text-white={filter === 'idle'}
      on:click={() => onFilter('idle')}
    >Idle</button>
  </div>
</div>
