// pages/profile.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { getUserProfile } from "@/utils/api/profile";
import ProfileHeader from "@/components/ProfileHeader";
import { Button } from "@/components/ui/Button";
import Footer from "@/components/Footer";
import Image from "next/image";

const ARTIST_IMAGE_MAP: Record<string, string> = {
  blackpink: "/images/blackpink.jpg",
  bts: "/images/bts.jpg",
  // 必要に応じて追加
};

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user: authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg font-medium">プロフィール情報を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">エラーが発生しました</p>
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/")}>ホームに戻る</Button>
      </div>
    );
  }

  // ユーザー情報
  const user = profileData?.user || authUser;
  const area = profileData?.area || "未設定";
  const interests = profileData?.content_interests || [];
  const artistPreferences = user?.preferences || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader />

      <div className="container max-w-md mx-auto px-4 pb-20">
        {/* ユーザー情報カード */}
        <div className="bg-white text-black rounded-lg shadow-md p-4 mt-4 mb-6">
          <h2 className="text-lg font-bold mb-1">
            {user?.username || "No Name"}さん
          </h2>
          <p className="text-sm text-gray-700">{user?.email || "未設定"}</p>
          <p className="text-sm text-gray-700 mb-4">居住地域：{area}</p>
          <Button variant="default" className="bg-black text-white">
            ユーザー情報を確認・変更
          </Button>
        </div>

        {/* 好きなアーティスト (画像付き) → タイトルを「Artist」に変更 */}
        <h3 className="text-base font-semibold mb-2">Artist</h3>
        <div className="flex space-x-4 mb-6">
          {artistPreferences.map((pref: any) => {
            const artistId = pref.artistId.toLowerCase();
            const imageSrc =
              ARTIST_IMAGE_MAP[artistId] ?? "/images/default.jpg";

            return (
              <div
                key={pref.artistId}
                className="w-20 h-20 bg-white text-black rounded-md flex items-center justify-center overflow-hidden"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={imageSrc}
                    alt={pref.artistName || pref.artistId}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            );
          })}
          {/* 追加ボタン (+) */}
          <div className="w-20 h-20 bg-white text-black rounded-md flex items-center justify-center">
            +
          </div>
        </div>

        {/* イベントタイプ → Artist より下に配置 */}
        <h3 className="text-base font-semibold mb-2">イベントタイプ</h3>
        <div className="flex space-x-2 overflow-x-auto mb-6">
          {interests.length > 0 ? (
            interests.map((item: string) => (
              <div
                key={item}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm whitespace-nowrap"
              >
                {item}
              </div>
            ))
          ) : (
            <span className="text-gray-500">未設定</span>
          )}
        </div>

        <div className="flex justify-center">
          <Button onClick={() => router.push("/")}>ホームに戻る</Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
