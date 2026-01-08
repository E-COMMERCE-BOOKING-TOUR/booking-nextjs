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

export interface IChatContext {
    tourId?: number;
    tourSlug?: string;
    tourTitle?: string;
    bookingId?: number;
    supplierId?: number;
    supplierName?: string;
    source: 'tour_page' | 'booking' | 'general';
}

export interface IRecentBookingInfo {
    id: number;
    tourId: number;
    tourTitle: string;
    tourSlug: string;
    supplierId?: number;
    supplierName?: string;
    startDate?: string;
    status: string;
}

const chatboxApi = {
    startChatAdmin: async (context?: Partial<IChatContext>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post('/chatbox/start/admin', context || {}, { headers: authHeaders.headers });
    },
    startChatSupplier: async (supplierId: string | number, context?: Partial<IChatContext>, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.post(`/chatbox/start/supplier/${supplierId}`, context || {}, { headers: authHeaders.headers });
    },
    getMessages: async (conversationId: string, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get(`/chatbox/messages/${conversationId}`, { headers: authHeaders.headers });
    },
    getContext: async (params: { tourId?: number; tourSlug?: string; bookingId?: number }, token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);

        const queryParams = new URLSearchParams();
        if (params.tourId) queryParams.append('tourId', params.tourId.toString());
        if (params.tourSlug) queryParams.append('tourSlug', params.tourSlug);
        if (params.bookingId) queryParams.append('bookingId', params.bookingId.toString());

        return fetchC.get(`/chatbox/context?${queryParams.toString()}`, { headers: authHeaders.headers });
    },
    getRecentBookings: async (token?: string) => {
        const authHeaders = await getAuthHeaders(token);
        if (!authHeaders.ok) throw new Error(authHeaders.message);
        return fetchC.get('/chatbox/recent-bookings', { headers: authHeaders.headers });
    },
};

export default chatboxApi;
