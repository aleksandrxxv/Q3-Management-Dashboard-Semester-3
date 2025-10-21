<script>
  import { slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import MoldGraph from './MoldGraph.svelte';

  export let mold;
  export let expanded = false;
  export let toggle;

  let loadingShots = false;
  let totalShots = mold.totalOperations; // may be null initially

  async function loadShots() {
    if (totalShots != null) return;
    loadingShots = true;
    const { data, error } = await supabase.rpc('get_mold_total_shots_cached', {
      p_mold_id: mold.id,
    });
    loadingShots = false;

    if (error) {
      console.error('Error loading shots for mold', mold.id, error.message);
      totalShots = -1;
    } else if (data?.length) {
      totalShots = data[0].total_shots;
    } else {
      totalShots = 0;
    }
  }

  $: if (expanded) loadShots();
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  //  Read machine name from URL query
  let selectedMachine = null;

if (selectedMachine) {
  const match = ports.find(p => p.name === selectedMachine);
  if (match) {
    // Automatically expand this machine
    toggleExpand(`${match.id}-${match.board}-${match.port}-0`, match.name);
    // Scroll to it smoothly
    setTimeout(() => {
      document.getElementById(`machine-${match.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }
}

</script>

<!-- Collapsed row -->
<tr
  id={"mold-" + mold.id}
  class="cursor-pointer hover:bg-gray-50 transition"
  on:click={toggle}
>
  <td class="px-4 py-3">
    <div class="row-glow font-semibold text-gray-900">{mold.name}</div>
  </td>

  <td class="px-4 py-3">
    <div class="row-glow flex items-center gap-2">
      {#if mold.currentMachine}
        <button
          class="font-semibold text-gray-900 hover:text-orange-600 transition"
          on:click|stopPropagation={() => openMachine(mold.currentMachine)}
        >
          {mold.currentMachine}
        </button>
        {#if mold.linkedMachines.length > 1}
          <span
            class="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded-full font-medium"
          >
            +{mold.linkedMachines.length - 1}
          </span>
        {/if}
      {:else}
        <span class="text-gray-400">—</span>
      {/if}
    </div>
  </td>

  <td class="px-4 py-3 text-center align-middle">
    <div class="row-glow">
      {#if mold.currentMachine}
        <span class="inline-block bg-[#49B35F] text-white px-3 py-1 rounded-full text-xs font-semibold">
          In&nbsp;Use
        </span>
      {:else}
        <span class="inline-block bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
          Idle
        </span>
      {/if}
    </div>
  </td>

  <td class="px-4 py-3 text-right align-middle">
    <div class="row-glow">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-5 h-5 text-gray-400 transition-transform duration-300 inline-block"
        style="transform: rotate({expanded ? 90 : 0}deg)"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </td>
</tr>

<!-- Expanded details row -->
{#if expanded}
  <tr>
    <!-- MUST match the number of columns (4) -->
    <td colspan="4" class="p-0">
      <div transition:slide class="bg-gray-50 border-t border-gray-200 p-6">
        <div class="text-gray-700">
          <strong class="text-gray-900 text-lg block mb-3">{mold.name}</strong>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- LEFT -->
            <div class="flex flex-col gap-4 md:col-span-1">
              <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <h3 class="text-sm font-semibold text-gray-800 mb-3">Machine History</h3>
                {#if mold.linkedMachines.length > 0}
                  <ul class="space-y-2 text-sm">
                    {#each mold.linkedMachines as m}
                      <li class="flex justify-between items-center border-b border-gray-100 pb-1">
                        <button
                          class="font-semibold text-gray-900 hover:text-orange-600 transition text-left"
                          on:click|stopPropagation={() => openMachine(m.machine)}
                        >
                          {m.machine}
                        </button>
                        <span class="text-xs text-gray-500">{m.start} → {m.end || 'In Use'}</span>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="text-gray-400 italic text-sm">No history found.</p>
                {/if}
              </div>

              <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <h3 class="text-sm font-semibold text-gray-800 mb-3">Operation Info</h3>
                <div class="space-y-2 text-sm">
                  <p>
                    <span class="font-medium text-gray-700">Total operations:</span>
                    {#if loadingShots}
                      <span class="ml-1 text-gray-400 italic">Loading...</span>
                    {:else if totalShots === -1}
                      <span class="ml-1 text-red-500 italic">Error</span>
                    {:else if totalShots != null}
                      <span class="ml-1">{totalShots}</span>
                    {:else}
                      <span class="ml-1 text-gray-400">—</span>
                    {/if}
                  </p>

                  <p>
                    <span class="font-medium text-gray-700">Current Machine:</span>
                    <span class="ml-1">{mold.currentMachine || '—'}</span>
                  </p>

                  <p>
                    <span class="font-medium text-gray-700">Status:</span>
                    {#if mold.currentMachine}
                      <span class="ml-1 text-green-600 font-medium">In Use</span>
                    {:else}
                      <span class="ml-1 text-gray-500">Idle</span>
                    {/if}
                  </p>
                </div>
              </div>
            </div>

            <!-- RIGHT -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:col-span-2">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Operations Over Time</h3>
              <MoldGraph moldId={mold.id} />
            </div>
          </div>
        </div>
      </div>
    </td>
  </tr>
{/if}
