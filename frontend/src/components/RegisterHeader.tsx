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
    <header className="flex items-center px-4 py-4 bg-black w-full">
      {/* 中央: アイコン画像 */}
      <div className="flex-1 flex justify-center">
        <img
          src="/images/icon.jpg"
          alt="icon"
          className="w-13 h-11 object-contain"
        />
      </div>
    </header>
  );
};

export default Header;
