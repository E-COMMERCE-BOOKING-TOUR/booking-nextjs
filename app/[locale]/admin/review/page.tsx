"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Star, MoreVertical, Trash2, Eye, EyeOff, ThumbsUp, Flag, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HasPermission } from "@/components/auth/HasPermission";
import { adminReviewApi } from "@/apis/admin/review";
import { adminTourApi } from "@/apis/admin/tour";
import { Separator } from "@/components/ui/separator";
import { IReview } from "@/types/response/review.type";
import { IAdminTour } from "@/types/admin/tour.dto";
import { useTranslations } from "next-intl";

export default function AdminReview() {
  const t = useTranslations("admin");
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  // Filters State
  const [keyword, setKeyword] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");
  const [tourId, setTourId] = React.useState<string>("all");
  const [debouncedKeyword, setDebouncedKeyword] = React.useState("");

  // Debounce keyword
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews', token, debouncedKeyword, status, tourId],
    queryFn: () => adminReviewApi.getAll({
      keyword: debouncedKeyword || undefined,
      status: status === "all" ? undefined : status,
      tour_id: tourId === "all" ? undefined : Number(tourId),
      sortOrder: 'DESC'
    }, token),
    enabled: !!token,
  });

  // Fetch Tours for filter
  const { data: toursData } = useQuery({
    queryKey: ['admin-tours-minimal', token],
    queryFn: () => adminTourApi.getAll({ limit: 100 }, token),
    enabled: !!token,
  });
  const tours = toursData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminReviewApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(t('toast_delete_success'));
    },
    onError: (error: Error) => {
      toast.error(error?.message || t('toast_delete_error'));
    }
  });

  const filteredReviews = Array.isArray(reviews) ? reviews : [];

  const toggleVisibilityMutation = useMutation({
    mutationFn: (id: number) => adminReviewApi.toggleVisibility(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(t('toast_update_role_success'));
    },
    onError: (error: Error) => {
      toast.error(error?.message || t('toast_update_user_error'));
    }
  });

  const handleToggleVisibility = (id: number) => {
    toggleVisibilityMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (confirm(t('confirm_delete_review_desc'))) {
      deleteMutation.mutate(id);
    }
  };

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-review-stats', token],
    queryFn: () => adminReviewApi.getStats(token),
    enabled: !!token,
  });

  const getStatsChartData = () => {
    if (!stats) return [];
    const breakdown = stats.rating_breakdown || {};
    return [
      { name: t('star_count', { count: 5 }), value: breakdown[5] || 0, fill: '#eab308' },
      { name: t('star_count', { count: 4 }), value: breakdown[4] || 0, fill: '#facc15' },
      { name: t('star_count', { count: 3 }), value: breakdown[3] || 0, fill: '#fde047' },
      { name: t('star_count', { count: 2 }), value: breakdown[2] || 0, fill: '#fef08a' },
      { name: t('star_single'), value: breakdown[1] || 0, fill: '#fef9c3' },
    ];
  };




  const chartData = getStatsChartData();

  if (isLoading) return <div>{t('loading_status')}</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards (Keep visual) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">{t('review_statistics_title')}</CardTitle>
            <CardDescription>{t('ratings_distribution_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              {isStatsLoading ? (
                <div className="flex items-center justify-center h-full">{t('loading_stats')}</div>
              ) : (
                <div className="flex gap-4 h-full">
                  <div className="flex-1 h-full">
                    <BarChart id="chart-review" width={500} height={250} data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right' }} />
                    </BarChart>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">{t('ratings_title')}</CardTitle>
            <CardAction>
              <Button variant="ghost" size="icon-sm"><MoreVertical className="size-4" /></Button>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Rating Visuals */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-5 ${i < 4 ? "text-yellow-500" : "text-muted-foreground"}`} />
                ))}
              </div>
              <div className="text-xl font-semibold">{stats?.average_rating || 0}</div>
              <div className="text-xs text-muted-foreground">{t('average_rating_desc', { count: stats?.total_reviews || 0 })}</div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-500 font-medium">{t('status_approved')}</span>
                <span>{stats?.status_breakdown?.approved || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-500 font-medium">{t('status_pending')}</span>
                <span>{stats?.status_breakdown?.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-rose-500 font-medium">{t('status_rejected')}</span>
                <span>{stats?.status_breakdown?.rejected || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-sm font-medium">{t('search_reviews_label')}</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search_reviews_placeholder')}
                  className="pl-9"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword("")}
                    className="absolute right-2.5 top-2.5"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="w-full space-y-1.5">
              <label className="text-sm font-medium">{t('filter_by_tour_label')}</label>
              <Select value={tourId} onValueChange={setTourId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('all_tours_option')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_tours_option')}</SelectItem>
                  {tours.map((t: IAdminTour) => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-1.5">
              <label className="text-sm font-medium">{t('status_filter_label')}</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('all_status_option')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_status_option')}</SelectItem>
                  <SelectItem value="approved">{t('status_approved')}</SelectItem>
                  <SelectItem value="pending">{t('status_pending')}</SelectItem>
                  <SelectItem value="rejected">{t('status_rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setKeyword("");
                setStatus("all");
                setTourId("all");
              }}
            >
              {t('reset_button')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">{t('traveler_feedback_title')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
              <div>{t('loading_reviews')}</div>
            ) : filteredReviews.map((f: IReview) => (
              <Card key={f.id} className={f.status === 'rejected' ? 'opacity-60 bg-gray-800' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={f.user?.full_name}
                      image={f.user?.avatar || undefined}
                      className="size-10 border"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {f.user?.full_name || t('review_unknown_user')}
                            {f.is_reported && <Flag className="size-3 text-red-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{f.tour?.title || t('unknown_tour')}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <HasPermission permission="review:delete">
                              <DropdownMenuItem onClick={() => handleToggleVisibility(f.id)}>
                                {f.status === 'approved' ? (
                                  <>
                                    <EyeOff className="mr-2 size-4" /> {t('hide_review_action')}
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 size-4" /> {t('show_review_action')}
                                  </>
                                )}
                              </DropdownMenuItem>
                            </HasPermission>
                            <HasPermission permission="review:delete">
                              <DropdownMenuItem onClick={() => handleDelete(f.id)} className="text-rose-500">
                                <Trash2 className="mr-2 size-4" /> {t('action_delete')}
                              </DropdownMenuItem>
                            </HasPermission>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-3 ${i < Math.round(f.rating) ? "text-yellow-500" : "text-muted-foreground"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">{f.rating}</span>
                      </div>
                      <div className="font-bold text-sm mt-2">{f.title}</div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{f.content || t('no_content_msg')}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {f.created_at ? new Date(f.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="size-3" /> {t('helpful_count_desc', { count: f.helpful_count || 0 })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div>{t('showing_reviews_count_total', { count: filteredReviews.length })}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}