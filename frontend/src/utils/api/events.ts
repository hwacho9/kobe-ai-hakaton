import { User } from "@/types/auth";

// 환경 변수에서 API URL과 모크 API 사용 여부 가져오기
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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

export interface UpcomingEvent {
    event_id: string;
    event_type: string;
    location: string;
    date: string;
    estimated_cost: {
        transportation: number;
        ticket: number;
        hotel: number;
        other: number;
    };
    total_estimated: number;
    confidence: string;
}

export interface UpcomingGood {
    goods_id: string;
    name: string;
    release_date: string;
    estimated_price: number;
}

export interface CostData {
    id: string;
    user_id: string;
    artist: string;
    calculation_date: string;
    upcoming_events: UpcomingEvent[];
    upcoming_goods: UpcomingGood[];
    total_estimated: number;
    recommendation: string;
    saved_at: string;
}

export interface UserCostsResponse {
    costs: CostData[];
    total_estimated: number;
    count: number;
}

// 저금 내역 타입 정의
export interface SavingsHistory {
    id: string;
    amount: number;
    memo?: string;
    saved_at: string;
}

export interface SavingsHistoryResponse {
    history: SavingsHistory[];
    total: number;
    current_savings: number;
    count: number;
}

export interface AddSavingsResponse {
    message: string;
    current_savings: number;
    added_amount: number;
}

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

        const response = await fetch(`${API_BASE_URL}/api/events/upcoming`, {
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

/**
 * 여러 이벤트의 비용을 계산하는 함수
 * @param params 아티스트 이름과 이벤트 목록
 * @returns 계산된 비용 정보
 */
export async function getMultipleEventsCost(params: {
    artist: string;
    events: any[];
}): Promise<any> {
    try {
        // 실제 API 호출
        const token = localStorage.getItem("auth-storage")
            ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state
                  ?.token
            : null;

        if (!token) {
            throw new Error("認証トークンがありません");
        }

        console.log("Making request to backend API with params:", params);

        const response = await fetch(
            `${API_BASE_URL}/api/events/multiple-costs`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            }
        );

        console.log("Backend API response status:", response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error("Backend API error response:", data);
            throw new Error(data.detail || "費用計算に失敗しました");
        }

        return data;
    } catch (error: any) {
        console.error("複数イベント費用計算エラー:", error);
        throw error;
    }
}

/**
 * 계산된 비용 데이터를 저장하는 함수
 * @param costData 저장할 비용 데이터
 * @returns 저장 결과
 */
export async function saveCostData(costData: any): Promise<any> {
    try {
        // 실제 API 호출
        const token = localStorage.getItem("auth-storage")
            ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state
                  ?.token
            : null;

        if (!token) {
            throw new Error("認証トークンがありません");
        }

        console.log("Saving cost data to backend:", costData);

        const response = await fetch(`${API_BASE_URL}/api/events/save-cost`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(costData),
        });

        console.log("Save cost data response status:", response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error("Save cost data error response:", data);
            throw new Error(data.detail || "費用データの保存に失敗しました");
        }

        return data;
    } catch (error: any) {
        console.error("費用データ保存エラー:", error);
        throw error;
    }
}

/**
 * 사용자의 저장된 비용 데이터를 가져오는 함수
 * @returns 사용자의 저장된 비용 데이터
 */
export async function getUserEventCosts(): Promise<UserCostsResponse> {
    try {
        // 실제 API 호출
        const token = localStorage.getItem("auth-storage")
            ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state
                  ?.token
            : null;

        if (!token) {
            throw new Error("認証トークンがありません");
        }

        console.log("Fetching user cost data from backend");

        const response = await fetch(`${API_BASE_URL}/api/events/user-costs`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Get user costs response status:", response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error("Get user costs error response:", data);
            throw new Error(data.detail || "費用データの取得に失敗しました");
        }

        return data;
    } catch (error: any) {
        console.error("費用データ取得エラー:", error);
        throw error;
    }
}

/**
 * 저금 내역을 가져오는 API 호출
 * @returns 저금 내역 목록과 총 저금액
 */
export async function getSavingsHistory(): Promise<{
    history: SavingsHistory[];
    total: number;
}> {
    try {
        const token = localStorage.getItem("auth-storage")
            ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state
                  ?.token
            : null;

        if (!token) {
            throw new Error("認証トークンがありません");
        }

        console.log("Fetching savings history from backend");

        const response = await fetch(`${API_BASE_URL}/api/savings/history`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "貯金履歴の取得に失敗しました");
        }

        const data = await response.json();
        console.log("Savings history data:", data);
        return data;
    } catch (error: any) {
        console.error("Failed to fetch savings history:", error);
        throw error;
    }
}

/**
 * 새 저금액을 추가하는 API 호출
 * @param amount 저금액
 * @param memo 메모 (선택사항)
 * @returns 추가된 저금 정보
 */
export async function addSavings(
    amount: number,
    memo?: string
): Promise<{ success: boolean; message: string }> {
    try {
        const token = localStorage.getItem("auth-storage")
            ? JSON.parse(localStorage.getItem("auth-storage") || "{}").state
                  ?.token
            : null;

        if (!token) {
            throw new Error("認証トークンがありません");
        }

        console.log(`Adding savings: ${amount}円, memo: ${memo}`);

        const response = await fetch(`${API_BASE_URL}/api/savings/add`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount,
                memo: memo || "",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "貯金の追加に失敗しました");
        }

        const data = await response.json();
        console.log("Savings added:", data);
        return data;
    } catch (error: any) {
        console.error("Failed to add savings:", error);
        throw error;
    }
}
