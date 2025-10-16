// src/routes/molds/[id]/graph/+server.js
import { supabase } from '$lib/supabaseClient';

/**
 * Handles GET /molds/[id]/graph
 */
export async function GET({ params }) {
  const moldId = Number(params.id);

  // Call the simplified weekly function
  const { data, error } = await supabase.rpc(
    'get_mold_machine_shot_time_dynamic',
    { p_mold_id: moldId }
  );

  if (error) {
    console.error('Error fetching mold data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(data ?? []), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
