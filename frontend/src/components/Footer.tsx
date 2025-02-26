import { Home, Info, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around py-2 border-t border-gray-200">
      <button className="flex flex-col items-center">
        <Home className="h-6 w-6" />
        <span>ホーム</span>
      </button>
      <button className="flex flex-col items-center">
        <Info className="h-6 w-6" />
        <span>詳細</span>
      </button>
      <button className="flex flex-col items-center">
        <User className="h-6 w-6" />
        <span>マイページ</span>
      </button>
    </footer>
  );
}
