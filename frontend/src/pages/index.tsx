import { GetStaticProps } from "next";
import { Idol } from "../types";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import Header from "../components/Header";
import SavingsCircle from "../components/SavingsCircle";
import IdolList from "../components/IdolList";
import SavingsList from "../components/SavingsList";
import Footer from "../components/Footer";
import AddSavingButton from "../components/AddSavingButton";
import {
    getUserEventCosts,
    getSavingsHistory,
    SavingsHistory,
} from "@/utils/api/events";

type HomeProps = {
    idols: Idol[];
};

export default function Home({ idols = [] }: HomeProps) {
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isClient, setIsClient] = useState(false);
    const [userCosts, setUserCosts] = useState<any>(null);
    const [savingsHistory, setSavingsHistory] = useState<SavingsHistory[]>([]);
    const [isLoadingCosts, setIsLoadingCosts] = useState(true);
    const [isLoadingSavings, setIsLoadingSavings] = useState(true);

    useEffect(() => {
        setIsClient(true);
        if (isAuthenticated && user) {
            fetchUserCosts();
            fetchSavingsHistory();
        } else {
            setIsLoadingCosts(false);
            setIsLoadingSavings(false);
        }
    }, [isAuthenticated, user]);

    const fetchUserCosts = async () => {
        try {
            setIsLoadingCosts(true);
            const costsData = await getUserEventCosts();
            setUserCosts(costsData);
        } catch (error) {
            console.error("Failed to fetch user costs:", error);
        } finally {
            setIsLoadingCosts(false);
        }
    };

    const fetchSavingsHistory = async () => {
        try {
            setIsLoadingSavings(true);
            const historyData = await getSavingsHistory();
            setSavingsHistory(historyData.history);
        } catch (error) {
            console.error("Failed to fetch savings history:", error);
        } finally {
            setIsLoadingSavings(false);
        }
    };

    const handleSavingsAdded = () => {
        // 저금액 추가 후 데이터 새로고침
        fetchUserCosts();
        fetchSavingsHistory();
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const handleEventPrediction = () => {
        router.push("/events-prediction");
    };

    // ユーザーの設定した目標金額（なければデフォルト300,000円）
    const savingsGoal = userCosts?.total_estimated;
    // 現在の貯金額
    const totalSavings = userCosts?.total_savings || 0;

    console.log("userCosts", userCosts);

    // ダミーのイベント配列（Event 型に合わせる）
    const upcomingEvents = [
        {
            event_id: "1",
            event_name: "イベント1",
            date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45日後
            artist: { artist_id: "1", artist_name: "アーティスト1" },
        },
        {
            event_id: "2",
            event_name: "イベント2",
            date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90日後
            artist: { artist_id: "2", artist_name: "アーティスト2" },
        },
    ];

    return (
        // 外側のdivに min-h-screen とグラデーション背景を指定
        <div
            className="min-h-screen"
            style={{
                background:
                    "linear-gradient(to bottom, #000000 40%, #E8D8DC 40%)",
            }}>
            {/* コンテナ部分は通常の余白等の設定 */}
            <div className="container mx-auto p-4">
                {/* ヘッダー */}
                <Header username={user?.username} />

                {/* ヘッダー下にボタン群 */}
                {isClient && isAuthenticated && (
                    <div className="flex flex-col items-end mt-3">
                        <button
                            onClick={handleEventPrediction}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors mb-2">
                            イベント予測
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
                            logout
                        </button>
                    </div>
                )}

                {/* SavingsCircle コンポーネント（画面サイズが大きい場合に大きく表示） */}
                <div className="w-full md:w-3/4 mx-auto mb-6">
                    {isLoadingCosts ? (
                        <div className="text-center py-10">
                            <p>データロード中...</p>
                        </div>
                    ) : (
                        <SavingsCircle
                            totalSavings={totalSavings}
                            savingsGoal={savingsGoal}
                            userEvents={upcomingEvents}
                        />
                    )}
                </div>

                {/* アイドルリスト */}
                <IdolList idols={idols} />

                {/* 貯金履歴リスト */}
                <SavingsList
                    savings={savingsHistory}
                    isLoading={isLoadingSavings}
                />

                {/* フッター */}
                <Footer />

                {/* 貯金追加ボタン */}
                <AddSavingButton onSavingsAdded={handleSavingsAdded} />
            </div>
        </div>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const idols: Idol[] = [
        { id: "1", name: "BLACKPINK", image: "/images/blackpink.jpg" },
        { id: "2", name: "BTS", image: "/images/bts.jpg" },
    ];

    return {
        props: {
            idols,
        },
    };
};
