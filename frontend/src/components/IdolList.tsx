import { Idol } from "../types";
import { ArtistCard } from "./ArtistCard";
// fans-user-event-info から取得したイベントデータを Props として受け取る場合
type IdolListProps = {
  // idols の代わりにイベント情報の配列を受け取る
  events: {
    event_id: string;
    event_name: string;
    artist: {
      artist_id: string;
      artist_name: string;
    };
  }[];
};

export default function IdolList({ events }: IdolListProps) {
  return (
    <section className="mb-8">
      <div className="flex overflow-x-auto space-x-4">
        {events.map((event) => (
          <ArtistCard
            key={event.event_id}
            id={event.artist.artist_id}
            name={event.event_name} // イベント名を表示
          />
        ))}
        <div className="bg-gray-700 border border-gray-700 rounded-lg shadow-sm p-3 transition-all cursor-pointer w-32 h-32 flex items-center justify-center text-white">
          <div className="text-center">
            <h3 className="font-semibold text-base">+</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
