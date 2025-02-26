import { Idol } from "../types";
import { ArtistCard } from "./ArtistCard";

type IdolListProps = {
  idols: Idol[];
};

export default function IdolList({ idols }: IdolListProps) {
  return (
    <section className="mb-8">
      <div className="flex overflow-x-auto space-x-4">
        {idols.map((idol) => (
          <ArtistCard key={idol.id} id={idol.id} name={idol.name} />
        ))}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 transition-all cursor-pointer w-32 h-32 flex items-center justify-center">
          <div className="text-center">
            <h3 className="font-semibold text-base">+</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
