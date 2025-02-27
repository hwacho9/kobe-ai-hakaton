import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUpcomingEvents } from "@/utils/api/events";
import { useAuthStore } from "@/utils/stores/authStore";

export default function EventsTest() {
    const [events, setEvents] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Fetch events
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getUpcomingEvents();
                setEvents(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "イベント情報の取得に失敗しました"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [isAuthenticated, router]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">イベント予測テスト</h1>

            {loading && (
                <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            )}

            {events && (
                <div>
                    <div className="mb-4">
                        <p className="text-lg">
                            <strong>ユーザーエリア:</strong> {events.user_area}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {events.predictions.map(
                            (prediction: any, index: number) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 shadow-sm">
                                    <h2 className="text-xl font-bold mb-3">
                                        {prediction.artist}
                                    </h2>

                                    {prediction.predicted_events.length > 0 ? (
                                        <div>
                                            <h3 className="font-semibold mb-2">
                                                予測イベント:
                                            </h3>
                                            <div className="space-y-3">
                                                {prediction.predicted_events.map(
                                                    (
                                                        event: any,
                                                        eventIndex: number
                                                    ) => (
                                                        <div
                                                            key={eventIndex}
                                                            className="bg-gray-50 p-3 rounded">
                                                            <p>
                                                                <strong>
                                                                    日付:
                                                                </strong>{" "}
                                                                {event.date}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    タイプ:
                                                                </strong>{" "}
                                                                {
                                                                    event.event_type
                                                                }
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    場所:
                                                                </strong>{" "}
                                                                {event.location}
                                                            </p>
                                                        </div>
                                                    )
                                                )}
                                            </div>
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
                </div>
            )}

            <div className="mt-8">
                <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                    ホームに戻る
                </button>
            </div>
        </div>
    );
}
