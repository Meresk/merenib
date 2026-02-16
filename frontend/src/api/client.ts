const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(API_URL + path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let error: any = null;
    try {
      error = await res.json();
    } catch {
      error = { message: res.statusText };
    }
    throw error;
  }

  // Если тело пустое — возвращаем undefined
  if (res.status === 204 || res.headers.get("Content-Length") === "0") {
    return undefined as T;
  }

  // Проверим Content-Type, если не JSON — тоже возвращаем undefined
  const contentType = res.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/json")) {
    return undefined as T;
  }

  return res.json();
}

export async function apiFetchFile(
  path: string,
  options: RequestInit = {}
): Promise<Blob> {
  const res = await fetch(API_URL + path, {
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    throw new Error(`File request failed: ${res.statusText}`);
  }

  return res.blob();
}
