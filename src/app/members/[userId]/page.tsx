import { getMember, getMemberByUserId } from "@/app/actions/memberActions";
import CardInnerWrapper from "@/components/CardInnerWrapper";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  try {
    const members = await getMember({});
    if (!members || !members.items) return [];
    return members.items.map((member) => ({ userId: member.userId }));
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
}

export default async function MemberDetailedPage({
  params,
}: {
  params: { userId: string };
}) {
  try {
    const member = await getMemberByUserId(params.userId);

    if (!member) return notFound();

    return (
      <CardInnerWrapper
        header="Profile"
        body={member.description}
      />
    );
  } catch (error) {
    console.error("Error fetching member details:", error);
    return notFound();
  }
}
