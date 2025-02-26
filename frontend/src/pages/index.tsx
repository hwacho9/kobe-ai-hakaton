import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/utils/stores/authStore";

export default function Home() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    // 로그인 상태 확인
    useEffect(() => {
        // 상태 초기화 후 실행
        const checkAuth = setTimeout(() => {
            // 필요한 경우 추가 로직
        }, 100);

        return () => clearTimeout(checkAuth);
    }, []);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <>
            <Head>
                <title>Fan Event Prediction App</title>
                <meta
                    name="description"
                    content="Plan ahead for your favorite artist's events"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="flex flex-col min-h-screen">
                {/* 헤더 */}
                <header className="bg-white shadow-sm py-4">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                        <h1 className="text-xl font-bold">
                            Fan Event Prediction
                        </h1>
                        <div>
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">
                                        안녕하세요, {user?.username || "사용자"}
                                        님
                                    </span>
                                    <Button onClick={handleLogout}>
                                        로그아웃
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Link href="/login">
                                        <Button variant="outline">
                                            로그인
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button>회원가입</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
                    <h1 className="text-4xl font-bold text-center mb-4">
                        Fan Event Prediction App
                    </h1>
                    <p className="text-xl text-center mb-12">
                        Plan for events and predict expenses for your favorite
                        artists
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">
                                Event Prediction
                            </h2>
                            <p className="mb-4">
                                Predict upcoming events based on past patterns
                                and social media activity
                            </p>
                            <Button
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        router.push("/login");
                                        return;
                                    }
                                    setIsLoading(!isLoading);
                                }}
                                isLoading={isLoading}>
                                {isLoading ? "Loading..." : "Get Started"}
                            </Button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">
                                Budget Planning
                            </h2>
                            <p className="mb-4">
                                Calculate and save for expenses related to
                                upcoming events
                            </p>
                            <Button
                                onClick={() =>
                                    !isAuthenticated && router.push("/login")
                                }>
                                Plan Budget
                            </Button>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4">
                                Artist Tracking
                            </h2>
                            <p className="mb-4">
                                Follow your favorite artists and get
                                personalized predictions
                            </p>
                            <Button
                                onClick={() =>
                                    !isAuthenticated && router.push("/login")
                                }>
                                Track Artists
                            </Button>
                        </div>
                    </div>
                </main>

                <footer className="bg-gray-100 py-6">
                    <div className="container mx-auto px-4 text-center text-gray-600">
                        <p>
                            © 2024 Fan Event Prediction App. All rights
                            reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
