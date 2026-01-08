"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Star, MoreVertical, Trash2, Eye, EyeOff, ThumbsUp, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
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
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminSelect } from "@/components/admin/AdminSelect";

export default function AdminReview() {
  const t = useTranslations("admin");
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  // Filter form for staged inputs
  interface ReviewFilterForm {
    keyword: string;
    status: string;
    tourId: string;
  }

  const filterForm = useForm<ReviewFilterForm>({
    defaultValues: {
      keyword: '',
      status: 'all',
      tourId: 'all'
    }
  });

  // Applied filter values (what is used in API query)
  const [appliedFilters, setAppliedFilters] = useState<ReviewFilterForm>({
    keyword: '',
    status: 'all',
    tourId: 'all'
  });

  const handleSearch = filterForm.handleSubmit((data) => {
    setAppliedFilters(data);
  });

  const handleClear = () => {
    const defaultValues = { keyword: '', status: 'all', tourId: 'all' };
    filterForm.reset(defaultValues);
    setAppliedFilters(defaultValues);
  };

  const isFiltered = appliedFilters.keyword !== '' || appliedFilters.status !== 'all' || appliedFilters.tourId !== 'all';

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const limitOptions = [6, 12, 24, 48];

  interface ReviewResponse {
    data: IReview[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

  const { data: reviewsData, isLoading } = useQuery<ReviewResponse>({
    queryKey: ['admin-reviews', token, appliedFilters.keyword, appliedFilters.status, appliedFilters.tourId, page, limit],
    queryFn: () => adminReviewApi.getAll({
      keyword: appliedFilters.keyword || undefined,
      status: appliedFilters.status === "all" ? undefined : appliedFilters.status,
      tour_id: appliedFilters.tourId === "all" ? undefined : Number(appliedFilters.tourId),
      sortOrder: 'DESC',
      page,
      limit
    }, token),
    enabled: !!token,
  });

  const reviews = reviewsData?.data || [];
  const total = reviewsData?.total || 0;
  const totalPages = reviewsData?.totalPages || 1;

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

  const handleSearchWithReset = filterForm.handleSubmit((data) => {
    setAppliedFilters(data);
    setPage(1); // Reset to page 1 when searching
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards (Keep visual) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card/20">
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
        <Card className="bg-card/20">
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
      <Card className="border-white/5 bg-card/20">
        <AdminFilterBar
          className="border-none pb-0 border-b-0"
          searchPlaceholder={t('search_reviews_placeholder')}
          searchTerm={filterForm.watch('keyword')}
          onSearchChange={(val) => filterForm.setValue('keyword', val)}
          onSearch={handleSearchWithReset}
          onClear={handleClear}
          isFiltered={isFiltered}
        >
          <AdminSelect
            value={filterForm.watch('tourId')}
            onValueChange={(val) => filterForm.setValue('tourId', val)}
            placeholder={t('filter_by_tour_label')}
            options={[
              { label: t('all_tours_option'), value: 'all' },
              ...tours.map((tour: IAdminTour) => ({
                label: tour.title,
                value: tour.id.toString()
              }))
            ]}
            width="w-[200px]"
          />
          <AdminSelect
            value={filterForm.watch('status')}
            onValueChange={(val) => filterForm.setValue('status', val)}
            placeholder={t('status_filter_label')}
            options={[
              { label: t('all_status_option'), value: 'all' },
              { label: t('status_approved'), value: 'approved' },
              { label: t('status_pending'), value: 'pending' },
              { label: t('status_rejected'), value: 'rejected' }
            ]}
          />
        </AdminFilterBar>
      </Card>

      <Card className="bg-card/20">
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

          {/* Pagination Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {t('showing_of_total', {
                  from: total > 0 ? (page - 1) * limit + 1 : 0,
                  to: Math.min(page * limit, total),
                  total
                })}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('per_page_label') || 'Per page'}:</span>
                <AdminSelect
                  value={limit.toString()}
                  onValueChange={(val) => {
                    setLimit(Number(val));
                    setPage(1);
                  }}
                  placeholder="12"
                  options={limitOptions.map((opt) => ({
                    label: opt.toString(),
                    value: opt.toString()
                  }))}
                  width="w-[80px]"
                />
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}