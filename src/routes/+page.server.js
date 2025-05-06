import { redirect } from "@sveltejs/kit";
import { supabase } from "$lib/supabaseClient";

export async function load({ locals }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    throw redirect(303, "/");
  }
  
  return {};
}