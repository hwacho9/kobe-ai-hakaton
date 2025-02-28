// src/components/ProfileHeader.tsx
import React from "react";
import { Bell } from "lucide-react";

export default function ProfileHeader() {
    return (
        <header className="flex items-center justify-between bg-[#242424] px-4 py-4">
            {/* タイトル */}
            <h1 className="text-pink-300 text-xl font-bold">my page</h1>

            {/* アイコンなど */}
            <div className="flex items-center space-x-4">
                <Bell className="h-6 w-6 text-gray-300" />
            </div>
        </header>
    );
}
