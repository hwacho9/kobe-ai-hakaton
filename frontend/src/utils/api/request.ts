import { useAuthStore } from "../stores/authStore";

interface RequestOptions extends RequestInit {
    token?: string;
}

export async function request<T>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    // Get token from store if available and not already provided
    if (!options.token) {
        const token = useAuthStore.getState().token;
        if (token) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    }

    // Set default headers if not provided
    if (!options.headers) {
        options.headers = {
            "Content-Type": "application/json",
        };
    }

    try {
        const response = await fetch(url, options);

        // 응답 처리 - 다양한 형식 대응
        try {
            // 먼저 JSON으로 파싱 시도
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();

                if (!response.ok) {
                    throw {
                        status: response.status,
                        statusText: response.statusText,
                        detail: data.detail || data.message || "API 요청 실패",
                    };
                }

                return data as T;
            } else {
                // JSON이 아닌 응답 처리
                const text = await response.text();

                if (!response.ok) {
                    throw {
                        status: response.status,
                        statusText: response.statusText,
                        detail: text || response.statusText,
                    };
                }

                // 빈 응답이면 빈 객체 반환
                return (text ? JSON.parse(text) : {}) as T;
            }
        } catch (parseError) {
            // JSON 파싱 실패 또는 기타 처리 오류
            console.error("Response parsing error:", parseError);
            throw {
                status: response.status,
                statusText: response.statusText,
                detail: "응답 데이터 파싱 오류",
                original: parseError,
            };
        }
    } catch (error) {
        console.error("API request error:", error);
        throw error;
    }
}

export default request;
