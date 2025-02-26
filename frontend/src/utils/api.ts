import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터 - 인증 토큰 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 인증 관련 API
export const authApi = {
    // 회원가입
    register: async (userData: {
        username: string;
        email: string;
        password: string;
    }) => {
        try {
            const response = await api.post("/api/auth/register", userData);
            return response.data;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    },

    // 로그인
    login: async (credentials: { email: string; password: string }) => {
        try {
            const response = await api.post("/api/auth/login", credentials);
            const { access_token } = response.data;

            // 토큰 저장
            if (access_token) {
                localStorage.setItem("token", access_token);
            }

            return response.data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    // 로그아웃
    logout: () => {
        localStorage.removeItem("token");
    },
};

export default api;
