const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-percik.hbii.my.id/api";

export async function fetchBackend(endpoint: string, token?: string, options?: RequestInit) {
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options?.headers,
    };

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${res.statusText} (${res.status})`);
    }

    return res.json();
}
