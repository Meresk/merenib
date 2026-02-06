import { apiFetch } from "./client";
import type { User } from "./types";

export function listUsers() {
  return apiFetch<User[]>("/users");
}

export function getUser(id: number) {
  return apiFetch<User>(`/users/${id}`);
}

export function createUser(login: string, password: string) {
  return apiFetch<User>("/users", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
}

export function updateUser(
  id: number,
  data: { login?: string; password?: string }
) {
  return apiFetch<void>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteUser(id: number) {
  return apiFetch<void>(`/users/${id}`, {
    method: "DELETE",
  });
}
