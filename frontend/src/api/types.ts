export type User = {
  id: number;
  login: string;
  is_admin: boolean;
};

export interface Board {
  id: number;
  name: string;
  updated_at: string;
}

export interface BoardFull extends Board {
  data: string;
}