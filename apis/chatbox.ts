import { getAuthHeaders } from "@/libs/auth/authHeaders";
import fetchC from "@/libs/fetchC";

export interface IParticipant {
    userId: string;
    role: string;
    name?: string;
}

export interface IConversation {
    _id: string;
    participants: IParticipant[];
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    category?: string;
    isHidden?: boolean;
    isAiEnabled?: boolean;
    isHumanTakeover?: boolean;
}

export interface IMessage {
    senderId: string;
    senderRole: string;
    senderName?: string;
    content: string;
    createdAt: string;
    items?: unknown;
}

export interface IConversationListResponse {
    data: IConversation[];
}

export interface IStartChatResponse {
    _id: string;
}

const chatboxApi = {
    startChatAdmin: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post('/chatbox/start/admin', {}, { headers: authHeaders.headers });
    },
    getMessages: async (conversationId: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/chatbox/messages/${conversationId}`, { headers: authHeaders.headers });
    },

};

export default chatboxApi;
