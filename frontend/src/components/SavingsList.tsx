import { MonthlySaving } from "../types";

type SavingsListProps = {
  savings: MonthlySaving[];
};

export default function SavingsList({ savings }: SavingsListProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-black">
        前月までの貯金額
      </h2>
      <div className="flex flex-col items-center">
        {savings.map((saving) => {
          const [year, month] = saving.month.split("-");
          const displayMonth = `${year}/${parseInt(month, 10)}`;
          const formattedAmount = saving.amount.toLocaleString("ja-JP");
          return (
            <div
              key={saving.month}
              className="w-72 h-12 bg-white border border-gray-300 rounded-lg flex items-center px-4 mb-2"
            >
              <div className="w-1/3 text-left">
                <span className="text-xs text-gray-400">{displayMonth}</span>
              </div>
              <div className="w-1/3 text-center">
                <span className="text-black">{`+${formattedAmount}円`}</span>
              </div>
              <div className="w-1/3 text-right">
                <span className="text-black text-xl">⋮</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
