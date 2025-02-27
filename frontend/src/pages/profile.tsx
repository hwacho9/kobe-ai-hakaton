import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { getUserProfile } from "@/utils/api/profile";
import { Button } from "@/components/ui/Button";

// 아티스트 맵핑 (ID -> 이름)
const ARTIST_MAP: Record<string, string> = {
    blackpink: "BLACKPINK",
    bts: "BTS",
    twice: "TWICE",
    exo: "EXO",
    redvelvet: "Red Velvet",
    nct: "NCT",
    aespa: "aespa",
    gidle: "(G)I-DLE",
    ive: "IVE",
    seventeen: "SEVENTEEN",
    newjeans: "NewJeans",
    txt: "TXT",
};

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, user: authUser } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<any>(null);

    // 프로필 정보 로드
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
                console.error("프로필 로드 오류:", err);
                setError(
                    err.message || "프로필 정보를 가져오는데 실패했습니다."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, router]);

    // 아티스트 ID를 이름으로 변환하는 도우미 함수
    const getArtistName = (artistId: string) => {
        return ARTIST_MAP[artistId] || artistId;
    };

    if (isLoading) {
        return (
            <div className="container max-w-3xl mx-auto p-4 flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-lg font-medium">
                        プロフィール情報を読み込み中...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-3xl mx-auto p-4">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                    <p className="font-medium">エラーが発生しました</p>
                    <p>{error}</p>
                </div>
                <Button onClick={() => router.push("/")}>ホームに戻る</Button>
            </div>
        );
    }

    // 사용자 정보 및 선호도 추출
    const user = profileData?.user || authUser;
    const area = profileData?.area || "未設定";
    const contentInterests = profileData?.content_interests || [];
    const artistPreferences = user?.preferences || [];

    return (
        <div className="container max-w-3xl mx-auto p-4 pb-20">
            <h1 className="text-2xl font-bold mb-6 text-center">
                マイプロフィール
            </h1>

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                {/* 기본 정보 섹션 */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-medium mb-4">基本情報</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">ユーザー名</p>
                            <p className="font-medium">{user?.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                メールアドレス
                            </p>
                            <p className="font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">登録日</p>
                            <p className="font-medium">
                                {user?.createdAt
                                    ? new Date(
                                          user.createdAt
                                      ).toLocaleDateString()
                                    : ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* K-Pop 팬 정보 섹션 */}
                <div className="p-6">
                    <h2 className="text-xl font-medium mb-4">
                        K-Pop ファン情報
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">活動地域</p>
                            <p className="font-medium">{area}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                興味のあるコンテンツ
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {contentInterests.length > 0 ? (
                                    contentInterests.map((interest: string) => (
                                        <span
                                            key={interest}
                                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                                            {interest}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">未設定</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                好きなアーティスト
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {artistPreferences.length > 0 ? (
                                    artistPreferences.map((pref: any) => (
                                        <span
                                            key={pref.artistId}
                                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                                            {getArtistName(pref.artistId)}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">未設定</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={() => router.push("/")}>ホームに戻る</Button>
            </div>
        </div>
    );
}
