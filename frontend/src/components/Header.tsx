import { Bell } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [hasNotification, setHasNotification] = useState(true);

  const toggleNotification = () => {
    setHasNotification(!hasNotification);
  };

  return (
    <header className="flex justify-between items-center mb-4 border-b border-gray-200">
      <div className="text-xl">ソンファンさん</div>
      <h1 className="text-xl font-bold flex-grow text-center">オタ活</h1>
      <div className="relative">
        <Bell
          className={`h-6 w-6 cursor-pointer ${
            hasNotification ? "text-gray-800" : "text-gray-500"
          }`}
          onClick={toggleNotification}
        />
        {hasNotification && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>
    </header>
  );
}
