"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTourApi } from '@/apis/admin/tour';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IAdminTour } from '@/types/admin/tour.dto';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Clock,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterBar } from '@/components/admin/AdminFilterBar';
import { AdminSelect } from '@/components/admin/AdminSelect';
import { HasPermission } from '@/components/auth/HasPermission';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/libs/utils';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslations, useFormatter } from 'next-intl';

export default function AdminTourListPage() {
  const t = useTranslations("admin");
  const format = useFormatter();
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  // Filter form for staged inputs
  interface TourFilterForm {
    keyword: string;
    status: string;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }

  const filterForm = useForm<TourFilterForm>({
    defaultValues: {
      keyword: '',
      status: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  // Applied filter values (what is used in API query)
  const [appliedFilters, setAppliedFilters] = useState<TourFilterForm>({
    keyword: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [report, setReport] = useState<{
    isVisiblePublic: boolean;
    title: string;
    checks: Record<string, boolean>;
    issues: string[];
  } | null>(null);


  const { data: tourResponse, isLoading } = useQuery({
    queryKey: ['admin-tours', appliedFilters.keyword, appliedFilters.status, currentPage, appliedFilters.sortBy, appliedFilters.sortOrder],
    queryFn: () => adminTourApi.getAll({
      keyword: appliedFilters.keyword,
      status: appliedFilters.status,
      page: currentPage,
      limit: 10,
      sortBy: appliedFilters.sortBy,
      sortOrder: appliedFilters.sortOrder
    }, token),
    enabled: !!token,
  });

  const handleSearch = filterForm.handleSubmit((data) => {
    setAppliedFilters(data);
    setCurrentPage(1);
  });

  const handleClear = () => {
    const defaultValues = {
      keyword: '',
      status: '',
      sortBy: 'created_at',
      sortOrder: 'DESC' as const
    };
    filterForm.reset(defaultValues);
    setAppliedFilters(defaultValues);
    setCurrentPage(1);
  };


  const isInitialLoading = isLoading || sessionStatus === 'loading';
  const tours = tourResponse?.data || [];
  const pagination = {
    total: tourResponse?.total || 0,
    page: tourResponse?.page || 1,
    limit: tourResponse?.limit || 10,
    totalPages: tourResponse?.totalPages || 1
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminTourApi.remove(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success(t('toast_delete_tour_success'));
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(t('toast_delete_tour_error', { error: err.message }));
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) =>
      adminTourApi.updateStatus(id, status, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success(t('toast_status_update_success'));
    },
  });

  const checkVisibility = async (id: number) => {
    try {
      const data = await adminTourApi.getVisibilityReport(id, token);
      setReport(data);
    } catch (err: unknown) {
      toast.error(t('toast_delete_tour_error', { error: err instanceof Error ? err.message : String(err) }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">{t('status_active')}</Badge>;
      case 'inactive': return <Badge variant="secondary" className="bg-slate-500/15 text-slate-600 border-slate-500/20">{t('status_inactive')}</Badge>;
      case 'draft': return <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/20">{t('status_draft')}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const statusOptions = [
    { label: t('all_status_option'), value: 'all' },
    { label: t('status_active'), value: 'active' },
    { label: t('status_inactive'), value: 'inactive' },
    { label: t('status_draft'), value: 'draft' }
  ];

  const sortOptions = [
    { label: t('sort_newest'), value: 'created_at-DESC' },
    { label: t('sort_oldest'), value: 'created_at-ASC' },
    { label: t('sort_name_az'), value: 'title-ASC' },
    { label: t('sort_name_za'), value: 'title-DESC' }
  ];

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminPageHeader
        title={t('tour_management_title')}
        description={t('tour_management_desc')}
      >
        <HasPermission permission="tour:create">
          <Link href="/admin/tour/create">
            <Button className="bg-primary hover:bg-primary/90 shadow-sm">
              <Plus className="mr-2 size-4" /> {t('add_new_tour_button')}
            </Button>
          </Link>
        </HasPermission>
      </AdminPageHeader>

      <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
        <AdminFilterBar
          searchPlaceholder={t('search_tour_placeholder')}
          searchTerm={filterForm.watch('keyword')}
          onSearchChange={(val) => filterForm.setValue('keyword', val)}
          onSearch={handleSearch}
          onClear={handleClear}
          isFiltered={filterForm.watch('keyword') !== '' || filterForm.watch('status') !== ''}
        >
          <AdminSelect
            value={filterForm.watch('status') || 'all'}
            onValueChange={(val: string) => {
              filterForm.setValue('status', val === 'all' ? '' : val);
            }}
            placeholder={t('status_filter_label')}
            options={statusOptions}
          />

          <AdminSelect
            value={`${filterForm.watch('sortBy')}-${filterForm.watch('sortOrder')}`}
            onValueChange={(val: string) => {
              const [field, order] = val.split('-');
              filterForm.setValue('sortBy', field);
              filterForm.setValue('sortOrder', order as 'ASC' | 'DESC');
            }}
            placeholder={t('sort_by_label')}
            options={sortOptions}
          />
        </AdminFilterBar>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground font-medium uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-4">{t('col_tour_info')}</th>
                  <th className="px-6 py-4 hidden md:table-cell">{t('col_location')}</th>
                  <th className="px-6 py-4">{t('col_duration')}</th>
                  <th className="px-6 py-4">{t('col_status')}</th>
                  <th className="px-6 py-4 text-right">{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted-foreground/10">
                {isInitialLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 bg-muted rounded w-48" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-10 ml-auto" /></td>
                    </tr>
                  ))
                ) : tours.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      {t('no_matching_tours')}
                    </td>
                  </tr>
                ) : tours.map((tour: IAdminTour) => (
                  <tr key={tour.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-md bg-muted overflow-hidden flex-shrink-0 border">
                          {tour.images?.[0] ? (
                            <Image src={tour.images[0].image_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <Tag className="size-5 m-2.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-[200px] uppercase tracking-tight">
                            {tour.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                              ID: {tour.id}
                            </span>
                            {tour.tour_categories?.[0]?.name && (
                              <span className="truncate">• {tour.tour_categories[0].name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-start gap-1.5 text-muted-foreground">
                        <MapPin className="size-3.5 mt-0.5 flex-shrink-0" />
                        <span className="truncate max-w-[180px] text-xs leading-tight">
                          {tour.address || tour.division?.name_local || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
                        <Clock className="size-3.5" />
                        <span className="text-xs">
                          {tour.duration_days}D{tour.duration_hours}H
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tour.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <HasPermission permission="tour:update">
                          <Link href={`/admin/tour/edit/${tour.id}`}>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/5">
                              <Edit className="size-4" />
                            </Button>
                          </Link>
                        </HasPermission>
                        <HasPermission permission="tour:read">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "size-8",
                              tour.is_visible ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            )}
                            onClick={() => checkVisibility(tour.id)}
                          >
                            {tour.is_visible ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
                          </Button>
                        </HasPermission>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 shadow-lg">
                            <DropdownMenuLabel>{t('col_actions')}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => window.open(`/tour/${tour.slug}`, '_blank')}>
                              <Eye className="size-4 mr-2" /> {t('action_view_on_web')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase pb-1">{t('col_status')}</DropdownMenuLabel>
                            <HasPermission permission="tour:publish">
                              <DropdownMenuItem
                                onClick={() => statusMutation.mutate({ id: tour.id, status: 'active' })}
                                disabled={tour.status === 'active'}
                                className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                              >
                                {t('action_activate')}
                              </DropdownMenuItem>
                            </HasPermission>
                            <HasPermission permission="tour:publish">
                              <DropdownMenuItem
                                onClick={() => statusMutation.mutate({ id: tour.id, status: 'inactive' })}
                                disabled={tour.status === 'inactive'}
                                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50"
                              >
                                {t('action_deactivate')}
                              </DropdownMenuItem>
                            </HasPermission>
                            <DropdownMenuSeparator />
                            <HasPermission permission="tour:delete">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/5"
                                onClick={() => setDeleteId(tour.id)}
                              >
                                <Trash2 className="size-4 mr-2" /> {t('action_delete_tour')}
                              </DropdownMenuItem>
                            </HasPermission>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
              <div className="text-xs text-muted-foreground">
                {t.rich('showing_tours_count', {
                  start: (pagination.page - 1) * pagination.limit + 1,
                  end: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total,
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-8 border-muted-foreground/20"
                >
                  {t('action_previous')}
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === pagination.totalPages || (p >= pagination.page - 1 && p <= pagination.page + 1)) {
                      return (
                        <Button
                          key={p}
                          variant={pagination.page === p ? "default" : "ghost"}
                          size="icon"
                          className="size-8 text-xs"
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </Button>
                      );
                    } else if (p === pagination.page - 2 || p === pagination.page + 2) {
                      return <span key={p} className="text-muted-foreground">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-8 border-muted-foreground/20"
                >
                  {t('action_next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete_tour_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {t('action_confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={report !== null} onOpenChange={(open) => !open && setReport(null)}>
        <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {report?.isVisiblePublic ? (
                <ShieldCheck className="text-emerald-500 size-6" />
              ) : (
                <ShieldAlert className="text-amber-500 size-6" />
              )}
              {t('visibility_report_title')}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {t('visibility_report_desc', { title: report?.title || "" })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className={cn(
              "p-4 rounded-lg flex items-center justify-between",
              report?.isVisiblePublic ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"
            )}>
              <span className="font-semibold">{t('public_status_label')}</span>
              <Badge variant={report?.isVisiblePublic ? "default" : "destructive"} className={cn(
                report?.isVisiblePublic ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {report?.isVisiblePublic ? t('visible_status') : t('hidden_status')}
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('checklist_title')}</h4>
              <ul className="space-y-2">
                {[
                  { label: t('checklist_status_active'), value: report?.checks?.status },
                  { label: t('checklist_visible_toggle'), value: report?.checks?.is_visible },
                  { label: t('checklist_has_images'), value: report?.checks?.has_images },
                  { label: t('checklist_has_variants'), value: report?.checks?.has_variants },
                  { label: t('checklist_has_active_variants'), value: report?.checks?.has_active_variants },
                  { label: t('checklist_has_pricing'), value: report?.checks?.has_pricing },
                  { label: t('checklist_has_sessions'), value: report?.checks?.has_upcoming_sessions },
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.label}</span>
                    {item.value ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <X className="size-4 text-red-500" />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {report?.issues && report.issues.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {t('issues_to_fix_title')}
                </h4>
                <ul className="space-y-1">
                  {report?.issues?.map((issue: string, i: number) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="mt-1 size-1 rounded-full bg-red-400 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setReport(null)} className="w-full sm:w-auto">
              {t('close_diagnostic_button')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}