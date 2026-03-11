import { create } from "zustand";
import { apiClient } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "DEV" | "ADMIN" | "STUDENT";
  adminId: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User["role"]>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  login: async (email, password) => {
    const data = await apiClient.post<{ user: User; token: string }>("/auth/login", {
      email,
      password,
    });
    set({ user: data.user, token: data.token });
    return data.user.role;
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // ignore
    }
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));
