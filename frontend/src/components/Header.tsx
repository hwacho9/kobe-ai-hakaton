import React from "react";
import { Bell } from "lucide-react";
import { useState } from "react";

type HeaderProps = {
  username: string | undefined;
};

const Header: React.FC<HeaderProps> = ({ username }) => {
  const [hasNotification, setHasNotification] = useState(true);

  const toggleNotification = () => {
    setHasNotification(!hasNotification);
  };

  return (
    <header className="flex items-center justify-between mb-4 border-b border-gray-700 p-4">
      <div className="text-xl">{username}さん</div>
      <h1 className="text-xl font-bold text-center">オタ活</h1>
      <div className="relative">
        <Bell
          className={`h-6 w-6 cursor-pointer ${
            hasNotification ? "text-gray-300" : "text-gray-500"
          }`}
          onClick={toggleNotification}
        />
        {hasNotification && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>
    </header>
  );
};

export default Header;
