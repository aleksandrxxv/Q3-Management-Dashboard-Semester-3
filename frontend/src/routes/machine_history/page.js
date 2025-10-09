// src/routes/machine_history/+page.js
export const ssr = false;     // don't render this route on the server
export const prerender = false; // don't try to prerender at build
export const csr = true;      // ensure client-side rendering