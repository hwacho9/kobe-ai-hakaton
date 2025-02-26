import Image from "next/image";

interface ArtistCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export function ArtistCard({
  id,
  name,
  imageUrl,
  onSelect,
  isSelected = false,
}: ArtistCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-3 transition-all ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } cursor-pointer w-32 h-32 flex items-center justify-center text-white`}
      onClick={handleClick}
    >
      <div className="text-center">
        <h3 className="font-semibold text-base">{name}</h3>
      </div>
    </div>
  );
}
