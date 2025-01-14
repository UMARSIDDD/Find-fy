"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { pusherServer } from "@/lib/pusher";
import { revalidateTag, unstable_cache } from "next/cache";

export async function toggleLikeMember(targetUserId: string, isLiked: boolean) {
  try {
    const userId = await getAuthUserId();

    // Optimistic UI update — no delay for the user
    const optimisticAction = isLiked ? "unlike" : "like";

    // Async server operation
    const serverOperation = isLiked
      ? prisma.like.delete({
          where: {
            sourceUserId_targetUserId: {
              sourceUserId: userId,
              targetUserId,
            },
          },
        })
      : prisma.like.create({
          data: {
            sourceUserId: userId,
            targetUserId,
          },
          select: {
            sourceMember: {
              select: {
                name: true,
                image: true,
                userId: true,
              },
            },
          },
        });

    const serverResponse = await serverOperation;

    // Trigger revalidation tags
    revalidateTag("fetchcurrentUserLike");
    revalidateTag("fetchSourceLike");
    revalidateTag("fetchTargetLike");
    revalidateTag("fetchMutualLike");



    // Event broadcast outside the critical path (async but not awaited)
    if (!isLiked) {
      const like = serverResponse as { sourceMember: { name: string; image: string; userId: string } };
      pusherServer.trigger(`private-${targetUserId}`, "like:new", {
        name: like.sourceMember.name,
        image: like.sourceMember.image,
        userId: like.sourceMember.userId,
      });
    }

    // Return optimistic action for UI feedback
    return optimisticAction;
  } catch (error) {
    console.error("Failed to toggle like:", error);
    throw new Error("Action failed. Please try again.");
  }
}


export const fetchCurrentUserLikeIds= unstable_cache (
  async (userId: string) =>{
    try {
      console.log("runing like");
      const likeIds = await prisma.like.findMany({
        where: {
          sourceUserId: userId,
        },
        select: {
          targetUserId: true,
        },
      });

      return likeIds.map((like) => like.targetUserId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  [],
  { revalidate: 3600, tags: ["fetchcurrentUserLike"] }
);

export async function fetchLikedMembers(type = "source") {
  try {
    const userId = await getAuthUserId();

    switch (type) {
      case "source":
        return await fetchSourceLikes(userId);
      case "target":
        return await fetchTargetLikes(userId);
      case "mutual":
        return await fetchMutualLikes(userId);
      default:
        return [];
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const fetchSourceLikes = unstable_cache(async (userId: string) => {
  console.log("fetchsourcelike");
  const sourceList = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetMember: true },
  });
  return sourceList.map((x) => x.targetMember);
},['userId'],{ revalidate: 3600, tags: ["fetchSourceLike"] });

export const fetchTargetLikes=unstable_cache(async (userId: string)=> {
  console.log("fetchTargetlike");
  const targetList = await prisma.like.findMany({
    where: { targetUserId: userId },
    select: { sourceMember: true },
  });
  return targetList.map((x) => x.sourceMember);
},['userId'],{ revalidate: 3600, tags:  ["fetchTargetLike"] });

export const fetchMutualLikes=unstable_cache(async(userId: string)=>{
  const likedUsers = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
  });
  const likedIds = likedUsers.map((x) => x.targetUserId);

  const mutualList = await prisma.like.findMany({
    where: {
      AND: [{ targetUserId: userId }, { sourceUserId: { in: likedIds } }],
    },
    select: { sourceMember: true },
  });
  return mutualList.map((x) => x.sourceMember);
},[],{
  revalidate: 3600,
  tags: ["fetchMutualLike"]
}
)