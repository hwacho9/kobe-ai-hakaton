import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserProfile } from "@/utils/api/profile";
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

export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [eventsData, setEventsData] = useState<any>(null);

    // Helper function to convert artist ID to name
    const getArtistName = (artistId: string) => {
        return ARTIST_MAP[artistId] || artistId;
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Fetch profile and events data
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch profile and events in parallel
                const [profileResult, eventsResult] = await Promise.all([
                    getUserProfile(),
                    getUpcomingEvents(),
                ]);

                setProfileData(profileResult);
                setEventsData(eventsResult);
            } catch (err: any) {
                console.error("データ取得エラー:", err);
                setError(err.message || "データの取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="container max-w-5xl mx-auto p-4 flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">データを読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-5xl mx-auto p-4">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                    <p className="font-medium">エラーが発生しました</p>
                    <p>{error}</p>
                </div>
                <Button onClick={() => router.push("/")}>ホームに戻る</Button>
            </div>
        );
    }

    // Extract user data
    const user = profileData?.user;
    const area = profileData?.area || "未設定";
    const contentInterests = profileData?.content_interests || [];
    const artistPreferences = user?.preferences || [];

    return (
        <div className="container max-w-5xl mx-auto p-4 pb-20">
            <h1 className="text-2xl font-bold mb-6 text-center">
                ダッシュボード
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-medium mb-4">
                                プロフィール
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        ユーザー名
                                    </p>
                                    <p className="font-medium">
                                        {user?.username}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        メールアドレス
                                    </p>
                                    <p className="font-medium">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        活動地域
                                    </p>
                                    <p className="font-medium">{area}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="font-medium mb-3">
                                興味のあるコンテンツ
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {contentInterests.length > 0 ? (
                                    contentInterests.map((interest: string) => (
                                        <span
                                            key={interest}
                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                                            {interest}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">未設定</p>
                                )}
                            </div>

                            <h3 className="font-medium mb-3">
                                好きなアーティスト
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {artistPreferences.length > 0 ? (
                                    artistPreferences.map((pref: any) => (
                                        <span
                                            key={pref.artistId}
                                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                                            {getArtistName(pref.artistId)}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">未設定</p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <Button
                                onClick={() => router.push("/profile")}
                                variant="outline"
                                className="w-full">
                                プロフィール詳細
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Events Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-medium mb-2">
                                予測イベント
                            </h2>
                            <p className="text-gray-500 text-sm mb-4">
                                あなたの好みに基づいた今後のイベント予測
                            </p>
                        </div>

                        <div className="p-6">
                            {eventsData?.predictions?.length > 0 ? (
                                <div className="space-y-6">
                                    {eventsData.predictions.map(
                                        (prediction: any, index: number) => (
                                            <div
                                                key={index}
                                                className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                                <h3 className="text-lg font-semibold mb-3">
                                                    {prediction.artist}
                                                </h3>

                                                {prediction.predicted_events
                                                    .length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {prediction.predicted_events.map(
                                                            (
                                                                event: any,
                                                                eventIndex: number
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        eventIndex
                                                                    }
                                                                    className="bg-gray-50 p-3 rounded border border-gray-100">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="font-medium">
                                                                            {event.event_type ===
                                                                            "album"
                                                                                ? "アルバム"
                                                                                : event.event_type ===
                                                                                  "meeting"
                                                                                ? "ファンミーティング"
                                                                                : event.event_type ===
                                                                                  "live"
                                                                                ? "ライブ"
                                                                                : event.event_type}
                                                                        </span>
                                                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                                                                            {
                                                                                event.date
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600">
                                                                        場所:{" "}
                                                                        {
                                                                            event.location
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500">
                                                        予測イベントがありません
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        イベント予測データがありません
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <Button
                                onClick={() => router.push("/events-test")}
                                variant="outline"
                                className="w-full">
                                イベント詳細
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={() => router.push("/")}>ホームに戻る</Button>
            </div>
        </div>
    );
}
