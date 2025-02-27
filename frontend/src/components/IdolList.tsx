import React from "react";
import { ArtistCard } from "./ArtistCard";

// データ構造は実際のイベント・アイドルに合わせて調整
type Event = {
  event_id: string;
  event_name: string;
  date: string;
  artist: {
    artist_id: string;
    artist_name: string;
  };
};

type IdolListProps = {
  events: Event[];
};

export default function IdolList({ events }: IdolListProps) {
  return (
    <section className="mb-8 px-1">
      <div className="flex overflow-x-auto space-x-4">
        {events.map((event) => (
          <ArtistCard
            key={event.event_id}
            id={event.artist.artist_id}
            // アーティスト名 or イベント名を表示したい場合に変更
            name={event.artist.artist_name}
          />
        ))}

        {/* 「＋」カード */}
        <div className="flex-shrink-0 w-24 h-24 bg-white text-black rounded-lg flex items-center justify-center">
          +
        </div>
      </div>
    </section>
  );
}
