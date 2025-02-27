import React from "react";
import { Button } from "@/components/ui/Button";

export default function AddSavingButton() {
  const handleClick = () => {
    // 貯金追加の処理など
    alert("貯金追加画面へ移動");
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
    >
      貯金を追加
    </Button>
  );
}
