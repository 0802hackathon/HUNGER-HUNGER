const EXAMPLE_SUPABASE_URL = "https://your-project.supabase.co";
const EXAMPLE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_your_key";

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (
    !url ||
    !publishableKey ||
    url === EXAMPLE_SUPABASE_URL ||
    publishableKey === EXAMPLE_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }

  return { url, publishableKey };
}
