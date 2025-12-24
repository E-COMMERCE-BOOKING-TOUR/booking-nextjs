"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Star, MoreVertical, Trash2, Eye, EyeOff, ThumbsUp, Flag } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminReviewApi } from "@/apis/admin/review";
import { Separator } from "@/components/ui/separator";

export default function AdminReview() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews', token],
    queryFn: () => adminReviewApi.getAll(token),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminReviewApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success("Review deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete review");
    }
  });

  const filteredReviews = Array.isArray(reviews) ? reviews : [];

  const toggleVisibilityMutation = useMutation({
    mutationFn: (id: number) => adminReviewApi.toggleVisibility(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success("Review visibility updated");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update visibility");
    }
  });

  const handleToggleVisibility = (id: number) => {
    toggleVisibilityMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
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
      { name: '5 Stars', value: breakdown[5] || 0, fill: '#eab308' },
      { name: '4 Stars', value: breakdown[4] || 0, fill: '#facc15' },
      { name: '3 Stars', value: breakdown[3] || 0, fill: '#fde047' },
      { name: '2 Stars', value: breakdown[2] || 0, fill: '#fef08a' },
      { name: '1 Star', value: breakdown[1] || 0, fill: '#fef9c3' },
    ];
  };

  const getStatusChartData = () => {
    if (!stats) return [];
    const breakdown = stats.status_breakdown || {};
    return [
      { name: 'Approved', value: breakdown['approved'] || 0, fill: '#22c55e' },
      { name: 'Pending', value: breakdown['pending'] || 0, fill: '#f59e0b' },
      { name: 'Rejected', value: breakdown['rejected'] || 0, fill: '#ef4444' },
    ];
  };


  const chartData = getStatsChartData();
  const statusData = getStatusChartData();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards (Keep visual) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Review Statistics</CardTitle>
            <CardDescription>Ratings Distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              {isStatsLoading ? (
                <div className="flex items-center justify-center h-full">Loading stats...</div>
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
            <CardTitle className="text-xl">Ratings</CardTitle>
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
              <div className="text-xs text-muted-foreground">from {stats?.total_reviews || 0} reviews</div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-500 font-medium">Approved</span>
                <span>{stats?.status_breakdown?.approved || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-500 font-medium">Pending</span>
                <span>{stats?.status_breakdown?.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-rose-500 font-medium">Rejected</span>
                <span>{stats?.status_breakdown?.rejected || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Traveler Feedback</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
              <div>Loading reviews...</div>
            ) : filteredReviews.map((f: any) => (
              <Card key={f.id} className={f.status === 'rejected' ? 'opacity-60 bg-gray-800' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={f.user?.full_name}
                      image={f.user?.avatar}
                      className="size-10 border"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {f.user?.full_name || "Unknown User"}
                            {f.is_reported && <Flag className="size-3 text-red-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{f.tour?.title || "Unknown Tour"}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleVisibility(f.id)}>
                              {f.status === 'approved' ? (
                                <>
                                  <EyeOff className="mr-2 size-4" /> Hide Review
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 size-4" /> Show Review
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(f.id)} className="text-rose-500">
                              <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
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
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{f.content || "No content"}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {new Date(f.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="size-3" /> {f.helpful_count || 0} Helpful
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div>Showing {filteredReviews.length} reviews</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}