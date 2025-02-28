import { useEffect, useState } from "react";
import { SavingsHistory } from "@/utils/api/events";
import { formatDate } from "@/utils/dateUtils";

type SavingsListProps = {
    savings?: SavingsHistory[];
    isLoading?: boolean;
};

export default function SavingsList({
    savings = [],
    isLoading = false,
}: SavingsListProps) {
    const [groupedSavings, setGroupedSavings] = useState<
        Record<string, SavingsHistory[]>
    >({});

    // 저금 내역을 월별로 그룹화
    useEffect(() => {
        const grouped: Record<string, SavingsHistory[]> = {};

        savings.forEach((saving) => {
            // ISO 형식의 날짜에서 YYYY-MM 추출
            const date = new Date(saving.saved_at);
            const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }

            grouped[monthKey].push(saving);
        });

        setGroupedSavings(grouped);
    }, [savings]);

    // 그룹화된 월별 키를 내림차순으로 정렬
    const sortedMonths = Object.keys(groupedSavings).sort((a, b) =>
        b.localeCompare(a)
    );

    if (isLoading) {
        return (
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-2 text-black">
                    貯金履歴
                </h2>
                <div className="flex justify-center py-8">
                    <div className="animate-pulse bg-gray-300 h-12 w-72 rounded-lg"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-black">貯金履歴</h2>

            {savings.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                    まだ貯金履歴がありません。右下のボタンから貯金を追加してみましょう！
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    {sortedMonths.map((month) => {
                        const monthlySavings = groupedSavings[month];
                        const totalMonthAmount = monthlySavings.reduce(
                            (sum, item) => sum + item.amount,
                            0
                        );
                        const [year, monthNum] = month.split("-");
                        const displayMonth = `${year}/${parseInt(
                            monthNum,
                            10
                        )}`;

                        return (
                            <div key={month} className="w-full max-w-md mb-4">
                                <div className="w-72 mx-auto bg-white border border-gray-300 rounded-lg mb-2 filter drop-shadow-lg overflow-hidden">
                                    {/* 월 헤더 */}
                                    <div className="bg-purple-100 p-3 flex justify-between">
                                        <span className="text-gray-700 font-medium">
                                            {displayMonth}
                                        </span>
                                        <span className="font-semibold text-purple-700">{`${totalMonthAmount.toLocaleString(
                                            "ja-JP"
                                        )}円`}</span>
                                    </div>

                                    {/* 해당 월의 저금 목록 */}
                                    <div>
                                        {monthlySavings.map((saving) => (
                                            <div
                                                key={saving.id}
                                                className="border-t border-gray-200 p-3 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(
                                                            saving.saved_at
                                                        )}
                                                    </span>
                                                    {saving.memo && (
                                                        <span className="text-sm text-gray-700">
                                                            {saving.memo}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-black font-medium">{`+${saving.amount.toLocaleString(
                                                    "ja-JP"
                                                )}円`}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
