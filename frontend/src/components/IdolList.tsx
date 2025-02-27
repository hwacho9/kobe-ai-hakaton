import { Idol } from "../types";
import { ArtistCard } from "./ArtistCard";

type IdolListProps = {
  idols: Idol[];
};

export default function IdolList({ idols }: IdolListProps) {
  return (
    <section className="mb-8">
      <div className="flex justify-center overflow-x-auto space-x-4">
        {idols.map((idol) => (
          <ArtistCard key={idol.id} id={idol.id} name={idol.name} />
        ))}
        <div className="bg-white border border-white rounded-lg filter drop-shadow-lg transition-all cursor-pointer w-24 h-24 flex items-center justify-center">
          <div className="text-center">
            <h3 className="font-semibold text-base text-black">+</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
