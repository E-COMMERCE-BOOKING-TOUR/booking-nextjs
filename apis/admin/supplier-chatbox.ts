import { getAuthHeaders } from "@/libs/auth/authHeaders";
import fetchC from "@/libs/fetchC";

export const supplierChatboxApi = {
    getAllConversations: async (limit = 100, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/supplier/chatbox/conversations?limit=${limit}`, { headers: authHeaders.headers });
    },
    getConversationDetails: async (id: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/supplier/chatbox/conversation/${id}`, { headers: authHeaders.headers });
    },
    reply: async (conversationId: string, content: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post('/supplier/chatbox/reply', { conversationId, content }, { headers: authHeaders.headers });
    },
    markAsRead: async (conversationId: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/supplier/chatbox/conversation/${conversationId}/read`, {}, { headers: authHeaders.headers });
    },
};
