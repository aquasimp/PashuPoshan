/**
 * PashuPoshan API Base Configuration
 * Handles clean environment-based URL resolution between Local Development, Android Native WebView, and Production Deployment.
 */

export const getApiBaseUrl = (): string => {
  // 1. Explicit environment variable takes highest precedence
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // 2. Browser / WebView runtime checks
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;

    // Inside Capacitor native Android container (capacitor://localhost or http://localhost on native)
    const isCapacitorNative =
      (window as any).Capacitor?.isNativePlatform?.() ||
      protocol === "capacitor:" ||
      protocol === "file:";

    if (isCapacitorNative) {
      // Native production APK defaults to secure production backend
      return "https://pashuposhann.vercel.app/api/v1";
    }

    // Local development web server
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000/api/v1";
    }
  }

  // 3. Fallback production backend
  return "https://pashuposhann.vercel.app/api/v1";
};

export const apiFetch = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint.startsWith("http") ? cleanEndpoint : `${base}${cleanEndpoint.replace(/^\/api\/v1/, "")}`;
  return fetch(url, options);
};
