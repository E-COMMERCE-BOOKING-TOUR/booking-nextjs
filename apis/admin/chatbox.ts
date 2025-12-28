import { getAuthHeaders } from "@/libs/auth/authHeaders";
import fetchC from "@/libs/fetchC";

export const adminChatboxApi = {
    getAllConversations: async (limit = 100, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/chatbox/conversations?limit=${limit}`, { headers: authHeaders.headers });
    },
    getConversationDetails: async (id: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/admin/chatbox/conversation/${id}`, { headers: authHeaders.headers });
    },
    reply: async (conversationId: string, content: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post('/admin/chatbox/reply', { conversationId, content }, { headers: authHeaders.headers });
    },
    markAsRead: async (conversationId: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/chatbox/conversation/${conversationId}/read`, {}, { headers: authHeaders.headers });
    },
    updateCategory: async (conversationId: string, category: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/admin/chatbox/conversation/${conversationId}/category`, { category }, { headers: authHeaders.headers });
    },
    toggleHide: async (conversationId: string, isHidden: boolean, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.patch(`/admin/chatbox/conversation/${conversationId}/hide`, { isHidden }, { headers: authHeaders.headers });
    },
    toggleAi: async (conversationId: string, isAiEnabled: boolean, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.patch(`/admin/chatbox/conversation/${conversationId}/ai`, { isAiEnabled }, { headers: authHeaders.headers });
    },
    toggleHumanTakeover: async (conversationId: string, isHumanTakeover: boolean, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.patch(`/admin/chatbox/conversation/${conversationId}/human`, { isHumanTakeover }, { headers: authHeaders.headers });
    }
}