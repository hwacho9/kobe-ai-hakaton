// src/components/Footer.tsx
import React from "react";
import Link from "next/link";
// アイコンを使う場合
import { Home, Info, User } from "lucide-react";

export default function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
            <div className="flex justify-around py-2">
                {/* ホームボタン例 */}
                <Link
                    href="/"
                    className="flex flex-col items-center text-gray-300">
                    <Home className="h-6 w-6" />
                    <span className="text-xs mt-1">ホーム</span>
                </Link>

                {/* 詳細ボタン例 */}
                <Link
                    href="/detail"
                    className="flex flex-col items-center text-gray-300">
                    <Info className="h-6 w-6" />
                    <span className="text-xs mt-1">詳細</span>
                </Link>

                {/* プロフィールボタン（ここを /profile にリンクさせる） */}
                <Link
                    href="/profile"
                    className="flex flex-col items-center text-gray-300">
                    <User className="h-6 w-6" />
                    <span className="text-xs mt-1">マイページ</span>
                </Link>
            </div>
        </footer>
    );
}
