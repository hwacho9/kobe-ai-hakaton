import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    LoginResponse,
    RegisterResponse,
    User,
    UserAdditionalInfo,
} from "@/types/auth";
import {
    loginUser,
    registerUser,
    updateUserAdditionalInfo,
} from "@/utils/api/auth";

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    registrationStep: number;

    login: (
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>;
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>;
    updateUserInfo: (
        userInfo: UserAdditionalInfo
    ) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    clearError: () => void;
    setRegistrationStep: (step: number) => void;
}

// 모의 사용자 정보 생성 함수
const createMockUser = (email: string, username?: string): User => {
    return {
        userId: `user-${Date.now()}`,
        username: username || email.split("@")[0],
        email: email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: [],
    };
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
            registrationStep: 1,

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

                    if (response.ok) {
                        const data = await response.json();
                        // Store token and set authenticated state
                        set({
                            isAuthenticated: true,
                            token: data.access_token,
                            error: null,
                            isLoading: false,
                            // If user data is returned, use it; otherwise create a mock user
                            user: data.user || {
                                userId: "user-id",
                                username: email.split("@")[0],
                                email: email,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                preferences: [],
                            },
                        });
                        return { success: true };
                    } else {
                        // 오류 처리
                        let errorMessage =
                            "ログイン失敗。アカウント情報を確認してください。";
                        try {
                            const errorData = await response.json();
                            errorMessage =
                                errorData.detail ||
                                errorData.message ||
                                errorMessage;
                        } catch (e) {
                            // JSON 파싱 실패 시 기본 오류 메시지 사용
                            console.error("ログインレスポンスの解析エラー:", e);
                        }

                        set({
                            error: errorMessage,
                            isLoading: false,
                        });
                        return {
                            success: false,
                            message: errorMessage,
                        };
                    }
                } catch (error) {
                    console.error("ログインエラー:", error);
                    const errorMessage =
                        "ネットワークエラー。もう一度お試しください。";
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return {
                        success: false,
                        message: errorMessage,
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

                    // Use the API client function instead of direct fetch
                    const response = await registerUser(
                        username,
                        email,
                        password
                    );

                    // If we get here, registration was successful
                    set({
                        isAuthenticated: true,
                        token: response.access_token || null, // Set token from response
                        error: null,
                        isLoading: false,
                        user: {
                            userId: response.userId,
                            username: response.username,
                            email: response.email,
                            createdAt: response.createdAt,
                            updatedAt: response.updatedAt,
                            preferences: response.preferences || [],
                        },
                        registrationStep: 2, // Move to the next registration step
                    });

                    return { success: true };
                } catch (error: any) {
                    console.error("会員登録エラー:", error);

                    // Handle different error types
                    let errorMessage =
                        "会員登録に失敗しました。もう一度お試しください。";

                    if (error.message) {
                        if (
                            error.message.includes("Email already registered")
                        ) {
                            errorMessage =
                                "このメールアドレスは既に登録されています。";
                        } else if (error.message.includes("Network Error")) {
                            errorMessage =
                                "ネットワークエラー。サーバーに接続できません。";
                        } else {
                            errorMessage = error.message;
                        }
                    }

                    set({
                        error: errorMessage,
                        isLoading: false,
                    });

                    return {
                        success: false,
                        message: errorMessage,
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

            updateUserInfo: async (userInfo: UserAdditionalInfo) => {
                try {
                    set({ isLoading: true, error: null });

                    // Get token from state
                    const token = get().token;
                    if (!token) {
                        const errorMessage =
                            "認証トークンがありません。もう一度ログインしてください。";
                        set({
                            error: errorMessage,
                            isLoading: false,
                        });
                        return {
                            success: false,
                            message: errorMessage,
                        };
                    }

                    // Call API to update user info
                    const updatedUser = await updateUserAdditionalInfo(
                        userInfo
                    );

                    // Update state
                    set({
                        user: updatedUser,
                        error: null,
                        isLoading: false,
                        registrationStep: 3, // Registration complete
                    });

                    return { success: true };
                } catch (error: any) {
                    console.error("ユーザー情報更新エラー:", error);
                    const errorMessage =
                        error.message ||
                        "ネットワークエラー。もう一度お試しください。";
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return {
                        success: false,
                        message: errorMessage,
                    };
                }
            },

            setRegistrationStep: (step: number) =>
                set({ registrationStep: step }),
        }),
        {
            name: "auth-storage",
            skipHydration: true,
        }
    )
);
