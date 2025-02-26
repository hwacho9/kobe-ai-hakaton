import { Idol } from "../types";

type IdolListProps = {
  idols: Idol[];
};

export default function IdolList({ idols }: IdolListProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">推し登録してるアイドル</h2>
      <div className="flex overflow-x-auto space-x-4">
        {idols.map((idol) => (
          <div key={idol.id} className="flex-shrink-0 w-24">
            <img
              src={idol.image}
              alt={idol.name}
              className="w-24 h-24 rounded-full"
            />
            <p className="text-center">{idol.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
