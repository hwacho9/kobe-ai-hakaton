import React, { useEffect, useState } from "react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthStore } from "@/utils/stores/authStore";

// 既存コンポーネント
import Header from "@/components/Header";
import SavingsCircle from "@/components/SavingsCircle";
import IdolList from "@/components/IdolList";
import SavingsList from "@/components/SavingsList";
import Footer from "@/components/Footer";
import AddSavingButton from "@/components/AddSavingButton";

// モックAPI
import {
  getDashboardData,
  getUserInfo,
  getUserEventInfo,
} from "@/utils/mockApi";

// 型定義の例（必要に応じて types を拡張）
import { Idol, MonthlySaving } from "@/types";

type Event = {
  event_id: string;
  event_name: string;
  date: string;
  artist: {
    artist_id: string;
    artist_name: string;
  };
};

interface HomeProps {
  idols: Idol[];
  dashboardData: any;
  userInfo: {
    username: string;
    total_savings: number;
    savings_goal: number;
    monthly_savings: MonthlySaving[];
    [key: string]: any;
  };
  userEventInfo: Event[];
}

export const getStaticProps: GetStaticProps = async () => {
  // サンプルのアイドルデータ（不要なら削除してOK）
  const idols: Idol[] = [
    { id: "1", name: "BLACKPINK", image: "/images/idolA.jpg" },
    { id: "2", name: "BTS", image: "/images/idolB.jpg" },
  ];

  const dashboardData = await getDashboardData();
  const userInfo = await getUserInfo();
  const userEventInfo = await getUserEventInfo();

  return {
    props: {
      idols,
      dashboardData,
      userInfo,
      userEventInfo,
    },
  };
};

export default function Home({
  idols,
  dashboardData,
  userInfo,
  userEventInfo,
}: HomeProps) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // SSR と CSR の判別用フラグ
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // データがまだない場合のローディング
  if (!userInfo) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="relative min-h-screen bg-black text-white pb-24">
      {/* ヘッダー */}
      <Header username={userInfo.username} />

      {/* ログイン・ログアウトなどのボタン */}
      {isClient && (
        <div className="flex justify-end gap-3 px-4 mb-4">
          {isAuthenticated ? (
            <>
              <span className="mr-2">Hi, {user?.username || "user"}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                login
              </Link>
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                sign up
              </Link>
            </>
          )}
        </div>
      )}

      {/* 貯金円グラフ */}
      <div className="px-4">
        <SavingsCircle
          totalSavings={userInfo.total_savings}
          savingsGoal={userInfo.savings_goal}
          userEvents={userEventInfo}
        />
      </div>

      {/* アイドル一覧（実際はイベント情報を渡している例） */}
      <div className="px-4">
        <IdolList events={userEventInfo} />
      </div>

      {/* 先月までの貯金 */}
      <div className="px-4">
        <SavingsList savings={userInfo.monthly_savings} />
      </div>

      {/* 貯金追加ボタン */}
      <div className="px-4 my-4">
        <AddSavingButton />
      </div>

      {/* フッター */}
      <Footer />
    </div>
  );
}
