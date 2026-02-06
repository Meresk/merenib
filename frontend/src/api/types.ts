export type AuthUser = {
  id: number;
  login: string;
  is_admin: boolean;
};

export type User = {
  id: number;
  login: string;
};

export interface Board {
  id: number;
  name: string;
  updated_at: string;
}

export interface BoardFull extends Board {
  data: string;
}