import { User } from "@/types/auth";

// 환경 변수에서 API URL과 모크 API 사용 여부 가져오기
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// 모의 데이터
const MOCK_PROFILE = {
    user: {
        userId: "mock-user-1",
        username: "テストユーザー",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: [
            {
                artistId: "blackpink",
                interests: ["アルバム", "グッズ", "ファンミーティング"],
            },
            {
                artistId: "bts",
                interests: ["アルバム", "グッズ", "ファンミーティング"],
            },
            {
                artistId: "twice",
                interests: ["アルバム", "グッズ", "ファンミーティング"],
            },
        ],
    },
    area: "東京",
    content_interests: ["アルバム", "グッズ", "ファンミーティング"],
};

/**
 * 사용자 프로필 정보를 가져오는 함수
 * @returns 사용자 프로필 정보 (기본 정보 + 추가 정보)
 */
export async function getUserProfile(): Promise<any> {
    try {
        if (USE_MOCK_API) {
            console.log("Using mock API for getUserProfile");
            // 모의 응답 지연
            await new Promise((resolve) => setTimeout(resolve, 500));
            return MOCK_PROFILE;
        }

        // 실제 API 호출
        const token = localStorage.getItem("auth-storage")
            ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state
                  ?.token
            : null;

        if (!token) {
            throw new Error(
                "認証トークンがありません。再度ログインしてください。"
            );
        }

        const response = await fetch(`${API_URL}/api/users/profile`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(
                    "認証の有効期限が切れました。再度ログインしてください。"
                );
            }
            throw new Error("プロフィール情報の取得に失敗しました。");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("プロフィール情報取得エラー:", error);
        throw error;
    }
}
