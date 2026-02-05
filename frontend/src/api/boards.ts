import { apiFetch } from "./client";
import type { Board, BoardFull } from "./types";


export function listBoards() {
    return apiFetch<Board[]>('/boards');
}


export function createBoard(name: string) {
    return apiFetch<{ id: number; name: string }>('/boards', {
        method: 'POST',
        body: JSON.stringify({ name, data: '' }),
    });
}


export function getBoard(id: number) {
    return apiFetch<BoardFull>(`/boards/${id}`);
}


export function updateBoard(id: number, data: string, name?: string) {
    return apiFetch<void>(`/boards/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, data }),
    });
}


export function deleteBoard(id: number) {
    return apiFetch<void>(`/boards/${id}`, {
        method: 'DELETE',
    });
}