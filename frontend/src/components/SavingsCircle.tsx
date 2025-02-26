export default function SavingsCircle() {
  return (
    <div className="relative inline-block w-full">
      <div className="w-3/4 h-0 pb-[75%] rounded-full border-4 border-blue-500 mx-auto flex items-center justify-center">
        <div className="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="text-lg font-bold">50,000円</p>
          <p className="text-sm">あと80日</p>
        </div>
      </div>
    </div>
  );
}
