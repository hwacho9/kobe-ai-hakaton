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

    if (userEvents && userEvents.length > 0) {
      const today = new Date();
      const futureEvents = userEvents.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      });
      const sorted = [...futureEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setSortedEvents(sorted);

      if (sorted.length > 0) {
        const furthestEvent = sorted[sorted.length - 1];
        const furthestDate = new Date(furthestEvent.date);
        const timeDiff = furthestDate.getTime() - today.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setFurthestEventDays(days > 0 ? days : 0);
      }
    }
  }, [totalSavings, savingsGoal, userEvents]);

  // 円のサイズと中心
  const radius = 80;
  const center = 100;
  const strokeWidthBg = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;
  const outerEdge = radius + strokeWidthBg / 2;
  const innerEdge = radius - strokeWidthBg / 2;

  const progressAngle = (progressPercentage / 100) * 360 - 90;
  const markerX = center + radius * Math.cos((progressAngle * Math.PI) / 180);
  const markerY = center + radius * Math.sin((progressAngle * Math.PI) / 180);

  return (
    <div className="relative inline-block w-full">
      <div className="relative w-full mx-auto aspect-square">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <defs>
            <linearGradient
              id="progressGradient"
              gradientUnits="objectBoundingBox"
              gradientTransform={`rotate(${progressAngle}, 0.5, 0.5)`}
            >
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="#F8A4BD" />
            </linearGradient>
          </defs>

          {/* 円の上部に「目標: 〇〇円」を表示 */}
          <text x={center} y="40" fill="white" fontSize="7" textAnchor="middle">
            目標: {savingsGoal.toLocaleString()}円
          </text>

          {/* 背景の円（未達成部分：グレー） */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#ccc"
            strokeWidth={strokeWidthBg}
            opacity="1"
          />

          {/* 達成済み部分を示すグラデーション円 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-1000 ease-in-out"
          />

          {/* 現在の貯金額位置マーカー */}
          <circle
            cx={markerX}
            cy={markerY}
            r="4"
            fill="black"
            stroke="#F8A4BD"
            strokeWidth="2"
          />

          {/* 各イベントの線と内側ラベル */}
          {sortedEvents.map((event, index) => {
            // 最初のイベントの場合は固定で37.5%、そうでなければ通常の計算式
            const percentage =
              sortedEvents.length > 1 && index === 0
                ? 37.5
                : sortedEvents.length === 1
                ? 25
                : (index / (sortedEvents.length - 1)) * 75 + 25;
            const angle = ((percentage / 100) * 360 - 90) * (Math.PI / 180);

            // 始点と終点は円の枠（外側から内側）に合わせる
            const lineOuterX = center + outerEdge * Math.cos(angle);
            const lineOuterY = center + outerEdge * Math.sin(angle);
            const lineInnerX = center + innerEdge * Math.cos(angle);
            const lineInnerY = center + innerEdge * Math.sin(angle);

            // ラベル配置（円の内側）
            const labelOffset = 30;
            const extraX = 10; // 右に10pxシフト
            const extraY = 10; // 上に10pxシフト（Yは上方向が小さいので引く）
            const labelX =
              center + (radius + labelOffset) * Math.cos(angle) + extraX;
            const labelY =
              center + (radius + labelOffset) * Math.sin(angle) - extraY;

            const eventMonth = new Date(event.date).getMonth() + 1;
            const eventCost = Math.floor(
              ((index + 1) / sortedEvents.length) * savingsGoal
            );

            return (
              <g key={event.event_id}>
                <line
                  x1={lineOuterX}
                  y1={lineOuterY}
                  x2={lineInnerX}
                  y2={lineInnerY}
                  stroke="black"
                  strokeWidth="1"
                />
                {index < sortedEvents.length - 1 && (
                  <text
                    x={labelX}
                    y={labelY}
                    fill="white"
                    fontSize="7"
                    dominantBaseline="middle"
                    textAnchor={
                      Math.cos(angle) > 0.1
                        ? "end"
                        : Math.cos(angle) < -0.1
                        ? "start"
                        : "middle"
                    }
                  >
                    <tspan x={labelX} dy="0">
                      {eventMonth}月まで：
                    </tspan>
                    <tspan x={labelX} dy="1.2em">
                      {eventCost.toLocaleString()}円
                    </tspan>
                  </text>
                )}
              </g>
            );
          })}

          {/* 円の右側に「＞」 */}
          <text
            x={center + radius + 10}
            y={center + 5}
            fill="white"
            fontSize="10"
            fontWeight="bold"
            textAnchor="start"
          >
            &gt;
          </text>
        </svg>
        <div className="text-center absolute top-[50%]  left-1/2 -translate-x-1/2 -translate-y-1/2 text-white leading-[4] tracking-wide">
          <p className="text-2xl">
            <span className="opacity-75 block mb-4 text-base">
              目標達成まで
            </span>
            <span className="font-bold block text-4xl">
              {remainingSavings.toLocaleString()}円
            </span>
          </p>
          {furthestEventDays > 0 && (
            <p className="text-base mt-5">
              <span className="block">残り</span>
              <span className="block text-2xl">
                {Math.ceil(furthestEventDays / 30)}ヶ月
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
