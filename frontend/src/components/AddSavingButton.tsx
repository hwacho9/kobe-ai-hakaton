import { Coins, Plus } from "lucide-react";

export default function AddSavingButton() {
  return (
    <button
      className="
        fixed bottom-20 right-4
        bg-black hover:bg-gray-800
        text-white
        rounded-lg
        w-12 h-12
        flex items-center justify-center
        filter drop-shadow-lg
      "
    >
      <div className="relative">
        {/* コインアイコン */}
        <Coins className="h-6 w-6" />
        {/* プラスアイコンを右上に寄せて重ねる */}
        <Plus className="h-3 w-3 absolute -top-1 -right-1" />
      </div>
    </button>
  );
}
