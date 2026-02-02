import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://vvxjeipsrtndohvfxnvb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eGplaXBzcnRuZG9odmZ4bnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTE0ODIsImV4cCI6MjA4NDIyNzQ4Mn0.5UwRJC-XR7-KggeL9Kx9FikVIYSK_9u7mRAGEjAXFTQ"
);