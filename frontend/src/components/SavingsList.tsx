import { MonthlySaving } from "../types";

type SavingsListProps = {
  savings: MonthlySaving[];
};

export default function SavingsList({ savings }: SavingsListProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-gray-300">
        前月までの貯金額
      </h2>
      <div className="flex flex-col items-center">
        {savings.map((saving) => (
          <div
            key={saving.month}
            className="w-64 h-12 bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-between px-4 mb-2 text-white"
          >
            <span>{saving.month}</span>
            <span>{saving.amount.toLocaleString()}円</span>
          </div>
        ))}
      </div>
    </section>
  );
}
