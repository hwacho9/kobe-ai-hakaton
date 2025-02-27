import {
    LoginResponse,
    RegisterResponse,
    User,
    UserAdditionalInfo,
} from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * 사용자 등록 함수
 */
export async function registerUser(
    username: string,
    email: string,
    password: string
): Promise<RegisterResponse> {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Registration failed");
        }

        const data = await response.json();

        // Create a full RegisterResponse from backend data
        return {
            email: email,
            username: username,
            userId: data.userId || "user-id",
            fullName: null,
            profileImage: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            preferences: [],
            access_token: data.access_token,
            token_type: "bearer",
        };
    } catch (error) {
        throw error;
    }
}

/**
 * 로그인 함수
 */
export async function loginUser(
    email: string,
    password: string
): Promise<LoginResponse> {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Login failed");
        }

        const data = await response.json();

        // Create a full LoginResponse from the backend's access_token
        return {
            access_token: data.access_token,
            token_type: "bearer",
            user: {
                userId: "user-id",
                username: email.split("@")[0],
                email: email,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                preferences: [],
            },
        };
    } catch (error) {
        throw error;
    }
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

/**
 * 사용자 추가 정보 업데이트 함수
 */
export async function updateUserAdditionalInfo(
    userInfo: UserAdditionalInfo
): Promise<User> {
    try {
        // 로컬 스토리지에서 토큰 가져오기
        const authStore = JSON.parse(
            localStorage.getItem("auth-storage") || "{}"
        );
        const token = authStore?.state?.token;

        if (!token) {
            console.error("인증 토큰이 없습니다.");
            throw new Error("인증 토큰이 없습니다. 다시 로그인해주세요.");
        }

        const response = await fetch(`${API_URL}/api/auth/register/info`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userInfo),
        });

        if (!response.ok) {
            // Check if it's an authentication error
            if (response.status === 401) {
                // Try to refresh token or retry with another auth method
                console.error(
                    "인증이 만료되었습니다. 다시 로그인이 필요합니다."
                );
                throw new Error(
                    "認証が失効しました。再度ログインしてください。"
                );
            }

            const errorData = await response.json();
            throw new Error(
                errorData.detail || "사용자 정보 업데이트에 실패했습니다"
            );
        }

        return await response.json();
    } catch (error) {
        console.error("사용자 추가 정보 업데이트 오류:", error);
        throw error;
    }
}
