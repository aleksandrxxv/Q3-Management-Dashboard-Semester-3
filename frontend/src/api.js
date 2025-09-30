// frontend/src/api.js

// Pick base URL from env, fallback to localhost:8080 for dev
export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// Helper for GET requests
export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ----- Molds -----
export function fetchMolds(startDate, endDate) {
  return apiGet(`/api/molds?startDate=${startDate}&endDate=${endDate}`);
}

export function fetchMoldOperations(startDate, endDate) {
  return apiGet(
    `/api/molds/operations/count?startDate=${startDate}&endDate=${endDate}`
  );
}

export function fetchMoldHistory(moldId, startDate, endDate) {
  return apiGet(
    `/api/molds/${moldId}/history?startDate=${startDate}&endDate=${endDate}`
  );
}

// ----- Machines -----
export function fetchMachines() {
  return apiGet(`/api/machines`);
}

export function fetchMachineById(machineId) {
  return apiGet(`/api/machines/${machineId}`);
}

export function fetchInstalledMolds(machineName) {
  return apiGet(`/api/machines/${machineName}/installed-molds`);
}
