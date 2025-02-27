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

            setUser: (user) => set({ user, isAuthenticated: true }),

            setToken: (token) => set({ token }),

            clearError: () => set({ error: null }),

            login: async (email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await fetch(
                        "http://localhost:8000/api/auth/login",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ email, password }),
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        // 백엔드에서는 user 정보를 반환하지 않으므로 토큰만 저장하고 모의 사용자 정보 생성
                        set({
                            isAuthenticated: true,
                            token: data.access_token,
                            error: null,
                            isLoading: false,
                            // 모의 사용자 정보 생성
                            user: createMockUser(email),
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
                    const response = await fetch(
                        "http://localhost:8000/api/auth/register",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ username, email, password }),
                        }
                    );

                    if (response.ok) {
                        // 성공적인 응답 처리
                        let token = null;
                        try {
                            const data = await response.json();
                            token = data.access_token;
                        } catch (e) {
                            // JSON 파싱 실패 - 데이터가 없더라도 등록은 성공한 것으로 처리
                            console.warn(
                                "会員登録レスポンスの解析エラー（無視）:",
                                e
                            );
                        }

                        set({
                            isAuthenticated: true,
                            token: token, // 토큰이 없을 수도 있음
                            error: null,
                            isLoading: false,
                            // 모의 사용자 정보 생성
                            user: createMockUser(email, username),
                        });
                        return { success: true };
                    } else {
                        // 오류 처리
                        let errorMessage =
                            "会員登録に失敗しました。もう一度お試しください。";
                        try {
                            const errorData = await response.json();
                            errorMessage =
                                errorData.detail ||
                                errorData.message ||
                                errorMessage;
                        } catch (e) {
                            // JSON 파싱 실패 시 기본 오류 메시지 사용
                            console.error("会員登録レスポンスの解析エラー:", e);
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
                    console.error("会員登録エラー:", error);
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
