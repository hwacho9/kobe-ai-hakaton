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
      className={`bg-white rounded-lg shadow-md p-4 transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      } cursor-pointer`}
      onClick={handleClick}
    >
      <div className="flex justify-center mb-3">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-[120px] h-[120px] rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">{name}</h3>
      </div>
    </div>
  );
}
