import { Home, Info, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 shadow-md flex justify-around py-2 border-t border-gray-700">
      <button className="flex flex-col items-center text-gray-300">
        <Home className="h-6 w-6" />
        <span>ホーム</span>
      </button>
      <button className="flex flex-col items-center text-gray-300">
        <Info className="h-6 w-6" />
        <span>詳細</span>
      </button>
      <button className="flex flex-col items-center text-gray-300">
        <User className="h-6 w-6" />
        <span>マイページ</span>
      </button>
    </footer>
  );
}
