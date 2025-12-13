export function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return ''; // Browser should use relative url
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }

    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    return 'http://localhost:3000';
}

export async function safeFetch(path: string, options: RequestInit = {}) {
    const baseUrl = getBaseUrl();
    // Remove leading slash if present to avoid double slashes if base has trailing
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${baseUrl}${cleanPath}`;

    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            console.error(`Fetch failed for ${url}: ${res.status} ${res.statusText}`);
            return null; // or throw
        }
        return res.json();
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        return null;
    }
}
