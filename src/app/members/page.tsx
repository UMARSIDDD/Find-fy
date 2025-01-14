import React from "react";
import MemberCard from "./MemberCard";
import { fetchCurrentUserLikeIds } from "../actions/likeActions";
import PaginationComponent from "@/components/PaginationComponent";
import { GetMemberParams } from "@/types";
import EmptyState from "@/components/EmptyState";
import { getMember} from "../actions/memberActions";
import { getAuthUserId } from "../actions/authActions";

async function MembersPage({
  searchParams,
}: {
  searchParams: GetMemberParams;
}) {
  console.log('MembersPage rendered');
  try {
  const userId = await getAuthUserId();  
  const updateSearchparams={...searchParams,userId:'cm57u7kxq000r63uzu36e0h3g'}
  console.log(updateSearchparams)
  const { items: members, totalCount } =
    await getMember(updateSearchparams);

  const likeIds = await  fetchCurrentUserLikeIds(userId);

  if (!members || members.length === 0) {
    return (
      <EmptyState
        message="No members found. Please adjust your search criteria."
        
      />
    );
  }
  
  return (
    <>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} likeIds={likeIds} />
        ))}
      </div>
      <PaginationComponent totalCount={totalCount} />
    </>
  );
} catch (error) {
  console.error('Error loading members:', error);
  return <EmptyState message="Failed to load members." />;
}
}

export default React.memo(MembersPage);
