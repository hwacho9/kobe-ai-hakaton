import { Home, Info, User } from "lucide-react";
import { useRouter } from "next/router";

export default function Footer() {
    const router = useRouter();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 shadow-md flex justify-around py-2 border-t border-gray-700">
            <button
                className="flex flex-col items-center text-gray-300 hover:text-white"
                onClick={() => router.push("/")}>
                <Home className="h-6 w-6" />
                <span>ホーム</span>
            </button>
            <button
                className="flex flex-col items-center text-gray-300 hover:text-white"
                onClick={() => router.push("/info")}>
                <Info className="h-6 w-6" />
                <span>詳細</span>
            </button>
            <button
                className="flex flex-col items-center text-gray-300 hover:text-white"
                onClick={() => router.push("/profile")}>
                <User className="h-6 w-6" />
                <span>プロフィール</span>
            </button>
        </footer>
    );
}
