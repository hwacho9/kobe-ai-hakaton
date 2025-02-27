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
import {
  getDashboardData,
  getUserInfo,
  getUserEventInfo,
} from "@/utils/mockApi";

type HomeProps = {
  idols: Idol[];
  dashboardData: any;
  userInfo: any;
  userEventInfo: any[];
};

export default function Home({
  idols = [],
  dashboardData,
  userInfo,
  userEventInfo,
}: HomeProps) {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  const remainingSavings = userInfo.savings_goal - userInfo.total_savings;

  return (
    <div className="min-h-screen bg-gray-900 text-white w-screen">
      <div className="max-w-md mx-auto p-4">
        <Header username={userInfo.username} />

        {isClient && (
          <div className="flex justify-end gap-3 mb-6">
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

        <div className="w-full">
          <SavingsCircle
            totalSavings={userInfo.total_savings}
            savingsGoal={userInfo.savings_goal}
            userEvents={userEventInfo}
          />
        </div>
        <IdolList idols={idols} />
        <SavingsList savings={userInfo.monthly_savings} />
        <Footer />
        <AddSavingButton />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
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
