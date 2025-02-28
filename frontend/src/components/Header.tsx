import React, { useState } from "react";
import { Bell } from "lucide-react";

type HeaderProps = {
    username: string | undefined;
};

const Header: React.FC<HeaderProps> = ({ username }) => {
    const [hasNotification, setHasNotification] = useState(true);

    const toggleNotification = () => {
        setHasNotification(!hasNotification);
    };

    return (
        <header className="flex items-center justify-between px-4 py-4 bg-[#242424]">
            {/* 左側: ユーザー名（ピンク文字、サイズや太字を好みで調整） */}
            <h1 className="text-pink-300 text-xl font-bold">
                {username ? `${username}さん` : "No Name"}
            </h1>

            {/* 右側: 通知アイコン */}
            <div className="relative">
                <Bell
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                        hasNotification ? "text-pink-300" : "text-gray-500"
                    }`}
                    onClick={toggleNotification}
                />
                {hasNotification && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
            </div>
        </header>
    );
};

export default Header;
