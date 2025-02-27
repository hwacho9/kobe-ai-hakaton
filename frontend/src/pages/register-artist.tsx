import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/utils/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// 임시 아티스트 데이터
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

    // 인증 상태 및 이전 단계 완료 여부 확인
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (!area || !interests) {
            router.push("/register-info");
            return;
        }

        // 등록 단계 설정
        setRegistrationStep(3);
    }, [isAuthenticated, area, interests, router, setRegistrationStep]);

    // 아티스트 선택 토글
    const handleArtistToggle = (artistId: string) => {
        setSelectedArtists((prev) => {
            if (prev.includes(artistId)) {
                return prev.filter((id) => id !== artistId);
            } else {
                return [...prev, artistId];
            }
        });
        setFormError("");
    };

    // 검색에 따른 아티스트 필터링
    const filteredArtists = ARTISTS.filter((artist) =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 폼 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검사
        if (selectedArtists.length === 0) {
            setFormError("최소 한 명의 아티스트를 선택해주세요.");
            return;
        }

        // 사용자 정보 업데이트
        const result = await updateUserInfo({
            area: area as string,
            content_interests: (interests as string).split(","),
            preferred_artists: selectedArtists,
        });

        if (result.success) {
            // 홈페이지로 이동
            router.push("/");
        }
    };

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-center mb-6">
                좋아하는 아티스트 선택
            </h1>
            <p className="text-gray-600 mb-8 text-center">
                관심있는 아티스트를 선택해주세요.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 오류 메시지 */}
                {formError && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {formError}
                    </div>
                )}

                {/* 스토어 오류 */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {error}
                    </div>
                )}

                {/* 아티스트 검색 */}
                <div>
                    <Input
                        type="text"
                        placeholder="아티스트 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />
                </div>

                {/* 아티스트 선택 목록 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredArtists.map((artist) => (
                        <div
                            key={artist.id}
                            onClick={() => handleArtistToggle(artist.id)}
                            className={`
                                p-4 cursor-pointer rounded-lg border-2 transition-all flex items-center
                                ${
                                    selectedArtists.includes(artist.id)
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }
                            `}>
                            <div className="flex-1">
                                <p className="font-medium">{artist.name}</p>
                            </div>
                            {selectedArtists.includes(artist.id) && (
                                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    ✓
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 선택된 아티스트 수 표시 */}
                <div className="text-center text-gray-600">
                    {selectedArtists.length > 0
                        ? `${selectedArtists.length}명의 아티스트가 선택되었습니다.`
                        : "아티스트를 선택해주세요."}
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/register-info")}>
                        이전
                    </Button>
                    <Button type="submit">완료</Button>
                </div>
            </form>
        </div>
    );
}
