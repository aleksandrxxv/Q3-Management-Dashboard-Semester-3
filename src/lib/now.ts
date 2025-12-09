// src/lib/now.ts

// Server-side simulated date
const serverSimulated = process.env.SIMULATED_DATE;

// Client-side simulated date
let clientSimulated: string | null = null;

if (typeof window !== "undefined") {
    clientSimulated = (window as any).__SIMULATED_DATE__ ?? null;
}

export function now(): Date {
    // Highest priority: client-side override (dev tools/testing)
    if (clientSimulated) {
        return new Date(clientSimulated);
    }

    // Server-side .env override
    if (serverSimulated) {
        return new Date(serverSimulated);
    }

    // Real date
    return new Date();
}
