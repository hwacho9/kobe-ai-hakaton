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
    <header className="flex items-center justify-between px-4 py-4 bg-black">
      <div className="text-base font-semibold text-white">{username}さん</div>
      <div className="flex items-center space-x-4">
        <Bell
          className={`h-6 w-6 cursor-pointer ${
            hasNotification ? "text-gray-300" : "text-gray-500"
          }`}
          onClick={toggleNotification}
        />
        {/* 必要ならユーザーアイコンなどを追加 */}
      </div>
    </header>
  );
};

export default Header;
