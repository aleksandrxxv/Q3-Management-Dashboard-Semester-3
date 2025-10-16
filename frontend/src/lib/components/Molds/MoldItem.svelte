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

  // Fetch total operations (shots) for this mold on expand
  async function loadShots() {
    if (totalShots != null) return; // already loaded

    loadingShots = true;
    const { data, error } = await supabase.rpc('get_mold_total_shots_v2', {
      _mold_ids: [mold.id],
    });
    loadingShots = false;

    if (error) {
      console.error('Error loading shots for mold', mold.id, error.message);
      totalShots = -1; // indicates error
    } else if (data?.length) {
      totalShots = data[0].total_shots;
    } else {
      totalShots = 0; // no records found
    }
  }

  // Automatically trigger when expanded
  $: if (expanded) loadShots();

  // Navigate to machine page when clicked
  function openMachine(machine) {
    if (!machine) return;
    goto(`/machines/${encodeURIComponent(machine)}`);
  }
</script>

<!-- Table Row -->
<tr class="hover:bg-gray-50 transition cursor-pointer" on:click={toggle}>
  <!-- Mold Name -->
  <td class="px-4 py-3 font-medium text-gray-900">{mold.name}</td>

  <!-- Current Machine -->
  <td class="px-4 py-3 flex items-center gap-1">
    {#if mold.currentMachine}
      <span
        class="font-semibold text-gray-900 hover:text-orange-600 transition text-left"
        on:click|stopPropagation={() => openMachine(mold.currentMachine)}
      >
        {mold.currentMachine}
      </span>

      {#if mold.linkedMachines.length > 1}
        <span
          class="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium cursor-pointer hover:bg-orange-200 transition"
          title={`Used on ${mold.linkedMachines.length} machines in total`}
          on:click|stopPropagation={toggle}
        >
          +{mold.linkedMachines.length - 1}
        </span>
      {/if}
    {:else}
      <span class="text-gray-400">—</span>
    {/if}
  </td>

  <!-- Status -->
  <td class="px-4 py-3">
    {#if mold.currentMachine}
      <span class="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
        In Use
      </span>
    {:else}
      <span class="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
        Idle
      </span>
    {/if}
  </td>

  <!-- Expand Arrow -->
  <td class="px-4 py-3 text-right">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="w-5 h-5 text-gray-500 transition-transform duration-300 inline-block"
      style="transform: rotate({expanded ? 90 : 0}deg)"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </td>
</tr>

<!-- Expanded Row -->
{#if expanded}
  <tr>
    <td colspan="5" class="p-0">
      <div transition:slide class="bg-gray-50 border-t border-gray-200 p-6">
        <div class="text-gray-600">
          <strong class="text-gray-800 text-lg block mb-3">{mold.name}</strong>

          <!-- Two-column layout -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- LEFT COLUMN -->
            <div class="flex flex-col gap-4 md:col-span-1">
              <!-- Box 1: Machine History -->
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <h3 class="text-sm font-semibold text-gray-800 mb-3">
                    Machine History
                </h3>

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
                        <span class="text-xs text-gray-500">
                            {m.start} → {m.end || 'In Use'}
                        </span>
                        </li>
                    {/each}
                    </ul>
                {:else}
                    <p class="text-gray-400 italic text-sm">No history found.</p>
                {/if}
                </div>

              <!-- Box 2: Operation Info -->
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <h3 class="text-sm font-semibold text-gray-800 mb-3">
                    Operation Info
                  </h3>
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
            <!-- RIGHT COLUMN -->
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:col-span-2 flex flex-col justify-center">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">
                Operations Over Time
              </h3>
              <MoldGraph moldId={mold.id} />
            </div>
          </div>
        </div>
      </div>
    </td>
  </tr>
{/if}
