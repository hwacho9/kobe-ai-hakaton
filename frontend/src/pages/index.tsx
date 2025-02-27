import { GetStaticProps } from "next";
import { Idol, MonthlySaving } from "../types";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthStore } from "@/utils/stores/authStore";
import Header from "../components/Header";
import SavingsCircle from "../components/SavingsCircle";
import IdolList from "../components/IdolList";
import SavingsList from "../components/SavingsList";
import Footer from "../components/Footer";
import AddSavingButton from "../components/AddSavingButton";
import { getUserEventCosts } from "@/utils/api/events";

type HomeProps = {
    idols: Idol[];
    savings: MonthlySaving[];
};

export default function Home({ idols = [], savings = [] }: HomeProps) {
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isClient, setIsClient] = useState(false);
    const [userCosts, setUserCosts] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsClient(true);

        // 사용자가 인증되었을 때 이벤트 비용 데이터 가져오기
        if (isAuthenticated && user) {
            fetchUserCosts();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, user]);

    // 사용자의 이벤트 비용 데이터 가져오기
    const fetchUserCosts = async () => {
        try {
            setIsLoading(true);
            const costsData = await getUserEventCosts();
            setUserCosts(costsData);
        } catch (error) {
            console.error("Failed to fetch user costs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const handleEventPrediction = () => {
        router.push("/events-prediction");
    };

    // 예상 목표 금액 (userCosts.total_estimated 사용)
    const savingsGoal = userCosts?.total_estimated || 300000;

    // 현재 저축 금액 (월별 저축 데이터의 합계)
    const totalSavings = savings.reduce(
        (total, item) => total + item.amount,
        0
    );

    console.log("userCosts", userCosts);

    // 이벤트 데이터 변환
    const upcomingEvents =
        userCosts?.costs && userCosts.costs.length > 0
            ? userCosts.costs[0].upcoming_events?.map((event: any) => ({
                  event_id: event.event_id,
                  event_name: `${userCosts.costs[0].artist} ${event.event_type}`,
                  date: event.date,
                  artist: {
                      artist_id: "artist1",
                      artist_name: userCosts.costs[0].artist,
                  },
              })) || []
            : [];

    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6">
                <Header username={user?.username} />
                {isClient && (
                    <div className="flex gap-3">
                        {isAuthenticated ? (
                            <>
                                <span className="mr-2">
                                    Hi, {user?.username || "user"}
                                </span>
                                <button
                                    onClick={handleEventPrediction}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors mr-2">
                                    イベント予測
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
                                    logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                    login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
                                    sign up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full md:w-1/2 mx-auto mb-6">
                {isLoading ? (
                    <div className="text-center py-10">
                        <p>データロード中...</p>
                    </div>
                ) : (
                    <SavingsCircle
                        totalSavings={userCosts?.total_estimated}
                        savingsGoal={savingsGoal}
                        userEvents={upcomingEvents}
                    />
                )}
            </div>
            <IdolList idols={idols} />
            <SavingsList savings={savings} />
            <Footer />
            <AddSavingButton />
        </div>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const idols: Idol[] = [
        { id: "1", name: "BLACKPINK", image: "/images/idolA.jpg" },
        { id: "2", name: "BTS", image: "/images/idolB.jpg" },
    ];

    const savings: MonthlySaving[] = [
        { month: "2023-01", amount: 50000 },
        { month: "2023-02", amount: 60000 },
        { month: "2023-03", amount: 70000 },
        { month: "2023-04", amount: 80000 },
        { month: "2023-05", amount: 90000 },
        { month: "2023-06", amount: 100000 },
        { month: "2023-07", amount: 110000 },
        { month: "2023-08", amount: 120000 },
        { month: "2023-09", amount: 130000 },
        { month: "2023-10", amount: 140000 },
        { month: "2023-11", amount: 150000 },
        { month: "2023-12", amount: 160000 },
    ];

    return {
        props: {
            idols,
            savings,
        },
    };
};
