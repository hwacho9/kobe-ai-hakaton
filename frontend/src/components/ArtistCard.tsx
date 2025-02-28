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

  // imageUrl が指定されていない場合、アーティスト名に応じたデフォルト画像を設定
  const defaultImageUrl =
    imageUrl ||
    (name.toLowerCase().includes("blackpink")
      ? "/images/blackpink.jpg"
      : name.toLowerCase().includes("bts")
      ? "/images/bts.jpg"
      : "");

  return (
    <div
      className={`flex-shrink-0 w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer transition-colors filter drop-shadow-xl
        ${isSelected ? "border-2 border-pink-500" : "border border-gray-700"}
        bg-black text-white`}
      onClick={handleClick}
    >
      {defaultImageUrl ? (
        <img
          src={defaultImageUrl}
          alt={name}
          className="object-contain w-full h-full rounded-lg"
        />
      ) : (
        <div className="text-center text-sm">{name}</div>
      )}
    </div>
  );
}
