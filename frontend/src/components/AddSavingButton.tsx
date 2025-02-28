import { Coins, Plus, X } from "lucide-react";
import { useState } from "react";
import { addSavings } from "@/utils/api/events";

type AddSavingButtonProps = {
    onSavingsAdded?: () => void;
};

export default function AddSavingButton({
    onSavingsAdded,
}: AddSavingButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [memo, setMemo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const openModal = () => {
        setIsModalOpen(true);
        setError("");
        setAmount("");
        setMemo("");
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 금액 유효성 검사
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError("金額は1円以上で入力してください");
            return;
        }

        try {
            setIsLoading(true);
            await addSavings(Number(amount), memo);
            setIsLoading(false);
            closeModal();

            // 저금 추가 후 콜백 실행
            if (onSavingsAdded) {
                onSavingsAdded();
            }
        } catch (err: any) {
            setIsLoading(false);
            setError(err.message || "貯金の追加に失敗しました");
        }
    };

    return (
        <>
            <button
                onClick={openModal}
                className="
          fixed bottom-20 right-4
          bg-black hover:bg-gray-800
          text-white
          rounded-lg
          w-12 h-12
          flex items-center justify-center
          filter drop-shadow-lg
          z-10
        ">
                <div className="relative">
                    {/* コインアイコン */}
                    <Coins className="h-6 w-6" />
                    {/* プラスアイコンを右上に寄せて重ねる */}
                    <Plus className="h-3 w-3 absolute -top-1 -right-1" />
                </div>
            </button>

            {/* モーダル */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                貯金を追加
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4">
                            {error && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="mb-4">
                                <label
                                    htmlFor="amount"
                                    className="block text-sm font-medium text-gray-700 mb-1">
                                    金額 (円)
                                </label>
                                <input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="例: 10000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label
                                    htmlFor="memo"
                                    className="block text-sm font-medium text-gray-700 mb-1">
                                    メモ (任意)
                                </label>
                                <input
                                    id="memo"
                                    type="text"
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="例: バイト代"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50">
                                    {isLoading ? "保存中..." : "保存する"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
