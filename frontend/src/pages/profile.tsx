// pages/efilopr.tsx;
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { getUserProfile } from "@/utils/api/profile";
import ProfileHeader from "@/components/ProfileHeader";
import { Button } from "@/components/ui/Button";
import Footer from "@/components/Footer";
import Image from "next/image";
import { ARTIST_IMAGE_MAP } from "@/utils/constants";
import { ArtistCard } from "@/components/ArtistCard";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, user: authUser, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserProfile();
        setProfileData(data);
      } catch (err: any) {
        console.error("プロフィール取得エラー:", err);
        setError(err.message || "プロフィール情報を取得できませんでした。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEventPrediction = () => {
    router.push("/event-prediction");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#242424] text-white flex items-center justify-center">
        <p className="text-lg font-medium">プロフィール情報を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#242424] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">エラーが発生しました</p>
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/")}>ホームに戻る</Button>
      </div>
    );
  }
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const user = profileData?.user || authUser;
  const area = profileData?.area || "未設定";
  const interests = profileData?.content_interests || [];
  const artistPreferences = user?.preferences || [];
  const travelDistances = ["国内", "アジア", "世界"];

  return (
    <>
      <div className="min-h-screen bg-[#242424] text-white">
        <ProfileHeader />
        {isClient && isAuthenticated && (
          <div className="flex flex-row items-center space-x-4">
            <button
              onClick={handleEventPrediction}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors mb-2"
            >
              イベント予測
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              logout
            </button>
          </div>
        )}
        <div className="container max-w-md mx-auto px-4 ">
          {/* ユーザー情報カード */}
          <div className="bg-white text-[#242424] rounded-lg shadow-md p-4 mt-0 mb-0">
            <h2 className="text-lg font-bold mb-1">
              {user?.username || "No Name"}さん
            </h2>
            <p className="text-sm text-gray-700">{user?.email || "未設定"}</p>
            <p className="text-sm text-gray-700 mb-4">居住地域：{area}</p>
            <Button variant="default" className="bg-[#242424] text-white">
              ユーザー情報を確認・変更
            </Button>
          </div>
          {/* 好きなアーティスト */}
          <h3 className="text-base font-semibold mb-2">Artist</h3>
          <div className="flex space-x-4 mb-6 overflow-x-auto">
            {artistPreferences.map((pref: any) => {
              const artistId = pref.artistId.toLowerCase();
              const imageSrc =
                ARTIST_IMAGE_MAP[artistId] ?? "/images/default.jpg";

                        return (
                            <ArtistCard
                                key={pref.artistId}
                                id={pref.artistId}
                                name={pref.artistName || pref.artistId}
                                imageUrl={imageSrc}
                            />
                        );
                    })}
                    <div className="w-24 h-24 bg-[#242424] border border-gray-700 text-white rounded-lg flex items-center justify-center">
                        +
                    </div>
                </div>
            </div>
            {/* 推し活スタイルのタイトルをコンテナ外に表示 */}
            <h3 className="text-base font-semibold mb-2 px-4">
                推し活スタイル
            </h3>
            {/* イベントタイプのカード */}
            <div className="bg-gradient-to-b from-pink-400 to-pink-200 w-full px-4 py-6 rounded-t-3xl mb-4">
                <h3 className="text-base font-semibold mb-2 text-[#242424]">
                    イベントタイプ
                </h3>
                <div className="flex space-x-2 overflow-x-auto">
                    {interests.length > 0 ? (
                        interests.map((item: string) => (
                            <div
                                key={item}
                                className="bg-white text-[#242424] px-2 py-1 rounded-full text-sm whitespace-nowrap">
                                {item}
                            </div>
                        ))
                    ) : (
                        <span className="text-[#242424]">未設定</span>
                    )}
                </div>
            </div>
            {/* 遠征距離のカード
            <div className="bg-gradient-to-b from-pink-400 to-pink-200 w-full px-4 py-6 rounded-t-3xl -mt-4">
                <h3 className="text-base font-semibold mb-2 text-[#242424]">
                    遠征距離
                </h3>
                <div className="flex space-x-2 overflow-x-auto">
                    {travelDistances.length > 0 ? (
                        travelDistances.map((item: string) => (
                            <div
                                key={item}
                                className="bg-white text-[#242424] px-2 py-1 rounded-full text-sm whitespace-nowrap">
                                {item}
                            </div>
                        ))
                    ) : (
                        <span className="text-[#242424]">未設定</span>
                    )}
                </div>
            </div> */}
            <Footer />
        </div>
    );
}
