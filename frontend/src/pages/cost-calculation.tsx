import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getMultipleEventsCost, saveCostData } from "@/utils/api/events";
import { useAuthStore } from "@/utils/stores/authStore";
import { Button } from "@/components/ui/Button";

export default function CostCalculation() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [costData, setCostData] = useState<any>(null);
    const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
    const [artistName, setArtistName] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // 세션 스토리지에서 선택한 이벤트 정보 가져오기
        const storedData = sessionStorage.getItem("costCalculationData");
        if (!storedData) {
            setError(
                "選択されたイベント情報が見つかりません。イベント予測ページに戻ってください。"
            );
            setIsLoading(false);
            return;
        }

        const parsedData = JSON.parse(storedData);
        setSelectedEvents(parsedData.events || []);
        setArtistName(parsedData.artist || "");

        // 경비 계산 API 호출
        const calculateCosts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                setSaveSuccess(false);

                console.log("Calculating costs for:", parsedData);

                const result = await getMultipleEventsCost({
                    artist: parsedData.artist,
                    events: parsedData.events,
                });

                console.log("Cost calculation result:", result);

                // 결과 저장
                setCostData(result);

                // 자동으로 Cosmos DB에 결과 저장
                await saveCostDataToDb(result);
            } catch (err: any) {
                console.error("費用計算エラー:", err);
                setError(err.message || "費用の計算に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };

        calculateCosts();
    }, [isAuthenticated, router]);

    // Cosmos DB에 결과 저장하는 함수
    const saveCostDataToDb = async (data: any) => {
        try {
            setIsSaving(true);

            // 저장 API 호출
            const result = await saveCostData(data);

            console.log("Save result:", result);
            setSaveSuccess(true);
        } catch (err: any) {
            console.error("費用データ保存エラー:", err);
            // 저장 실패해도 계산 결과는 표시
        } finally {
            setIsSaving(false);
        }
    };

    // Helper function to format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";

        // 날짜 형식이 "2025年03月" 형태인 경우
        if (dateStr.includes("年") && dateStr.includes("月")) {
            return dateStr;
        }

        // 날짜 형식이 "2025-03" 형태인 경우
        const [year, month] = dateStr.split("-");
        if (year && month) {
            return `${year}年${month}月`;
        }

        return dateStr;
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">費用を計算中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">エラーが発生しました</p>
                    <p>{error}</p>
                </div>
                <div className="flex justify-center">
                    <Button onClick={() => router.push("/events-prediction")}>
                        イベント予測ページに戻る
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
                費用見積もり結果
            </h1>

            {saveSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">保存完了</p>
                    <p>費用データが正常に保存されました</p>
                </div>
            )}

            {costData ? (
                <div className="mb-8 bg-white shadow-lg rounded-lg overflow-hidden border border-green-200">
                    <div className="bg-green-100 p-4 border-b border-green-200">
                        <h2 className="text-xl font-bold text-green-800">
                            {costData.artist}の費用見積もり
                        </h2>
                        {costData.recommendation && (
                            <p className="mt-2 text-green-700">
                                {costData.recommendation}
                            </p>
                        )}
                    </div>

                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-3">イベント</h3>
                        {costData.upcoming_events?.length > 0 ? (
                            <div className="space-y-4 mb-6">
                                {costData.upcoming_events.map(
                                    (event: any, index: number) => (
                                        <div
                                            key={event.event_id || index}
                                            className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium">
                                                        {event.event_type}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {event.location}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(event.date)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-700">
                                                        {event.total_estimated.toLocaleString()}
                                                        円
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        信頼度:{" "}
                                                        {event.confidence ||
                                                            "中"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">
                                                            交通費:
                                                        </p>
                                                        <p className="font-medium">
                                                            {event.estimated_cost.transportation.toLocaleString()}
                                                            円
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">
                                                            チケット:
                                                        </p>
                                                        <p className="font-medium">
                                                            {event.estimated_cost.ticket.toLocaleString()}
                                                            円
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">
                                                            宿泊費:
                                                        </p>
                                                        <p className="font-medium">
                                                            {event.estimated_cost.hotel.toLocaleString()}
                                                            円
                                                        </p>
                                                    </div>
                                                    {event.estimated_cost
                                                        .other && (
                                                        <div>
                                                            <p className="text-gray-600">
                                                                その他:
                                                            </p>
                                                            <p className="font-medium">
                                                                {event.estimated_cost.other.toLocaleString()}
                                                                円
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 mb-4">
                                イベントが選択されていません
                            </p>
                        )}

                        {costData.upcoming_goods?.length > 0 && (
                            <>
                                <h3 className="font-bold text-lg mb-3">
                                    グッズ
                                </h3>
                                <div className="space-y-2 mb-4">
                                    {costData.upcoming_goods.map(
                                        (good: any, index: number) => (
                                            <div
                                                key={good.goods_id || index}
                                                className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {good.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(
                                                            good.release_date
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-green-700">
                                                    {good.estimated_price.toLocaleString()}
                                                    円
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </>
                        )}

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">
                                    総費用:
                                </span>
                                <span className="text-xl font-bold text-green-700">
                                    {costData.total_estimated.toLocaleString()}
                                    円
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg p-8 text-center mb-8">
                    <p className="text-gray-500">費用データがありません</p>
                </div>
            )}

            <div className="flex justify-center space-x-4">
                <Button onClick={() => router.push("/events-prediction")}>
                    イベント予測に戻る
                </Button>
                <Button onClick={() => router.push("/")} variant="outline">
                    ホームに戻る
                </Button>
            </div>
        </div>
    );
}
