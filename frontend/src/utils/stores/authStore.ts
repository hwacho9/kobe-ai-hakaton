import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LoginResponse, RegisterResponse, User } from "@/types/auth";
import { loginUser, registerUser } from "@/utils/api/auth";

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    login: (
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>;
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,

            setUser: (user) => set({ user, isAuthenticated: true }),

            setToken: (token) => set({ token }),

            clearError: () => set({ error: null }),

            login: async (email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        set({
                            isAuthenticated: true,
                            user: data.user,
                            token: data.token,
                            error: null,
                            isLoading: false,
                        });
                        return { success: true };
                    } else {
                        set({
                            error:
                                data.message ||
                                "Login failed. Please check your credentials.",
                            isLoading: false,
                        });
                        return {
                            success: false,
                            message:
                                data.message ||
                                "Login failed. Please check your credentials.",
                        };
                    }
                } catch (error) {
                    console.error("Login error:", error);
                    set({
                        error: "Network error. Please try again.",
                        isLoading: false,
                    });
                    return {
                        success: false,
                        message: "Network error. Please try again.",
                    };
                }
            },

            register: async (
                username: string,
                email: string,
                password: string
            ) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username, email, password }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        set({
                            isAuthenticated: true,
                            user: data.user,
                            token: data.token,
                            error: null,
                            isLoading: false,
                        });
                        return { success: true };
                    } else {
                        set({
                            error:
                                data.message ||
                                "Registration failed. Please try again.",
                            isLoading: false,
                        });
                        return {
                            success: false,
                            message:
                                data.message ||
                                "Registration failed. Please try again.",
                        };
                    }
                } catch (error) {
                    console.error("Registration error:", error);
                    set({
                        error: "Network error. Please try again.",
                        isLoading: false,
                    });
                    return {
                        success: false,
                        message: "Network error. Please try again.",
                    };
                }
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    error: null,
                });
            },
        }),
        {
            name: "auth-storage", // localStorage에 저장될 키 이름
            skipHydration: true, // 클라이언트 측에서만 상태를 초기화
        }
    )
);
