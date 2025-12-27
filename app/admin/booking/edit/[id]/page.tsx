"use client";

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminBookingApi } from '@/apis/admin/booking';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  CreditCard,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">Confirmed</Badge>;
    case 'pending_confirm':
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1">Pending Confirm</Badge>;
    case 'pending_payment':
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1">Pending Payment</Badge>;
    case 'cancelled':
      return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-3 py-1">Cancelled</Badge>;
    case 'expired':
      return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 px-3 py-1">Expired</Badge>;
    default:
      return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 px-3 py-1">{status}</Badge>;
  }
};

export default function AdminBookingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['admin-booking-detail', id, token],
    queryFn: () => adminBookingApi.getById(id, token),
    enabled: !!token && !!id,
  });

  const confirmMutation = useMutation({
    mutationFn: () => adminBookingApi.confirm(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Confirmed booking successfully');
    },
    onError: (error: Error) => toast.error(error.message || 'Confirmation failed')
  });

  const cancelMutation = useMutation({
    mutationFn: () => adminBookingApi.cancel(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error: Error) => toast.error(error.message || 'Cancellation failed')
  });

  // Display loading when:
  // 1. Session is loading
  // 2. Query is loading (when enabled=true)
  // 3. Token exists but booking is not yet fetched (waiting for fetch)
  if (sessionStatus === 'loading' || isLoading || (!!token && !booking)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Booking not found</h2>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/admin/booking">Back to list</Link>
        </Button>
      </div>
    );
  }

  /* const b = booking as any; */
  const b = booking!;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full border border-white/10">
            <Link href="/admin/booking"><ArrowLeft className="size-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground">Booking Details #{id}</h1>
              <StatusBadge status={b.status} />
            </div>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              Booked at: {new Date(b.created_at).toLocaleString('en-US')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {b.status === 'pending_confirm' && (
            <Button
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 font-bold"
            >
              <CheckCircle2 className="mr-2 size-4" />
              Confirm Booking
            </Button>
          )}
          {['pending_confirm', 'pending_payment'].includes(b.status) && (
            <Button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              variant="outline"
              className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10 font-bold"
            >
              <XCircle className="mr-2 size-4" />
              Cancel Booking
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Guest & Items Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Info */}
          <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="size-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Full Name</p>
                <p className="text-sm font-bold flex items-center gap-2">
                  {b.contact_name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Email</p>
                <p className="text-sm font-bold flex items-center gap-2">
                  <Mail className="size-3 text-muted-foreground" />
                  {b.contact_email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Phone Number</p>
                <p className="text-sm font-bold flex items-center gap-2">
                  <Phone className="size-3 text-muted-foreground" />
                  {b.contact_phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Items */}
          <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="size-5 text-primary" />
                Booking Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Service</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-center">Quantity</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(b.booking_items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{item.tour_title || 'Tour'}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.variant_name || item.variant?.name} - {item.pax_type_name || 'Guest'}
                          </span>
                          {item.session_date && (
                            <span className="text-[10px] text-primary font-bold mt-1 flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Date(item.session_date).toLocaleDateString('en-US')}
                              {item.start_time && ` | ${item.start_time.substring(0, 5)}`}
                              {item.end_time && ` - ${item.end_time.substring(0, 5)}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline">{item.quantity}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-medium">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-foreground">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/5">
                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-sm">Total:</td>
                    <td className="px-6 py-4 text-right font-black text-lg text-primary">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(b.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {/* Passenger List */}
          {(b.booking_items || []).some((item) => item.booking_passengers?.length > 0) && (
            <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Passenger List
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Full Name</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Birthdate</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Phone</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Related Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(b.booking_items || []).flatMap((item) =>
                      (item.booking_passengers || []).map((p, idx: number) => (
                        <tr key={`${item.id}-${idx}`}>
                          <td className="px-6 py-4 text-sm font-bold">{p.full_name}</td>
                          <td className="px-6 py-4 text-xs font-medium">
                            {p.birthdate ? new Date(p.birthdate).toLocaleDateString('en-US') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">{p.phone_number || 'N/A'}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                                {item.tour_title}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground mt-1">
                                {item.variant_name} ({item.pax_type_name})
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card className="border-white/5 bg-card/30 backdrop-blur-xl border-primary/20">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Method:</span>
                <span className="text-sm font-bold uppercase">{b.booking_payment?.payment_method_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={b.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}>
                  {b.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-xs text-muted-foreground uppercase font-black tracking-widest">Settlement Amount:</span>
                <span className="text-2xl font-black text-primary">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(b.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Logs / Navigation */}
          <Card className="border-white/5 bg-card/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start text-xs border-white/5 bg-white/5 hover:bg-white/10">
                <Link href="/admin/booking">
                  <Clock className="mr-2 size-3 text-muted-foreground" />
                  View Change Log
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}