import { ConversationIdLayout } from "@/modules/dashboard/ui/layouts/conversation-id-layout";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <ConversationIdLayout>{children}</ConversationIdLayout>;
};

export default Layout;
