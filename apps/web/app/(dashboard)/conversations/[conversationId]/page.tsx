import { ConversationIdView } from "@/modules/dashboard/ui/views/conversation-id.view";
import { Id } from "@workspace/backend/_generated/dataModel";

const Page = async ({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) => {
  const { conversationId } = await params;
  return (
    <ConversationIdView conversationId={conversationId as Id<"coversations">} />
  );
};

export default Page;
