"use client";

import { toggleLikeMember } from "@/app/actions/likeActions";
import React, { useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

type Props = {
  targetId: string;
  hasLiked: boolean;
};

export default function LikeButton({ targetId, hasLiked }: Props) {
  const [isLiked, setIsLiked] = useState(hasLiked);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleLike() {
    if (isLoading) return; // Prevent duplicate requests

    setIsLoading(true);
    const prevLikedState = isLiked;

    // Optimistic update
    setIsLiked((prev) => !prev);

    try {
      await toggleLikeMember(targetId, prevLikedState);
    } catch (error) {
      console.error("Failed to toggle like:", error);

      // Rollback UI if server action fails
      setIsLiked(prevLikedState);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      onClick={toggleLike}
      className={`relative hover:opacity-80 transition cursor-pointer ${
        isLoading ? "pointer-events-none" : ""
      }`}
    >
      <AiOutlineHeart
        size={28}
        className="fill-white absolute -top-[2px] -right-[2px]"
      />
      <AiFillHeart
        size={24}
        className={`transition-colors duration-300 ${
          isLiked ? "fill-rose-500" : "fill-neutral-500/70"
        }`}
      />
      
    </div>
  );
}
