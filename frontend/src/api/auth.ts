import { apiFetch } from "./client";
import type { AuthUser } from "./types";

export function login(login: string, password: string) {
  return apiFetch<AuthUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function me(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/me");
}
