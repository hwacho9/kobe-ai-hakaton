import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserEventCosts } from "@/utils/api/events";
import { useAuthStore } from "@/utils/stores/authStore";
import { Button } from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DetailPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [costsData, setCostsData] = useState<any>(null);

    useEffect(() => {
        // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // 비용 데이터 가져오기
        fetchCostsData();
    }, [isAuthenticated, router]);

    // 비용 데이터 가져오는 함수
    const fetchCostsData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getUserEventCosts();
            console.log("Fetched costs data:", data);
            setCostsData(data);
        } catch (err: any) {
            console.error("詳細データの取得エラー:", err);
            setError(err.message || "費用データの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";

        // 날짜 형식이 "2025年03月" 형태인 경우
        if (dateStr.includes("年") && dateStr.includes("月")) {
            return dateStr;
        }

        // 날짜 형식이 "2025-03" 형태인 경우
        const parts = dateStr.split("-");
        if (parts.length >= 2) {
            return `${parts[0]}年${parts[1]}月`;
        }

        return dateStr;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#242424]">
                <Header username={user?.username} />
                <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh] text-white">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-lg font-medium">
                            費用データを読み込み中...
                        </p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#242424]">
                <Header username={user?.username} />
                <div className="container mx-auto px-4 py-8 text-white">
                    <div className="bg-red-900 border border-red-600 text-white px-4 py-3 rounded mb-4">
                        <p className="font-bold">エラーが発生しました</p>
                        <p>{error}</p>
                    </div>
                    <div className="flex justify-center">
                        <Button onClick={() => router.push("/")}>
                            ホームに戻る
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // 비용 데이터가 없는 경우
    const hasCostsData = costsData?.costs && costsData.costs.length > 0;

    return (
        <div className="min-h-screen bg-[#242424] text-white">
            <Header username={user?.username} />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    推しイベント費用の詳細
                </h1>

                {!hasCostsData ? (
                    <div className="bg-gray-800 shadow-lg rounded-lg p-8 text-center mb-8">
                        <p className="text-gray-400 mb-4">
                            まだイベント予測と費用計算が行われていません
                        </p>
                        <Button
                            onClick={() => router.push("/events-prediction")}>
                            イベント予測を始める
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">
                                    総費用:
                                </span>
                                <span className="text-xl font-bold text-green-400">
                                    {costsData.total_estimated.toLocaleString()}
                                    円
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            {costsData.costs.map(
                                (costData: any, costIndex: number) => (
                                    <div
                                        key={costData.id || costIndex}
                                        className="mb-8 bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
                                        <div className="bg-gray-700 p-4 border-b border-gray-600">
                                            <h2 className="text-xl font-bold text-white">
                                                {costData.artist}の費用見積もり
                                            </h2>
                                            <p className="text-sm text-gray-300">
                                                計算日:{" "}
                                                {new Date(
                                                    costData.calculation_date
                                                ).toLocaleDateString("ja-JP")}
                                            </p>
                                            {costData.recommendation && (
                                                <p className="mt-2 text-green-400">
                                                    {costData.recommendation}
                                                </p>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            {/* イベントセクション */}
                                            <h3 className="font-bold text-lg mb-3">
                                                イベント
                                            </h3>
                                            {costData.upcoming_events?.length >
                                            0 ? (
                                                <div className="space-y-4 mb-6">
                                                    {costData.upcoming_events.map(
                                                        (
                                                            event: any,
                                                            index: number
                                                        ) => (
                                                            <div
                                                                key={
                                                                    event.event_id ||
                                                                    index
                                                                }
                                                                className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {
                                                                                event.event_type
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm text-gray-300">
                                                                            {
                                                                                event.location
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm text-gray-300">
                                                                            {formatDate(
                                                                                event.date
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-green-400">
                                                                            {event.total_estimated.toLocaleString()}
                                                                            円
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">
                                                                            信頼度:{" "}
                                                                            {event.confidence ||
                                                                                "中"}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-3 pt-3 border-t border-gray-600">
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <div>
                                                                            <p className="text-gray-400">
                                                                                交通費:
                                                                            </p>
                                                                            <p className="font-medium">
                                                                                {event.estimated_cost.transportation.toLocaleString()}

                                                                                円
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-400">
                                                                                チケット:
                                                                            </p>
                                                                            <p className="font-medium">
                                                                                {event.estimated_cost.ticket.toLocaleString()}

                                                                                円
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-400">
                                                                                宿泊費:
                                                                            </p>
                                                                            <p className="font-medium">
                                                                                {event.estimated_cost.hotel.toLocaleString()}

                                                                                円
                                                                            </p>
                                                                        </div>
                                                                        {event
                                                                            .estimated_cost
                                                                            .other && (
                                                                            <div>
                                                                                <p className="text-gray-400">
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
                                                <p className="text-gray-400 mb-4">
                                                    イベントが選択されていません
                                                </p>
                                            )}

                                            {/* グッズセクション */}
                                            {costData.upcoming_goods?.length >
                                                0 && (
                                                <>
                                                    <h3 className="font-bold text-lg mb-3">
                                                        グッズ
                                                    </h3>
                                                    <div className="space-y-2 mb-4">
                                                        {costData.upcoming_goods.map(
                                                            (
                                                                good: any,
                                                                index: number
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        good.goods_id ||
                                                                        index
                                                                    }
                                                                    className="bg-gray-700 p-3 rounded border border-gray-600 flex justify-between">
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {
                                                                                good.name
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm text-gray-300">
                                                                            {formatDate(
                                                                                good.release_date
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <p className="font-bold text-green-400">
                                                                        {good.estimated_price.toLocaleString()}
                                                                        円
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold">
                                                        イベント総費用:
                                                    </span>
                                                    <span className="text-xl font-bold text-green-400">
                                                        {costData.total_estimated.toLocaleString()}
                                                        円
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
