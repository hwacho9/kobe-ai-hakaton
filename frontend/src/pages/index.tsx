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

type HomeProps = {
    idols: Idol[];
    savings: MonthlySaving[];
};

export default function Home({ idols = [], savings = [] }: HomeProps) {
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

    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6">
                <Header />
                {isClient && (
                    <div className="flex gap-3">
                        {isAuthenticated ? (
                            <>
                                <span className="mr-2">
                                    Hi, {user?.username || "user"}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
                                    logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                    login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
                                    sign up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full md:w-1/2">
                <SavingsCircle />
            </div>
            <IdolList idols={idols} />
            <SavingsList savings={savings} />
            <Footer />
            <AddSavingButton />
        </div>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const idols: Idol[] = [
        { id: "1", name: "BLACKPINK", image: "/images/idolA.jpg" },
        { id: "2", name: "BTS", image: "/images/idolB.jpg" },
    ];

    const savings: MonthlySaving[] = [
        { month: "2023-01", amount: 50000 },
        { month: "2023-02", amount: 60000 },
        { month: "2023-03", amount: 70000 },
        { month: "2023-04", amount: 80000 },
        { month: "2023-05", amount: 90000 },
        { month: "2023-06", amount: 100000 },
        { month: "2023-07", amount: 110000 },
        { month: "2023-08", amount: 120000 },
        { month: "2023-09", amount: 130000 },
        { month: "2023-10", amount: 140000 },
        { month: "2023-11", amount: 150000 },
        { month: "2023-12", amount: 160000 },
    ];

    return {
        props: {
            idols,
            savings,
        },
    };
};
