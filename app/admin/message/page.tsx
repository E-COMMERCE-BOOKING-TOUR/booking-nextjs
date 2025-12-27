"use client";

import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Send, User, Loader2, Tag, Filter, EyeOff, Eye } from 'lucide-react';
import { adminChatboxApi } from '@/apis/admin/chatbox';
import { IConversation, IMessage, IConversationListResponse } from '@/apis/chatbox';
import { cn } from '@/libs/utils';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'support', label: 'Support' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'tour_query', label: 'Tour Inquiry' },
    { value: 'hidden', label: 'Hidden' },
];

export default function AdminMessagePage() {
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.user?.accessToken;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedConvo, setSelectedConvo] = useState<IConversation | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isSocketConnecting, setIsSocketConnecting] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations using react-query
    const { data: conversationsData, isLoading, refetch } = useQuery({
        queryKey: ['admin-conversations', token],
        queryFn: () => adminChatboxApi.getAllConversations(100, token),
        enabled: !!token,
    });

    const conversations = (conversationsData as IConversationListResponse)?.data || [];

    // Filter conversations
    const filteredConversations = conversations.filter((c: IConversation) => {
        const matchesSearch = !searchTerm || getParticipantName(c).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all'
            ? !c.isHidden // Only show non-hidden in 'All'
            : (selectedCategory === 'hidden' ? c.isHidden : (c.category === selectedCategory && !c.isHidden));
        return matchesSearch && matchesCategory;
    });

    // Socket connection - only connect when token is available
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_CHATBOX_WS_URL;
        if (!socketUrl || !token) return;

        setIsSocketConnecting(true);
        const s = io(socketUrl, {
            transports: ['websocket'],
            auth: { token: token } // Pass token for authentication
        });

        s.on('connect', () => {
            console.log('Admin socket connected');
            setIsSocketConnected(true);
            setIsSocketConnecting(false);
        });

        s.on('authenticated', (data: any) => {
            console.log('Admin authenticated as:', data.user?.full_name);
        });

        s.on('error', (err: any) => {
            console.error('Admin socket error:', err);
            setIsSocketConnecting(false);
            setIsSocketConnected(false);
        });

        s.on('disconnect', () => {
            console.log('Admin socket disconnected');
            setIsSocketConnected(false);
        });

        s.on('newMessage', () => {
            refetch(); // Refresh conversation list on new message
        });

        setSocket(s);
        return () => {
            s.disconnect();
            setSocket(null);
            setIsSocketConnected(false);
        };
    }, [token, refetch]);

    // Handle conversation selection
    useEffect(() => {
        if (selectedConvo && socket && isSocketConnected && token) {
            setMessages([]);
            setIsLoadingMessages(true);

            // Mark as read
            if (selectedConvo.unreadCount > 0) {
                adminChatboxApi.markAsRead(selectedConvo._id, token)
                    .then(() => refetch());
            }

            socket.emit('joinRoom', { conversationId: selectedConvo._id });

            adminChatboxApi.getConversationDetails(selectedConvo._id, token)
                .then((msgs: any) => {
                    setMessages(msgs as IMessage[]);
                    setIsLoadingMessages(false);
                    scrollToBottom();
                })
                .catch(() => setIsLoadingMessages(false));

            const msgListener = (msg: IMessage) => {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            };
            socket.on('newMessage', msgListener);

            return () => {
                socket.emit('leaveRoom', { conversationId: selectedConvo._id });
                socket.off('newMessage', msgListener);
            };
        }
    }, [selectedConvo, socket, isSocketConnected, token]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSend = () => {
        if (!input.trim() || !selectedConvo || !token || !isSocketConnected) return;

        adminChatboxApi.reply(selectedConvo._id, input, token)
            .then(() => setInput(''));
    };

    function getParticipantName(c: IConversation) {
        const p = c.participants.find((p: any) => p.role !== 'ADMIN' && p.role !== 'admin');
        return p?.name || p?.userId || 'Unknown User';
    }

    const handleUpdateCategory = async (category: string) => {
        if (!selectedConvo || !token) return;
        try {
            await adminChatboxApi.updateCategory(selectedConvo._id, category, token);
            toast.success('Category updated');
            // Update local state so UI reflects it immediately
            setSelectedConvo({ ...selectedConvo, category });
            refetch();
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleToggleHide = async () => {
        if (!selectedConvo || !token) return;
        const newHiddenStatus = !selectedConvo.isHidden;
        try {
            await adminChatboxApi.toggleHide(selectedConvo._id, newHiddenStatus, token);
            toast.success(newHiddenStatus ? 'Conversation hidden' : 'Conversation unhidden');
            setSelectedConvo({ ...selectedConvo, isHidden: newHiddenStatus });
            refetch();
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    // Show loading while session is loading
    if (sessionStatus === 'loading') {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Message Management</h1>
                    <p className="text-muted-foreground mt-1 text-lg">View and reply to customer conversations.</p>
                </div>
                {/* Socket status indicator */}
                <div className="flex items-center gap-2 text-sm">
                    {isSocketConnecting && (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span className="text-muted-foreground">Connecting...</span>
                        </>
                    )}
                    {isSocketConnected && (
                        <>
                            <div className="size-2 bg-green-500 rounded-full" />
                            <span className="text-green-500">Connected</span>
                        </>
                    )}
                    {!isSocketConnecting && !isSocketConnected && token && (
                        <>
                            <div className="size-2 bg-red-500 rounded-full" />
                            <span className="text-red-500">Disconnected</span>
                        </>
                    )}
                </div>
            </div>

            <Card className="border-white/5 bg-card/20 backdrop-blur-xl overflow-hidden">
                <div className="flex h-[calc(100vh-250px)]">
                    {/* Sidebar - Conversation List */}
                    <div className="w-80 border-r border-white/10 flex flex-col">
                        <CardHeader className="border-b border-white/5 pb-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search conversations..."
                                    className="pl-10 bg-white/5 border-white/10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-1">Filter:</span>
                                {CATEGORIES.map(cat => (
                                    <Badge
                                        key={cat.value}
                                        variant={selectedCategory === cat.value ? 'default' : 'secondary'}
                                        className={cn(
                                            "cursor-pointer whitespace-nowrap text-[10px] px-2 py-0 h-5 transition-all hover:scale-105 active:scale-95 border-none",
                                            selectedCategory === cat.value
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                        )}
                                        onClick={() => setSelectedCategory(cat.value)}
                                    >
                                        {cat.label}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <div key={i} className="p-4 border-b border-white/5 animate-pulse">
                                        <div className="h-10 bg-white/5 rounded" />
                                    </div>
                                ))
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground italic">
                                    No conversations found.
                                </div>
                            ) : (
                                filteredConversations.map((c: IConversation) => (
                                    <div
                                        key={c._id}
                                        onClick={() => setSelectedConvo(c)}
                                        className={cn(
                                            "p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5",
                                            selectedConvo?._id === c._id && "bg-primary/10 border-l-2 border-l-primary"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center relative">
                                                <User className="size-5 text-primary" />
                                                {c.unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] size-4 rounded-full flex items-center justify-center animate-pulse">
                                                        {c.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm truncate">{getParticipantName(c)}</p>
                                                    {c.category && c.category !== 'general' && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 opacity-60">
                                                            {c.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className={cn(
                                                    "text-xs truncate",
                                                    c.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                                )}>
                                                    {c.lastMessage || 'No messages'}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedConvo ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-white/10 bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                <User className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold">{getParticipantName(selectedConvo)}</p>
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {selectedConvo.category || 'general'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Active conversation</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleToggleHide}
                                                className="text-muted-foreground hover:text-foreground"
                                                title={selectedConvo.isHidden ? 'Unhide' : 'Hide Spam/Spam'}
                                            >
                                                {selectedConvo.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                                            </Button>
                                            <Tag className="size-4 text-muted-foreground" />
                                            <Select
                                                value={selectedConvo.category || 'general'}
                                                onValueChange={handleUpdateCategory}
                                            >
                                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.filter(cat => cat.value !== 'all').map(cat => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                                    {isLoadingMessages ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="size-8 animate-spin text-primary" />
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((msg, i) => {
                                                const isAdmin = msg.senderRole === 'ADMIN' || msg.senderRole === 'admin';
                                                return (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "flex",
                                                            isAdmin ? "justify-end" : "justify-start"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "max-w-[70%] rounded-2xl px-4 py-2",
                                                            isAdmin
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted"
                                                        )}>
                                                            {/* Only show "Admin" for admin messages, hide name for users */}
                                                            {isAdmin && (
                                                                <p className="text-xs font-bold mb-1 text-primary-foreground/80">
                                                                    Admin
                                                                </p>
                                                            )}
                                                            <p className="text-sm">{msg.content}</p>
                                                            <div className="flex justify-between items-center gap-4 mt-1">
                                                                <p className={cn(
                                                                    "text-[10px]",
                                                                    isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"
                                                                )}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-white/10 bg-white/5">
                                    <div className="flex gap-2">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Type your reply..."
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            className="flex-1"
                                            disabled={!isSocketConnected}
                                        />
                                        <Button onClick={handleSend} className="px-6" disabled={!isSocketConnected}>
                                            <Send className="size-4 mr-2" />
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <MessageCircle className="size-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Select a conversation</p>
                                <p className="text-sm">Choose a conversation from the left to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}