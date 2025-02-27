import React from "react";
import { Home, Info, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
      <div className="flex justify-around py-2">
        <button className="flex flex-col items-center text-gray-300">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">ホーム</span>
        </button>
        <button className="flex flex-col items-center text-gray-300">
          <Info className="h-6 w-6" />
          <span className="text-xs mt-1">詳細</span>
        </button>
        <button className="flex flex-col items-center text-gray-300">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">マイページ</span>
        </button>
      </div>
    </footer>
  );
}
