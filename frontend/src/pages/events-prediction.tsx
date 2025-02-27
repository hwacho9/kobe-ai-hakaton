import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUpcomingEvents } from "@/utils/api/events";
import { useAuthStore } from "@/utils/stores/authStore";
import { Button } from "@/components/ui/Button";

// Artist ID to name mapping
const ARTIST_MAP: Record<string, string> = {
    blackpink: "BLACKPINK",
    bts: "BTS",
    twice: "TWICE",
    exo: "EXO",
    redvelvet: "Red Velvet",
    nct: "NCT",
    aespa: "aespa",
    gidle: "(G)I-DLE",
    ive: "IVE",
    seventeen: "SEVENTEEN",
    newjeans: "NewJeans",
    txt: "TXT",
};

// Event type mapping for display
const EVENT_TYPE_MAP: Record<string, string> = {
    album: "アルバム",
    meeting: "ファンミーティング",
    live: "ライブ",
    goods: "グッズ",
};

export default function EventsPrediction() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventsData, setEventsData] = useState<any>(null);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Fetch events data
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const data = await getUpcomingEvents();
                setEventsData(data);
            } catch (err: any) {
                console.error("イベント情報取得エラー:", err);
                setError(err.message || "イベント情報の取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [isAuthenticated, router]);

    // Helper function to format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";

        const [year, month] = dateStr.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);

        return new Intl.DateTimeFormat("ja-JP", {
            year: "numeric",
            month: "long",
        }).format(date);
    };

    // Helper function to get event type display name
    const getEventTypeName = (type: string) => {
        return EVENT_TYPE_MAP[type] || type;
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">
                        イベント予測データを読み込み中...
                    </p>
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
                <Button onClick={() => router.push("/")}>ホームに戻る</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
                イベント予測
            </h1>

            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-lg">
                    <span className="font-semibold">あなたの活動地域:</span>{" "}
                    {eventsData?.user_area || "未設定"}
                </p>
                {eventsData?.user_content_interests?.length > 0 && (
                    <p className="text-lg mt-2">
                        <span className="font-semibold">
                            興味のあるコンテンツ:
                        </span>{" "}
                        {eventsData.user_content_interests.join(", ")}
                    </p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                    ※
                    これらの予測は現在から2年以内のイベントに基づいています。実際のイベントとは異なる場合があります。
                </p>
            </div>

            {eventsData?.predictions?.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {eventsData.predictions.map(
                        (prediction: any, index: number) => (
                            <div
                                key={index}
                                className="bg-white shadow-md rounded-lg overflow-hidden">
                                <div className="p-4 bg-purple-100 border-b border-purple-200">
                                    <h2 className="text-xl font-bold text-purple-800">
                                        {prediction.artist}
                                    </h2>
                                    <p className="text-sm text-purple-600 mt-1">
                                        予測イベント数:{" "}
                                        {prediction.predicted_events?.length ||
                                            0}
                                    </p>
                                </div>

                                <div className="p-4">
                                    {prediction.predicted_events &&
                                    prediction.predicted_events.length > 0 ? (
                                        <div className="space-y-4">
                                            {prediction.predicted_events.map(
                                                (
                                                    event: any,
                                                    eventIndex: number
                                                ) => (
                                                    <div
                                                        key={eventIndex}
                                                        className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="font-medium text-lg">
                                                                {getEventTypeName(
                                                                    event.event_type
                                                                )}
                                                            </span>
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                                                                {formatDate(
                                                                    event.date
                                                                )}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">
                                                                場所:
                                                            </span>{" "}
                                                            {event.location}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">
                                            予測イベントがありません
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg p-8 text-center mb-8">
                    <p className="text-gray-500">
                        イベント予測データがありません
                    </p>
                </div>
            )}

            <div className="flex justify-center">
                <Button onClick={() => router.push("/")}>ホームに戻る</Button>
            </div>
        </div>
    );
}
