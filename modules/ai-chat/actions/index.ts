"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";

export interface StoredChatMessage {
  id: string;
  role: string;
  content: string;
  attachments: string[];
  createdAt: Date;
}

// Load a user's saved chat for a given playground, oldest first.
export const getChatHistory = async (
  playgroundId: string
): Promise<StoredChatMessage[]> => {
  const user = await currentUser();
  if (!user?.id || !playgroundId) return [];

  try {
    const messages = await db.chatMessage.findMany({
      where: { userId: user.id, playgroundId },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: { id: true, role: true, content: true, attachments: true, createdAt: true },
    });
    return messages;
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
};

export const clearChatHistory = async (playgroundId: string) => {
  const user = await currentUser();
  if (!user?.id || !playgroundId) return { success: false };

  try {
    await db.chatMessage.deleteMany({
      where: { userId: user.id, playgroundId },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to clear chat history:", error);
    return { success: false };
  }
};
