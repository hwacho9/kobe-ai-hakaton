import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { Button } from "@/components/ui/Button";
import Header from "@/components/RegisterHeader";

// 지역 및 관심사 옵션
const AREAS = ["東京", "大阪", "名古屋", "九州", "北海道", "其他"];
const INTERESTS = ["アルバム", "グッズ", "ファンミーティング", "ライブ"];

export default function RegisterInfoPage() {
  const router = useRouter();
  const { isAuthenticated, registrationStep, setRegistrationStep } =
    useAuthStore();

  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [formError, setFormError] = useState<string>("");

  // 인증 상태 확인
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // 등록 단계 설정
    setRegistrationStep(2);
  }, [isAuthenticated, router, setRegistrationStep]);

  // 관심사 선택 토글
  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
    setFormError("");
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!selectedArea) {
      setFormError("地域を選択してください。");
      return;
    }
    if (selectedInterests.length === 0) {
      setFormError("最低1つ以上の興味のあるコンテンツを選択してください。");
      return;
    }

    // 次のステップへ
    const interestsParam = selectedInterests.join(",");
    router.push(
      `/register-artist?area=${encodeURIComponent(
        selectedArea
      )}&interests=${encodeURIComponent(interestsParam)}`
    );
  };

  return (
    // 全体を黒背景＋白文字で
    <div className="min-h-screen bg-black text-white">
      {/* ヘッダー */}
      <Header username="" />

      {/* コンテナ */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 白いカードにまとめる */}
        <div className="bg-white text-black rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">追加情報入力</h1>
          <p className="text-center text-gray-600 mb-8">
            K-Popファン活動に必要な追加情報を入力してください。
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* エラーメッセージ */}
            {formError && (
              <div className="bg-red-700 text-white p-3 rounded">
                {formError}
              </div>
            )}

            {/* 地域選択 */}
            <div>
              <h2 className="text-lg font-medium mb-3">居住地域</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AREAS.map((area) => (
                  <div
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`
                      p-3 cursor-pointer rounded-lg text-center transition-all
                      ${
                        selectedArea === area
                          ? "bg-white text-black font-medium border border-pink-500"
                          : "bg-white text-black border border-gray-300"
                      }
                    `}
                  >
                    {area}
                  </div>
                ))}
              </div>
            </div>

            {/* 興味のあるコンテンツ */}
            <div>
              <h2 className="text-lg font-medium mb-3">興味のあるコンテンツ</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTERESTS.map((interest) => (
                  <div
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`
                      p-3 cursor-pointer rounded-lg text-center transition-all
                      ${
                        selectedInterests.includes(interest)
                          ? "bg-white text-black font-medium border border-pink-500"
                          : "bg-white text-black border border-gray-300"
                      }
                    `}
                  >
                    {interest}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-400">
                {selectedInterests.length > 0
                  ? `${selectedInterests.length}個 選択中`
                  : "最低1つ以上選択してください"}
              </p>
            </div>

            {/* ボタン */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                className="bg-[#333] text-white hover:bg-[#444]"
                onClick={() => router.push("/")}
              >
                スキップ
              </Button>
              <Button
                type="submit"
                className="bg-white text-black border border-black hover:bg-gray-300"
              >
                次へ
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
