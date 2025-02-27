import React, { useEffect, useState } from "react";

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
  const [remainingMonths, setRemainingMonths] = useState(4); // 仮の残り月数

  useEffect(() => {
    setRemainingSavings(savingsGoal - totalSavings);
    setProgressPercentage((totalSavings / savingsGoal) * 100);

    // 残り月数を計算する場合はロジックを実装
    // setRemainingMonths(...);
  }, [totalSavings, savingsGoal]);

  return (
    <div className="flex flex-col items-center mt-4 mb-6">
      <div className="relative w-56 h-56">
        {/* ピンク色の円 */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f472b6" // ピンク
            strokeWidth="5"
          />
        </svg>

        {/* 中央テキスト */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm">目標達成まで</p>
          <p className="text-2xl font-bold text-pink-300">
            {remainingSavings.toLocaleString()}円
          </p>
          <p className="text-sm">残り {remainingMonths}ヶ月</p>
        </div>
      </div>
    </div>
  );
}
