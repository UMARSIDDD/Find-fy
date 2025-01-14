import React from "react";
import {
  fetchCurrentUserLikeIds,
  fetchLikedMembers,
} from "../actions/likeActions";
import ListsTab from "./ListsTab";
import { getAuthUserId } from "../actions/authActions";


export default async function ListsPage({
  searchParams,
}: {
  searchParams: { type: string };
}) {
  console.log("ListsPage rendered");
  const userId = await getAuthUserId();
  const likeIds = await fetchCurrentUserLikeIds(userId);
  const members = await fetchLikedMembers(
    searchParams.type
  );
 
  return (
    <div>
      <ListsTab
        members={members}
        likeIds={likeIds}
      />
    </div>
  );
}
