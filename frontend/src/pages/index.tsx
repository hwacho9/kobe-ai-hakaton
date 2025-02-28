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
    // 외측의 div는 #242424 배경으로 시작
    <div className="min-h-screen bg-[#242424]">
      {/* 컨테이너 부분은 정상적인 여백 등의 설정 */}
      <div className="container mx-auto p-4">
        {/* 헤더 */}
        <Header username={user?.username} />

        {/* SavingsCircle 컴포넌트 - #242424 배경 유지 */}
        <div className="w-full md:w-3/4 mx-auto mb-6">
          {isLoadingCosts ? (
            <div className="text-center py-10 text-white">
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

        {/* 아이돌 목록부터 배경색 변경 */}
        <div className="bg-[#E8D8DC] pt-5 pb-10 -mx-4 px-4">
          {/* 아이돌 리스트 */}
          <IdolList idols={idols} />

          {/* 저금 내역 리스트 */}
          <SavingsList savings={savingsHistory} isLoading={isLoadingSavings} />
        </div>

        {/* 푸터 */}
        <Footer />

        {/* 저금 추가 버튼 */}
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
