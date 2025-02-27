import { useEffect, useState } from "react";

type Event = {
  event_id: string;
  event_name: string;
  date: string;
  artist: {
    artist_id: string;
    artist_name: string;
  };
};

type SavingsCircleProps = {
  totalSavings: number;
  savingsGoal: number;
  userEvents: Event[];
};

export default function SavingsCircle({
  totalSavings,
  savingsGoal,
  userEvents,
}: SavingsCircleProps) {
  const [remainingSavings, setRemainingSavings] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);
  const [furthestEventDays, setFurthestEventDays] = useState(0);

  useEffect(() => {
    setRemainingSavings(savingsGoal - totalSavings);
    setProgressPercentage((totalSavings / savingsGoal) * 100);

    // イベントを日付順にソート
    if (userEvents && userEvents.length > 0) {
      const today = new Date();
      const futureEvents = userEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      });

      const sorted = [...futureEvents].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setSortedEvents(sorted);

      // 最も遠いイベントまでの日数を計算
      if (sorted.length > 0) {
        const furthestEvent = sorted[sorted.length - 1];
        const furthestDate = new Date(furthestEvent.date);
        const timeDiff = furthestDate.getTime() - today.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setFurthestEventDays(days > 0 ? days : 0);
      }
    }
  }, [totalSavings, savingsGoal, userEvents]);

  // 円の周囲の長さを計算
  const circumference = 2 * Math.PI * 45; // 半径を45と仮定
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  // イベントマーカーの位置を計算
  const getEventMarkerPosition = (eventIndex: number) => {
    if (sortedEvents.length === 0) return { x: 0, y: 0 };

    // 最初のイベントは25%、最後のイベントは100%の位置に配置
    const percentage =
      sortedEvents.length === 1
        ? 25
        : (eventIndex / (sortedEvents.length - 1)) * 75 + 25;

    // 円周上の位置を計算（角度をラジアンに変換）
    const angle = ((percentage / 100) * 360 - 90) * (Math.PI / 180);
    const radius = 45;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);

    return { x, y, percentage };
  };

  // イベント名を短縮
  const shortenEventName = (name: string) => {
    if (!name) return "";
    const words = name.split(" ");
    if (words.length <= 2) return name;

    // アーティスト名と主要な単語を抽出
    const artistWords = words.filter(
      (word) =>
        word.toUpperCase() === word || // 大文字の単語（アーティスト名の可能性）
        ["TOUR", "CONCERT", "LIVE", "FAN"].includes(word.toUpperCase())
    );

    return artistWords.slice(0, 2).join(" ");
  };

  return (
    <div className="relative inline-block w-full">
      <div className="relative w-3/4 mx-auto aspect-square">
        {/* 背景の円 */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="4"
            className="opacity-25"
          />
          {/* 進捗を示す円 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000 ease-in-out"
          />

          {/* イベントマーカー */}
          {sortedEvents.map((event, index) => {
            const { x, y } = getEventMarkerPosition(index);
            return (
              <g key={event.event_id}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="3"
                  className="font-bold"
                >
                  {new Date(event.date).toLocaleDateString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="2.5"
                >
                  {shortenEventName(event.event_name)}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
          <p className="text-lg font-bold">
            残り{totalSavings?.toLocaleString()}円
          </p>
          {furthestEventDays > 0 && (
            <p className="text-sm">あと{furthestEventDays}日</p>
          )}
        </div>
      </div>
    </div>
  );
}
