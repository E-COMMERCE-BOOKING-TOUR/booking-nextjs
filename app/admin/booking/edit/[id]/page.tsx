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
  User,
  Mail,
  Phone,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1">Confirmed</Badge>;
    case 'pending_confirm':
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1">Pending Confirm</Badge>;
    case 'waiting_supplier':
      return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 px-3 py-1">Waiting Supplier</Badge>;
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

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundInfo, setRefundInfo] = useState<{ refundAmount: number; feeAmount: number; feePct: number } | null>(null);
  const [loadingRefund, setLoadingRefund] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => adminBookingApi.cancel(id, token, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-booking-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking cancelled successfully');
      setShowCancelDialog(false);
      setCancelReason('');
      setRefundInfo(null);
    },
    onError: (error: Error) => toast.error(error.message || 'Cancellation failed')
  });

  const handleCancelClick = async () => {
    setShowCancelDialog(true);
    // Only fetch refund info for confirmed/paid bookings
    if (booking?.status === 'confirmed' && booking?.payment_status === 'paid') {
      setLoadingRefund(true);
      try {
        const info = await adminBookingApi.calculateRefund(id, token);
        setRefundInfo(info);
      } catch (e) {
        console.error('Failed to calculate refund', e);
      }
      setLoadingRefund(false);
    }
  };

  const handleConfirmCancel = () => {
    cancelMutation.mutate(cancelReason);
  };

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
          {['pending_confirm', 'waiting_supplier'].includes(b.status) && (
            <Button
              onClick={() => confirmMutation.mutate()}
              disabled={confirmMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 font-bold"
            >
              <CheckCircle2 className="mr-2 size-4" />
              {b.status === 'waiting_supplier' ? 'Approve Booking' : 'Confirm Booking'}
            </Button>
          )}
          {['pending_confirm', 'pending_payment', 'confirmed', 'waiting_supplier'].includes(b.status) && (
            <Button
              onClick={handleCancelClick}
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

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            {b.status === 'confirmed' && b.payment_status === 'paid' && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
                <p className="text-xs text-green-500 font-bold uppercase tracking-widest">Refund Information</p>
                {loadingRefund ? (
                  <p className="text-sm text-muted-foreground">Calculating refund...</p>
                ) : refundInfo ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cancellation Fee ({refundInfo.feePct}%):</span>
                      <span className="font-bold text-rose-500">{Number(refundInfo.feeAmount).toLocaleString('en-US')} {b.currency || 'VND'}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-white/10 pt-1">
                      <span className="font-bold">Refund Amount:</span>
                      <span className="font-black text-green-500">{Number(refundInfo.refundAmount).toLocaleString('en-US')} {b.currency || 'VND'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unable to calculate refund</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        {Number(item.unit_price).toLocaleString('en-US')} {b.currency || 'VND'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-foreground">
                        {Number(item.total_amount).toLocaleString('en-US')} {b.currency || 'VND'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/5">
                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-sm">Total:</td>
                    <td className="px-6 py-4 text-right font-black text-lg text-primary">
                      {Number(b.total_amount).toLocaleString('en-US')} {b.currency || 'VND'}
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
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Phone</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Related Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(b.booking_items || []).flatMap((item) =>
                      (item.booking_passengers || []).map((p, idx: number) => (
                        <tr key={`${item.id}-${idx}`}>
                          <td className="px-6 py-4 text-sm font-bold">{p.full_name}</td>
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
          <Card className="border-white/5 bg-card/20 backdrop-blur-xl overflow-hidden">
            {/* Decorative Background Icon */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 p-8 opacity-10 pointer-events-none transform rotate-12">
              <CreditCard className="w-32 h-32" />
            </div>

            <CardHeader className="pb-2 relative z-10 border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Payment Details
                </CardTitle>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${b.payment_status === 'paid' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/20 text-white'
                  }`}>
                  {b.payment_status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-4 relative z-10">
              {/* Settlement Amount */}
              <div>
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-0 opacity-80">Settlement Amount</p>
                <p className="text-3xl font-black tracking-tight flex items-baseline gap-1">
                  {Number(b.total_amount).toLocaleString('en-US')}
                  <span className="text-sm font-bold opacity-60">{b.currency || 'VND'}</span>
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1 opacity-80">Method</p>
                <p className="font-bold text-lg tracking-tight">{b.booking_payment?.payment_method_name || 'N/A'}</p>
              </div>

              {b.payment_information && (
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1 opacity-80">Card Number</p>
                    <p className="font-bold font-mono text-lg tracking-wider">•••• {b.payment_information.last4}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1 opacity-80">Brand</p>
                    <p className="font-bold uppercase tracking-wide">{b.payment_information.brand}</p>
                  </div>
                  {b.payment_information.account_holder && (
                    <div className="col-span-2 text-left">
                      <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1 opacity-80">Holder</p>
                      <p className="font-bold uppercase">{b.payment_information.account_holder}</p>
                    </div>
                  )}
                </div>
              )}

              {b.status === 'cancelled' && b.cancel_reason && (
                <div className="mt-2 pt-4 border-t border-white/10">
                  <div className="bg-rose-500/20 rounded-lg p-3 border border-rose-500/30">
                    <p className="text-[10px] font-bold text-rose-100 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Cancellation Reason
                    </p>
                    <p className="text-xs text-white italic leading-relaxed mt-1">{b.cancel_reason}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}