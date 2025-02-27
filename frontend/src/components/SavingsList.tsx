import React from "react";
import { MonthlySaving } from "../types";

type SavingsListProps = {
  savings: MonthlySaving[];
};

export default function SavingsList({ savings }: SavingsListProps) {
  return (
    <section className="mb-8">
      <div className="bg-white text-black rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">先月までの貯金</h2>
        <div className="space-y-2 text-sm">
          {savings.map((saving) => (
            <div key={saving.month} className="flex justify-between">
              <span>{saving.month}</span>
              <span>{saving.amount.toLocaleString()}円</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
