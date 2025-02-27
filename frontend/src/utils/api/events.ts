import { User } from "@/types/auth";

// 환경 변수에서 API URL과 모크 API 사용 여부 가져오기
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// 모의 데이터
const MOCK_EVENTS = {
    user_area: "東京",
    predictions: [
        {
            artist: "BLACKPINK",
            predicted_events: [
                {
                    date: "2024-09",
                    event_type: "live",
                    location: "Seoul",
                },
                {
                    date: "2024-12",
                    event_type: "album",
                    location: "Global",
                },
            ],
        },
        {
            artist: "BTS",
            predicted_events: [
                {
                    date: "2024-10",
                    event_type: "album",
                    location: "Global",
                },
                {
                    date: "2025-01",
                    event_type: "meeting",
                    location: "Tokyo",
                },
            ],
        },
    ],
};

/**
 * 사용자의 선호도에 기반한 예정된 이벤트를 가져오는 함수
 * @returns 예정된 이벤트 정보
 */
export async function getUpcomingEvents(): Promise<any> {
    try {
        if (USE_MOCK_API) {
            console.log("Using mock API for getUpcomingEvents");
            // 모의 응답 지연
            await new Promise((resolve) => setTimeout(resolve, 500));
            return MOCK_EVENTS;
        }

        // 실제 API 호출
        const token = localStorage.getItem("auth-storage")
            ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state
                  ?.token
            : null;

        if (!token) {
            console.error("Frontend: No token available in localStorage");
            throw new Error(
                "認証トークンがありません。再度ログインしてください。"
            );
        }

        console.log("Frontend: Making request to Next.js API route with token");

        const response = await fetch(`${API_URL}/api/events/upcoming`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Frontend: API response status:", response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error("Frontend: API error response:", data);
            if (response.status === 401) {
                throw new Error(
                    "認証の有効期限が切れました。再度ログインしてください。"
                );
            }
            throw new Error(
                data.message || "イベント情報の取得に失敗しました。"
            );
        }

        return data;
    } catch (error) {
        console.error("イベント情報取得エラー:", error);
        throw error;
    }
}
