import { MonthlySaving } from "../types";

type SavingsListProps = {
  savings: MonthlySaving[];
};

export default function SavingsList({ savings }: SavingsListProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">前月までの貯金額</h2>
      <ul>
        {savings.map((saving) => (
          <li key={saving.month} className="mb-2">
            <span>{saving.month}: </span>
            <span>{saving.amount}円</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
