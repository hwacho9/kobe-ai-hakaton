import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { UrlObject } from "url";
import { useAuthStore } from "@/utils/stores/authStore";
import { Button } from "@/components/ui/Button";

// 지역 및 관심사 옵션
const AREAS = ["東京", "大阪", "名古屋", "九州", "北海道", "其他"];

const INTERESTS = ["アルバム", "グッズ", "ファンミーティング", "コンサート"];

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
            setFormError("지역을 선택해주세요.");
            return;
        }

        if (selectedInterests.length === 0) {
            setFormError("최소 하나의 관심사를 선택해주세요.");
            return;
        }

        // 다음 단계로 이동 (아티스트 선택)
        const interestsParam = selectedInterests.join(",");
        router.push(
            `/register-artist?area=${encodeURIComponent(
                selectedArea
            )}&interests=${encodeURIComponent(interestsParam)}`
        );
    };

    return (
        <div className="container max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-center mb-6">
                추가 정보 입력
            </h1>
            <p className="text-gray-600 mb-8 text-center">
                K-Pop 팬 활동을 위한 추가 정보를 입력해주세요.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 오류 메시지 */}
                {formError && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {formError}
                    </div>
                )}

                {/* 지역 선택 */}
                <div>
                    <h2 className="text-lg font-medium mb-3">활동 지역</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {AREAS.map((area) => (
                            <div
                                key={area}
                                onClick={() => setSelectedArea(area)}
                                className={`
                  p-3 cursor-pointer rounded-lg border text-center transition-all
                  ${
                      selectedArea === area
                          ? "border-blue-500 bg-blue-50 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                  }
                `}>
                                {area}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 관심사 선택 */}
                <div>
                    <h2 className="text-lg font-medium mb-3">관심 콘텐츠</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {INTERESTS.map((interest) => (
                            <div
                                key={interest}
                                onClick={() => handleInterestToggle(interest)}
                                className={`
                  p-3 cursor-pointer rounded-lg border text-center transition-all
                  ${
                      selectedInterests.includes(interest)
                          ? "border-blue-500 bg-blue-50 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                  }
                `}>
                                {interest}
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        {selectedInterests.length > 0
                            ? `${selectedInterests.length}개 선택됨`
                            : "최소 하나 이상 선택해주세요"}
                    </p>
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-between pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/")}>
                        건너뛰기
                    </Button>
                    <Button type="submit">다음</Button>
                </div>
            </form>
        </div>
    );
}
