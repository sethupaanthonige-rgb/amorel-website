import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ---------------------------------------------------------------------------
// window.storage shim
// ---------------------------------------------------------------------------
// App.jsx was built for Claude's artifact environment, which provides a
// window.storage API backed by a real database (so every visitor to the
// Claude-hosted preview sees the same saved products).
//
// Outside Claude, there's no such server — so this shim redirects the same
// calls to the browser's built-in localStorage instead. This keeps App.jsx
// completely unchanged, but it comes with one real limitation:
//
//   localStorage is per-browser, per-device. If you add a product from your
//   laptop, it will NOT show up for someone visiting the site on their phone.
//   Only YOU will see it, and only in that same browser.
//
// This is fine for local testing and even for a single-admin setup where you
// always manage products from the same browser. For a real multi-visitor
// store where products need to appear for every customer, you'll eventually
// want a small backend (e.g. Supabase, Firebase, or a simple database) in
// place of this shim. Ask Claude if/when you're ready to set that up.
// ---------------------------------------------------------------------------
window.storage = {
  get: async (key) => {
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error(`Key "${key}" not found`);
    return { key, value: raw, shared: false };
  },
  set: async (key, value) => {
    localStorage.setItem(key, value);
    return { key, value, shared: false };
  },
  delete: async (key) => {
    localStorage.removeItem(key);
    return { key, deleted: true, shared: false };
  },
  list: async (prefix) => {
    const keys = Object.keys(localStorage).filter((k) => !prefix || k.startsWith(prefix));
    return { keys, prefix, shared: false };
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
