import { apiFetch } from "./client";
import type { User } from "./types";

export function login(login: string, password: string) {
  return apiFetch<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function me(): Promise<User> {
  return apiFetch<User>("/auth/me");
}
