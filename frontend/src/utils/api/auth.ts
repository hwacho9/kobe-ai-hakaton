import { LoginResponse, RegisterResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * 사용자 등록 함수
 */
export async function registerUser(
    username: string,
    email: string,
    password: string
): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "회원가입 중 오류가 발생했습니다");
    }

    return response.json();
}

/**
 * 로그인 함수
 */
export async function loginUser(
    email: string,
    password: string
): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "로그인 중 오류가 발생했습니다");
    }

    return response.json();
}

/**
 * 인증된 요청을 보내는 함수
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    // 로컬 스토리지에서 토큰 가져오기
    const authStore = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const token = authStore?.state?.token;

    // 헤더에 인증 토큰 추가
    const headers = {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // 401 에러 처리 (인증 만료)
    if (response.status === 401) {
        // 로그아웃 처리 로직 추가 가능
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
        throw new Error("인증이 만료되었습니다");
    }

    return response;
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getCurrentUser() {
    const response = await fetchWithAuth(`${API_URL}/api/auth/me`);

    if (!response.ok) {
        throw new Error("사용자 정보를 가져오는데 실패했습니다");
    }

    return response.json();
}
