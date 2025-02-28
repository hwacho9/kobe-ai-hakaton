import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { Button } from "@/components/ui/Button";
import Header from "@/components/RegisterHeader";

// ARTISTS はそのまま使用
const ARTISTS = [
  { id: "blackpink", name: "BLACKPINK" },
  { id: "bts", name: "BTS" },
  { id: "twice", name: "TWICE" },
  { id: "exo", name: "EXO" },
  { id: "redvelvet", name: "Red Velvet" },
  { id: "nct", name: "NCT" },
  { id: "aespa", name: "aespa" },
  { id: "gidle", name: "(G)I-DLE" },
  { id: "ive", name: "IVE" },
  { id: "seventeen", name: "SEVENTEEN" },
  { id: "newjeans", name: "NewJeans" },
  { id: "txt", name: "TXT" },
];

// 対応する画像パスのマッピング
const ARTIST_IMAGES: { [key: string]: string } = {
  blackpink: "/images/blackpink.jpg",
  bts: "/images/bts.jpg",
  twice: "/images/twice.JPG",
  aespa: "/images/aespa.JPG",
  seventeen: "/images/seventeen.JPG",
  exo: "/images/exo.jpg",
  redvelet: "/images/redvelvet.jpg",
  nct: "/images/nct.jpg",
  gidle: "/images/gidle.jpg",
  ive: "/images/ive.jpg",
  newjeans: "/images/newjeans.jpg",
  txt: "/images/txt.jpg",
};

export default function RegisterArtistPage() {
  const router = useRouter();
  const { area, interests } = router.query;
  const {
    updateUserInfo,
    isAuthenticated,
    registrationStep,
    setRegistrationStep,
    error,
  } = useAuthStore();

  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!area || !interests) {
      router.push("/register-info");
      return;
    }
    setRegistrationStep(3);
  }, [isAuthenticated, area, interests, router, setRegistrationStep]);

  const handleArtistToggle = (artistId: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    );
    setFormError("");
  };

  const filteredArtists = ARTISTS.filter((artist) =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedArtists.length === 0) {
      setFormError("最低1人のアーティストを選択してください。");
      return;
    }

    const result = await updateUserInfo({
      area: area as string,
      content_interests: (interests as string).split(","),
      preferred_artists: selectedArtists,
    });

    if (result.success) {
      router.push("/");
    }
  };

  return (
    // 全体を黒背景＋白文字で
    <div className="min-h-screen bg-black text-white">
      {/* ヘッダー */}
      <Header username="" />

      {/* コンテナ */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 白いカードにフォーム全体をまとめる */}
        <div className="bg-white text-black rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            好きなアーティスト選択
          </h1>
          <p className="text-center text-gray-600 mb-8">
            関心のあるアーティストを選んでください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="bg-red-700 text-white p-3 rounded">
                {formError}
              </div>
            )}
            {error && (
              <div className="bg-red-700 text-white p-3 rounded">{error}</div>
            )}

            {/* アーティスト検索 */}
            <div>
              <input
                type="text"
                placeholder="アーティスト検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-4 rounded-md border border-black px-3 py-2 text-sm bg-[#1E1E1E] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* アーティスト選択リスト */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
              {filteredArtists.map((artist) => (
                <div key={artist.id} className="flex flex-col items-center">
                  <div
                    onClick={() => handleArtistToggle(artist.id)}
                    className={`
                p-4 cursor-pointer rounded-lg border-2 transition-all
                ${
                  selectedArtists.includes(artist.id)
                    ? "border-pink-500 bg-white"
                    : "bg-white border border-gray-300"
                }
                `}
                  >
                    {ARTIST_IMAGES[artist.id] ? (
                      <img
                        src={ARTIST_IMAGES[artist.id]}
                        alt={artist.name}
                        className="w-20 h-20 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center text-sm">
                        {artist.name}
                      </div>
                    )}
                    {selectedArtists.includes(artist.id) && (
                      <div className="mt-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <p className="text-sm mt-2">{artist.name}</p>
                </div>
              ))}
            </div>

            {/* 選択済みアーティスト数表示 */}
            <div className="text-center text-gray-600">
              {selectedArtists.length > 0
                ? `${selectedArtists.length}人のアーティストが選択されました。`
                : "アーティストを選択してください。"}
            </div>

            {/* ボタン */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/register-info")}
              >
                戻る
              </Button>
              <Button
                type="submit"
                className="bg-white text-black border border-black hover:bg-gray-300"
              >
                完了
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
