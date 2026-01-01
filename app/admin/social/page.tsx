"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
    TrendingUp,
    FileText,
    Heart,
    MessageCircle,
    Eye,
    Trash2,
    ExternalLink,
    MoreHorizontal
} from "lucide-react";
import { adminArticleApi } from "@/apis/admin/article";
import type { IArticlePopular } from "@/types/response/article";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StatCard = ({ title, value, icon, colorClass }: { title: string, value: number, icon: React.ReactNode, colorClass: string }) => (
    <Card className="border-white/5 bg-card/20 backdrop-blur-xl transition-all hover:bg-card/30">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{title}</p>
                    <h3 className="text-3xl font-black text-foreground">{value?.toLocaleString() || 0}</h3>
                </div>
                <div className={`p-4 rounded-2xl bg-white/5 ${colorClass}`}>
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

const AdminSocialPage = () => {
    const { data: session, status: sessionStatus } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const limit = 10;

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['admin-social-stats', token],
        queryFn: () => adminArticleApi.getStats(token),
        enabled: !!token
    });

    const { data: articlesData, isLoading: isLoadingArticles } = useQuery({
        queryKey: ['admin-social-articles', page, search, token],
        queryFn: () => adminArticleApi.getArticles({ limit, page, search }, token),
        enabled: !!token
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminArticleApi.deleteArticle(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-social-articles'] });
            queryClient.invalidateQueries({ queryKey: ['admin-social-stats'] });
            toast.success("Article deleted successfully");
            setDeleteId(null);
        },
        onError: () => toast.error("Failed to delete article")
    });

    const toggleVisibilityMutation = useMutation({
        mutationFn: (id: string) => adminArticleApi.toggleVisibility(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-social-articles'] });
            toast.success("Visibility updated");
        }
    });

    const isLoading = sessionStatus === 'loading' || isLoadingArticles;
    const articles = articlesData?.items || [];
    const total = articlesData?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Social Network Management</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Monitor and manage user-generated content across the platform.</p>
                </div>
            </div>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoadingStats ? (
                    [...Array(4)].map((_, i) => (
                        <Card key={i} className="h-32 animate-pulse bg-white/5" />
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Total Articles"
                            value={stats?.totalArticles}
                            icon={<FileText className="size-6 text-blue-500" />}
                            colorClass="border-blue-500/20"
                        />
                        <StatCard
                            title="Total Likes"
                            value={stats?.totalLikes}
                            icon={<Heart className="size-6 text-rose-500" />}
                            colorClass="border-rose-500/20"
                        />
                        <StatCard
                            title="Total Comments"
                            value={stats?.totalComments}
                            icon={<MessageCircle className="size-6 text-purple-500" />}
                            colorClass="border-purple-500/20"
                        />
                        <StatCard
                            title="Total Views"
                            value={stats?.totalViews}
                            icon={<TrendingUp className="size-6 text-emerald-500" />}
                            colorClass="border-emerald-500/20"
                        />
                    </>
                )}
            </div>

            {/* Article Management Table */}
            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
                <AdminFilterBar
                    searchPlaceholder="Search by title, username or content..."
                    searchTerm={search}
                    onSearchChange={setSearch}
                    onSearch={() => setPage(1)}
                    onClear={() => {
                        setSearch('');
                        setPage(1);
                    }}
                    isFiltered={search !== ''}
                />
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-sans">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Title</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Engagement</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Visibility</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4 h-16 bg-white/5"></td>
                                        </tr>
                                    ))
                                ) : articles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                            No articles found.
                                        </td>
                                    </tr>
                                ) : (
                                    articles.map((article: IArticlePopular) => (
                                        <tr key={article._id} className="group hover:bg-white/[0.05] transition-all">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground truncate max-w-[250px]">{article.title}</span>
                                                    <span className="text-[10px] text-muted-foreground tracking-wider font-medium">@{article.user_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg">
                                                        <Heart className="size-3" /> {article.count_likes}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-lg">
                                                        <MessageCircle className="size-3" /> {article.count_comments}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                                        <Eye className="size-3" /> {article.count_views}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {article.created_at ? format(new Date(article.created_at), 'MMM dd, yyyy') : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Switch
                                                    checked={article.is_visible}
                                                    onCheckedChange={() => article._id && toggleVisibilityMutation.mutate(article._id)}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="size-8 p-0">
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <a href={`/social/post/${article._id}`} target="_blank" className="cursor-pointer flex items-center">
                                                                <ExternalLink className="mr-2 size-4" />
                                                                Preview
                                                            </a>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => article._id && setDeleteId(article._id)}
                                                            className="text-rose-500 cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 size-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <CardFooter className="p-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full">
                        Showing {articles.length} of {total} articles
                    </p>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="bg-white/5 border-white/10 hover:bg-white/10"
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-black bg-primary/10 text-primary px-3 py-1 rounded-lg">
                            {page} / {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages || totalPages === 0}
                            onClick={() => setPage(p => p + 1)}
                            className="bg-white/5 border-white/10 hover:bg-white/10"
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-slate-950 border-white/10 backdrop-blur-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black">Confirm Deletion?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This action cannot be undone. The article will be permanently removed from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-foreground">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-rose-500 hover:bg-rose-600 font-bold"
                        >
                            Delete Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminSocialPage;
