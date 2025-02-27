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
    const [predictedEvents, setPredictedEvents] = useState<any[]>([]);
    const [userArea, setUserArea] = useState<string>("");
    const [selectedEvents, setSelectedEvents] = useState<
        Map<string, Set<number>>
    >(new Map());

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
                console.log("Fetched events data:", data);

                setPredictedEvents(data.predictions || []);
                setUserArea(data.user_area || "東京");
            } catch (err: any) {
                console.error("Events fetch error:", err);
                setError(err.message || "イベント情報の取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [isAuthenticated, router]);

    // Event selection handling
    const toggleEventSelection = (artistIndex: number, eventIndex: number) => {
        setSelectedEvents((prevSelected) => {
            const newSelected = new Map(prevSelected);
            const artistKey = artistIndex.toString();

            if (!newSelected.has(artistKey)) {
                newSelected.set(artistKey, new Set([eventIndex]));
            } else {
                const artistEvents = new Set(newSelected.get(artistKey));
                if (artistEvents.has(eventIndex)) {
                    artistEvents.delete(eventIndex);
                } else {
                    artistEvents.add(eventIndex);
                }

                if (artistEvents.size === 0) {
                    newSelected.delete(artistKey);
                } else {
                    newSelected.set(artistKey, artistEvents);
                }
            }

            return newSelected;
        });
    };

    // Check if an event is selected
    const isEventSelected = (
        artistIndex: number,
        eventIndex: number
    ): boolean => {
        const artistKey = artistIndex.toString();
        return (
            selectedEvents.has(artistKey) &&
            selectedEvents.get(artistKey)!.has(eventIndex)
        );
    };

    // Count selected events
    const countSelectedEvents = (): number => {
        let count = 0;
        selectedEvents.forEach((events) => {
            count += events.size;
        });
        return count;
    };

    // Handle costs calculation
    const handleCalculateCosts = () => {
        // Alert if no events are selected
        if (countSelectedEvents() === 0) {
            alert("イベントを選択してください");
            return;
        }

        // Configure selected event data
        const selectedEventData: { artist: string; events: any[] }[] = [];

        selectedEvents.forEach((eventIndices, artistIndex) => {
            const artist = predictedEvents[parseInt(artistIndex)];
            const selectedEventsForArtist = Array.from(eventIndices).map(
                (eventIndex) => {
                    return artist.predicted_events[eventIndex];
                }
            );

            selectedEventData.push({
                artist: artist.artist,
                events: selectedEventsForArtist,
            });
        });

        // Save selected event data to session storage
        sessionStorage.setItem(
            "costCalculationData",
            JSON.stringify({
                artist: selectedEventData[0].artist, // Use first artist only
                events: selectedEventData[0].events,
            })
        );

        // Redirect to costs calculation page
        router.push("/cost-calculation");
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">イベントを予測中...</p>
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
                    <Button onClick={() => router.push("/")}>
                        ホームに戻る
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
                予測されたイベント
            </h1>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-800">
                    <span className="font-semibold">地域:</span> {userArea}
                </p>
                <p className="text-blue-800 mt-2">
                    経費計算のために参加したいイベントを選択してください。
                </p>
            </div>

            {predictedEvents.length > 0 ? (
                <div className="space-y-8 mb-8">
                    {predictedEvents.map((artist, artistIndex) => (
                        <div
                            key={artist.artist}
                            className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="bg-indigo-600 text-white p-4">
                                <h2 className="text-xl font-bold">
                                    {artist.artist}
                                </h2>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-lg mb-3">
                                    予測されたイベント
                                </h3>

                                {artist.predicted_events &&
                                artist.predicted_events.length > 0 ? (
                                    <div className="space-y-3">
                                        {artist.predicted_events.map(
                                            (
                                                event: any,
                                                eventIndex: number
                                            ) => (
                                                <div
                                                    key={`${artist.artist}-${eventIndex}`}
                                                    className={`p-3 border rounded-md cursor-pointer transition duration-150 ${
                                                        isEventSelected(
                                                            artistIndex,
                                                            eventIndex
                                                        )
                                                            ? "bg-indigo-100 border-indigo-300"
                                                            : "hover:bg-gray-50"
                                                    }`}
                                                    onClick={() =>
                                                        toggleEventSelection(
                                                            artistIndex,
                                                            eventIndex
                                                        )
                                                    }>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    event.event_type
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {event.location}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {event.date}
                                                            </p>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full border border-indigo-500 flex items-center justify-center">
                                                            {isEventSelected(
                                                                artistIndex,
                                                                eventIndex
                                                            ) && (
                                                                <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        イベントが予測されていません
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg p-8 text-center mb-8">
                    <p className="text-gray-500">
                        予測されたイベントがありません
                    </p>
                </div>
            )}

            <div className="fixed bottom-6 right-6">
                <Button
                    onClick={handleCalculateCosts}
                    disabled={countSelectedEvents() === 0}
                    className="shadow-lg">
                    選択したイベントの費用を計算する ({countSelectedEvents()})
                </Button>
            </div>
        </div>
    );
}
