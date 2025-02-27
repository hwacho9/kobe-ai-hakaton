import React from "react";

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
    onSelect?.(id);
  };

  return (
    <div
      className={`flex-shrink-0 w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer transition-colors
        ${isSelected ? "border-2 border-pink-500" : "border border-gray-700"}
        bg-black text-white
      `}
      onClick={handleClick}
    >
      <div className="text-center text-sm">{name}</div>
    </div>
  );
}
