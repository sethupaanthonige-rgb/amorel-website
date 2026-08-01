import React from "react";
import ReactDOM from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import App from "./App.jsx";
import "./index.css";

// ---------------------------------------------------------------------------
// Supabase connection
// ---------------------------------------------------------------------------
const SUPABASE_URL = "https://fhmddswlcvbqieatffsd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZobWRkc3dsY3ZicWllYXRmZnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0OTExNjYsImV4cCI6MjEwMTA2NzE2Nn0.NIqx6yPvubqJHoXISkr99Gt5NAKDgCOZjbQTfx1lyyY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------------------------------------------------------
// window.storage shim — backed by the real Supabase `site_storage` table
// ---------------------------------------------------------------------------
// App.jsx was built for Claude's artifact environment, which provides a
// window.storage API. This shim gives it the same interface, but now backed
// by a real shared database — so every visitor, on any device, sees the same
// saved products (unlike the localStorage version, which only worked on one
// browser).
// ---------------------------------------------------------------------------
window.storage = {
  get: async (key) => {
    const { data, error } = await supabase
      .from("site_storage")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(`Key "${key}" not found`);
    return { key, value: data.value, shared: true };
  },
  set: async (key, value) => {
    const { error } = await supabase
      .from("site_storage")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    return { key, value, shared: true };
  },
  delete: async (key) => {
    const { error } = await supabase.from("site_storage").delete().eq("key", key);
    if (error) throw error;
    return { key, deleted: true, shared: true };
  },
  list: async (prefix) => {
    let query = supabase.from("site_storage").select("key");
    if (prefix) query = query.like("key", `${prefix}%`);
    const { data, error } = await query;
    if (error) throw error;
    return { keys: (data || []).map((row) => row.key), prefix, shared: true };
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
