"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ApiTest() {
    const [testResult, setTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testApi = async (endpoint: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8000${endpoint}`);
            if (!response.ok) {
                throw new Error(
                    `API 요청 실패: ${response.status} ${response.statusText}`
                );
            }
            const data = await response.json();
            setTestResult(data);
        } catch (err: any) {
            console.error("API 테스트 오류:", err);
            setError(err.message || "알 수 없는 오류가 발생했습니다");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">백엔드 API 연결 테스트</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            기본 API 테스트
                        </h2>
                        <p className="text-gray-500 text-sm">
                            백엔드 서버와의 기본 연결을 테스트합니다
                        </p>
                    </div>
                    <div className="mb-4">
                        <Button
                            onClick={() => testApi("/")}
                            disabled={loading}
                            className="mr-2">
                            루트 엔드포인트 테스트
                        </Button>
                        <Button
                            onClick={() => testApi("/health")}
                            disabled={loading}
                            className="mr-2">
                            헬스체크 테스트
                        </Button>
                        <Button
                            onClick={() => testApi("/api/test")}
                            disabled={loading}>
                            테스트 엔드포인트
                        </Button>
                    </div>
                    <div className="mt-4">
                        {loading && <p>로딩 중...</p>}
                        {error && <p className="text-red-500">오류: {error}</p>}
                        {testResult && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">
                                    응답 결과:
                                </h3>
                                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                                    {JSON.stringify(testResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border rounded-lg p-6 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                            인증 API 테스트
                        </h2>
                        <p className="text-gray-500 text-sm">
                            로그인 및 회원가입 API를 테스트합니다
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Button
                                onClick={() => testApi("/api/auth/register")}
                                disabled={loading}
                                className="mr-2">
                                회원가입 API 확인
                            </Button>
                            <Button
                                onClick={() => testApi("/api/auth/login")}
                                disabled={loading}>
                                로그인 API 확인
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                            참고: GET 요청만 가능합니다. 실제 인증은 POST 요청이
                            필요합니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
