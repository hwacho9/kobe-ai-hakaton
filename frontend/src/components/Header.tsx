export default function Header() {
  return (
    <header className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <img
          src="/path/to/user-icon.png"
          alt="User"
          className="w-10 h-10 rounded-full"
        />
        <span className="ml-2">○○さん</span>
      </div>
      <h1 className="text-xl font-bold">オタ活</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        サインイン
      </button>
    </header>
  );
}
