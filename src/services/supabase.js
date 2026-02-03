import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://wshykrbawnwimzifzraz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaHlrcmJhd253aW16aWZ6cmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Njc4MDEsImV4cCI6MjA4NTM0MzgwMX0.ICeJWgJcGuPD2ZvpSnJdLu52JIYFshSy3PJXDm_hjds";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);