"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, Send, User, Loader2, EyeOff, Eye, Brain, UserCheck, Volume2 } from 'lucide-react';
import { adminChatboxApi } from '@/apis/admin/chatbox';
import { supplierChatboxApi } from '@/apis/admin/supplier-chatbox';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

export default function AdminMessagePage() {
    const t = useTranslations('admin');
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.user?.accessToken;
    const userRole = session?.user?.role?.name?.toLowerCase();
    const isAdmin = userRole === 'admin';
    const isSupplier = userRole === 'supplier';

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedConvo, setSelectedConvo] = useState<IConversation | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isSocketConnecting, setIsSocketConnecting] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [soundEnabled, setSoundEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

    // Initialize notification sound
    useEffect(() => {
        // Use absolute URL to avoid locale prefix issue
        const soundUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/sounds/notification.mp3`
            : '/sounds/notification.mp3';
        notificationSoundRef.current = new Audio(soundUrl);
        notificationSoundRef.current.volume = 0.5;
    }, []);

    // Play notification sound
    const playNotificationSound = useCallback(() => {
        if (soundEnabled && notificationSoundRef.current) {
            notificationSoundRef.current.currentTime = 0;
            notificationSoundRef.current.play().catch(() => {
                // Ignore autoplay errors
            });
        }
    }, [soundEnabled]);

    const getCategories = () => [
        { value: 'all', label: t('category_all') },
        { value: 'general', label: t('category_general') },
        { value: 'support', label: t('category_support') },
        { value: 'urgent', label: t('category_urgent') },
        { value: 'tour_query', label: t('category_tour_query') },
        { value: 'hidden', label: t('category_hidden') },
        { value: 'empty', label: t('category_empty', { defaultValue: 'Empty' }) },
    ];

    // Fetch conversations using react-query - use appropriate API based on role
    const { data: conversationsData, isLoading, refetch } = useQuery({
        queryKey: ['chatbox-conversations', token, userRole],
        queryFn: () => isSupplier
            ? supplierChatboxApi.getAllConversations(100, token)
            : adminChatboxApi.getAllConversations(100, token),
        enabled: !!token && (isAdmin || isSupplier),
    });

    const conversations = (conversationsData as IConversationListResponse)?.data || [];

    // Filter conversations
    const filteredConversations = conversations.filter((c: IConversation) => {
        const matchesSearch = !searchTerm || getParticipantName(c).toLowerCase().includes(searchTerm.toLowerCase());
        const isEmpty = !c.lastMessage;

        let matchesCategory = false;
        switch (selectedCategory) {
            case 'all':
                // Show non-hidden and non-empty by default
                matchesCategory = !c.isHidden && !isEmpty;
                break;
            case 'hidden':
                matchesCategory = !!c.isHidden;
                break;
            case 'empty':
                matchesCategory = isEmpty && !c.isHidden;
                break;
            default:
                matchesCategory = c.category === selectedCategory && !c.isHidden;
        }

        return matchesSearch && matchesCategory;
    });

    // Socket connection - only connect when token is available
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_CHATBOX_WS_URL;
        if (!socketUrl || !token) return;

        Promise.resolve().then(() => setIsSocketConnecting(true));
        const s = io(socketUrl, {
            transports: ['websocket'],
            auth: { token: token } // Pass token for authentication
        });

        s.on('connect', () => {
            console.log('Admin socket connected');
            setIsSocketConnected(true);
            setIsSocketConnecting(false);
        });

        s.on('authenticated', (data: { user?: { full_name: string } }) => {
            console.log('Admin authenticated as:', data.user?.full_name);
        });

        s.on('error', (err: unknown) => {
            console.error('Admin socket error:', err);
            setIsSocketConnecting(false);
            setIsSocketConnected(false);
        });

        s.on('disconnect', () => {
            console.log('Admin socket disconnected');
            setIsSocketConnected(false);
        });

        // Listen for admin-specific new message notifications (from users)
        s.on('adminNewMessage', (msg: IMessage) => {
            console.log('Admin received new message from user:', msg);
            refetch(); // Refresh conversation list on new message
            import('sonner').then(({ toast }) => {
                toast(t('new_message_from', { name: msg.senderName || t('unknown_user') }), {
                    description: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
                    action: {
                        label: t('view'),
                        onClick: () => {
                            // Find the conversation and select it
                            const convo = conversations.find(c => c._id === msg.conversationId);
                            if (convo) setSelectedConvo(convo);
                        }
                    }
                });
            });
            playNotificationSound();
        });

        // User presence tracking
        s.on('userJoined', (data: { conversationId: string; userId: string }) => {
            setOnlineUsers(prev => new Set(prev).add(data.userId));
        });

        s.on('userLeft', (data: { conversationId: string; userId: string }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        });

        s.on('roomUsers', (data: { conversationId: string; users: string[] }) => {
            setOnlineUsers(new Set(data.users));
        });

        Promise.resolve().then(() => setSocket(s));
        return () => {
            s.disconnect();
            setSocket(null);
            setIsSocketConnected(false);
            setOnlineUsers(new Set());
        };
    }, [token, refetch, playNotificationSound]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // Handle conversation selection
    useEffect(() => {
        if (selectedConvo && socket && isSocketConnected && token) {
            Promise.resolve().then(() => {
                setMessages([]);
                setIsLoadingMessages(true);
            });

            // Mark as read
            if (selectedConvo.unreadCount > 0) {
                const markReadApi = isSupplier ? supplierChatboxApi : adminChatboxApi;
                markReadApi.markAsRead(selectedConvo._id, token)
                    .then(() => refetch());
            }

            socket.emit('joinRoom', { conversationId: selectedConvo._id });

            const getDetailsApi = isSupplier ? supplierChatboxApi : adminChatboxApi;
            getDetailsApi.getConversationDetails(selectedConvo._id, token)
                .then((msgs: unknown) => {
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
    }, [selectedConvo, socket, isSocketConnected, token, refetch]);


    const handleSend = () => {
        if (!input.trim() || !selectedConvo || !token || !isSocketConnected) return;

        const replyApi = isSupplier ? supplierChatboxApi : adminChatboxApi;
        replyApi.reply(selectedConvo._id, input, token)
            .then(() => setInput(''));
    };

    function getParticipantName(c: IConversation) {
        // For admin: show non-admin participant
        // For supplier: show USER participant (not themselves)
        const excludeRoles = isSupplier
            ? ['SUPPLIER', 'supplier']
            : ['ADMIN', 'admin'];
        const p = c.participants.find((p: { role: string; name?: string; userId?: string }) =>
            !excludeRoles.includes(p.role)
        );
        return p?.name || p?.userId || t('unknown_user');
    }

    function getParticipantUserId(c: IConversation): string | null {
        const excludeRoles = isSupplier
            ? ['SUPPLIER', 'supplier']
            : ['ADMIN', 'admin'];
        const p = c.participants.find((p: { role: string; userId?: string }) =>
            !excludeRoles.includes(p.role)
        );
        return p?.userId || null;
    }

    function isUserOnline(c: IConversation): boolean {
        const userId = getParticipantUserId(c);
        return userId ? onlineUsers.has(userId) : false;
    }

    /**
     * Determine if this is an admin or supplier conversation
     * Returns 'ADMIN' or 'SUPPLIER'
     */
    function getChatTargetType(c: IConversation): 'ADMIN' | 'SUPPLIER' {
        const hasSupplier = c.participants.some(
            (p: { role: string }) => p.role === 'SUPPLIER' || p.role === 'supplier'
        );
        return hasSupplier ? 'SUPPLIER' : 'ADMIN';
    }

    /**
     * Get supplier info from conversation (name from participant or context)
     */
    function getSupplierInfo(c: IConversation): { name?: string; id?: string } | null {
        const supplierParticipant = c.participants.find(
            (p: { role: string; name?: string; userId?: string }) =>
                p.role === 'SUPPLIER' || p.role === 'supplier'
        );
        if (supplierParticipant) {
            return {
                name: supplierParticipant.name || (c as any).context?.supplierName,
                id: supplierParticipant.userId
            };
        }
        return null;
    }

    const handleUpdateCategory = async (category: string) => {
        if (!selectedConvo || !token) return;
        try {
            await adminChatboxApi.updateCategory(selectedConvo._id, category, token);
            toast.success(t('toast_category_updated'));
            // Update local state so UI reflects it immediately
            setSelectedConvo({ ...selectedConvo, category });
            refetch();
        } catch {
            toast.error(t('toast_failed_update_category'));
        }
    };

    const handleToggleHide = async () => {
        if (!selectedConvo || !token) return;
        const newHiddenStatus = !selectedConvo.isHidden;
        try {
            await adminChatboxApi.toggleHide(selectedConvo._id, newHiddenStatus, token);
            toast.success(newHiddenStatus ? t('toast_convo_hidden') : t('toast_convo_unhidden'));
            setSelectedConvo({ ...selectedConvo, isHidden: newHiddenStatus });
            refetch();
        } catch {
            toast.error(t('toast_failed_update_visibility'));
        }
    };

    const handleToggleAi = async (checked: boolean) => {
        if (!selectedConvo || !token) return;
        try {
            await adminChatboxApi.toggleAi(selectedConvo._id, checked, token);
            toast.success(checked ? t('toast_ai_enabled') : t('toast_ai_disabled'));
            setSelectedConvo({ ...selectedConvo, isAiEnabled: checked });
            refetch();
        } catch {
            toast.error(t('toast_failed_update_ai'));
        }
    };

    const handleToggleHuman = async (checked: boolean) => {
        if (!selectedConvo || !token) return;
        try {
            await adminChatboxApi.toggleHumanTakeover(selectedConvo._id, checked, token);
            toast.success(checked ? t('toast_human_takeover_active') : t('toast_human_intervention_ended'));
            setSelectedConvo({ ...selectedConvo, isHumanTakeover: checked });
            refetch();
        } catch {
            toast.error(t('toast_failed_update_takeover'));
        }
    };

    // Show loading while session is loading
    if (sessionStatus === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t('message_management_title')}</h1>
                    <p className="text-muted-foreground mt-1 text-lg">{t('message_management_desc')}</p>
                </div>
                {/* Socket status indicator */}
                <div className="flex items-center gap-2 text-sm">
                    {isSocketConnecting && (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span className="text-muted-foreground">{t('socket_connecting')}</span>
                        </>
                    )}
                    {isSocketConnected && (
                        <>
                            <div className="size-2 bg-green-500 rounded-full" />
                            <span className="text-green-500">{t('socket_connected')}</span>
                        </>
                    )}
                    {!isSocketConnecting && !isSocketConnected && token && (
                        <>
                            <div className="size-2 bg-red-500 rounded-full" />
                            <span className="text-red-500">{t('socket_disconnected')}</span>
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
                                    placeholder={t('search_conversations_placeholder')}
                                    className="pl-10 bg-white/5 border-white/10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-1">{t('filter_label')}:</span>
                                {getCategories().map(cat => (
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
                                        {t(`category_${cat.value}`)}
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
                                    {t('no_conversations_found')}
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
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-sm truncate max-w-[120px]">{getParticipantName(c)}</p>
                                                    {c.category && c.category !== 'general' && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 opacity-60 shrink-0">
                                                            {t(`category_${c.category}`)}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {/* Show chat target type: Admin or Supplier - on separate line */}
                                                {isAdmin && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {getChatTargetType(c) === 'SUPPLIER'
                                                            ? `${getSupplierInfo(c)?.name || t('supplier')}`
                                                            : `${t('admin')}`
                                                        }
                                                    </span>
                                                )}
                                                <p className={cn(
                                                    "text-xs truncate",
                                                    c.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                                )}>
                                                    {c.lastMessage || t('no_messages')}
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
                                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center relative">
                                                <User className="size-5 text-primary" />
                                                {/* Online status indicator */}
                                                <div className={cn(
                                                    "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background",
                                                    isUserOnline(selectedConvo) ? "bg-green-500" : "bg-gray-400"
                                                )} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold">{getParticipantName(selectedConvo)}</p>
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {t(`category_${selectedConvo.category || 'general'}`)}
                                                    </Badge>
                                                </div>
                                                <p className={cn(
                                                    "text-xs",
                                                    isUserOnline(selectedConvo) ? "text-green-500" : "text-muted-foreground"
                                                )}>
                                                    {isUserOnline(selectedConvo) ? t('user_online', { defaultValue: 'Online' }) : t('user_offline', { defaultValue: 'Offline' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Sound Toggle */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSoundEnabled(!soundEnabled)}
                                                className={cn(
                                                    "h-8 px-2",
                                                    soundEnabled ? "text-primary" : "text-muted-foreground"
                                                )}
                                                title={soundEnabled ? t('sound_on', { defaultValue: 'Sound On' }) : t('sound_off', { defaultValue: 'Sound Off' })}
                                            >
                                                <Volume2 className="size-4" />
                                            </Button>
                                            {/* AI Control Toggles */}
                                            <div className="flex items-center gap-6 border-x border-white/10 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <Brain className={cn("size-4", selectedConvo.isAiEnabled ? "text-primary" : "text-muted-foreground")} />
                                                    <Label htmlFor="ai-toggle" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('ai_assistant_label')}</Label>
                                                    <Switch
                                                        id="ai-toggle"
                                                        checked={!!selectedConvo.isAiEnabled}
                                                        onCheckedChange={handleToggleAi}
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <UserCheck className={cn("size-4", selectedConvo.isHumanTakeover ? "text-orange-500" : "text-muted-foreground")} />
                                                    <Label htmlFor="human-toggle" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{t('human_label')}</Label>
                                                    <Switch
                                                        id="human-toggle"
                                                        checked={!!selectedConvo.isHumanTakeover}
                                                        onCheckedChange={handleToggleHuman}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleToggleHide}
                                                    className="text-muted-foreground hover:text-foreground h-8"
                                                    title={selectedConvo.isHidden ? t('action_unhide') : t('action_hide_spam')}
                                                >
                                                    {selectedConvo.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                                                </Button>
                                                <Select
                                                    value={selectedConvo.category || 'general'}
                                                    onValueChange={handleUpdateCategory}
                                                >
                                                    <SelectTrigger className="w-[120px] h-8 text-[10px] uppercase font-bold tracking-wider">
                                                        <SelectValue placeholder={t('category_placeholder')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getCategories().filter(cat => cat.value !== 'all').map(cat => (
                                                            <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                                                {t(`category_${cat.value}`)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                                    {isLoadingMessages ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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
                                                                    {t('admin_label')}
                                                                </p>
                                                            )}
                                                            <p className="text-sm">{msg.content}</p>
                                                            {msg.senderRole === 'AI' && (
                                                                <Badge variant="outline" className="mt-1 text-[9px] h-4 bg-white/10 border-none text-primary-foreground/60">
                                                                    {t('ai_generated_label')}
                                                                </Badge>
                                                            )}
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
                                            placeholder={t('type_reply_placeholder')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            className="flex-1"
                                            disabled={!isSocketConnected}
                                        />
                                        <Button onClick={handleSend} className="px-6" disabled={!isSocketConnected}>
                                            <Send className="size-4 mr-2" />
                                            {t('send_button')}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <MessageCircle className="size-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">{t('select_conversation_prompt')}</p>
                                <p className="text-sm">{t('select_conversation_desc')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}