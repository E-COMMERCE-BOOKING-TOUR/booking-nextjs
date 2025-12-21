"use client";

import { useState, useRef, useEffect } from "react";

import { Card, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type ApiBooking = {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  payment_status: "unpaid" | "paid" | "refunded" | "partial";
  user_id: number;
  currency_id: number;
  booking_payment_id: number;
};

export default function AdminBooking() {
  const [rows, setRows] = useState<ApiBooking[]>([]);
  const selectBase = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium";
  const statusBadgeCls = (s: ApiBooking["status"]) => s === "confirmed" ? "bg-green-500/15" : s === "pending" ? "bg-orange-500/15" : s === "cancelled" ? "bg-red-500/15" : "bg-gray-500/15";
  const statusBadgeTxtCls = (s: ApiBooking["status"]) => s === "confirmed" ? "text-green-700" : s === "pending" ? "text-orange-700" : s === "cancelled" ? "text-red-700" : "text-gray-700";
  const paymentBadgeCls = (s: ApiBooking["payment_status"]) => s === "paid" ? "bg-green-500/15" : s === "unpaid" ? "bg-red-500/15" : s === "refunded" ? "bg-purple-500/15" : "bg-orange-500/15";
  const paymentBadgeTxtCls = (s: ApiBooking["payment_status"]) => s === "paid" ? "text-green-700" : s === "unpaid" ? "text-red-700" : s === "refunded" ? "text-purple-700" : "text-orange-700";
  const statusOptions: ApiBooking["status"][] = ["pending", "confirmed", "cancelled", "expired"];
  const paymentOptions: ApiBooking["payment_status"][] = ["unpaid", "paid", "refunded", "partial"];
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<ApiBooking | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  const StatusSelect = ({ value, onValueChange }: { value: ApiBooking["status"]; onValueChange: (v: ApiBooking["status"]) => void }) => (
    <div onClick={(e) => e.stopPropagation()}>
      <Select value={value} onValueChange={(v) => onValueChange(v as ApiBooking["status"])}>
        <SelectTrigger className={statusBadgeCls(value)}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((s) => (
            <SelectItem key={s} value={s}>
              <span className={statusBadgeTxtCls(s).replace(selectBase, "")}>{s}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const PaymentStatusSelect = ({ value, onValueChange }: { value: ApiBooking["payment_status"]; onValueChange: (v: ApiBooking["payment_status"]) => void }) => (
    <div onClick={(e) => e.stopPropagation()}>
      <Select value={value} onValueChange={(v) => onValueChange(v as ApiBooking["payment_status"])}>
        <SelectTrigger className={paymentBadgeCls(value)}>
          <SelectValue placeholder="Payment" />
        </SelectTrigger>
        <SelectContent>
          {paymentOptions.map((p) => (
            <SelectItem key={p} value={p}>
              <span className={paymentBadgeTxtCls(p).replace(selectBase, "")}>{p}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/booking/getAll");
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setRows([]);
      }
    })();
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!detailRef.current) return;
      if (detailOpen && !detailRef.current.contains(e.target as Node)) setDetailOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDetailOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [detailOpen]);

  return (
    <div className="flex flex-col gap-4">
      <CardAction className="w-full flex items-center gap-2 justify-between">
        <div className="hidden sm:flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2 top-1/2 size-4 -translate-y-1/2" />
            <Input id="search" placeholder="Tìm kiếm booking" className="pl-8 w-[240px]" />
          </div>
        </div>
      </CardAction>
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-3 font-medium">ID</th>
                  <th className="py-3 font-medium">Contact Name</th>
                  <th className="py-3 font-medium">Email</th>
                  <th className="py-3 font-medium">Phone</th>
                  <th className="py-3 font-medium">Total</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Payment</th>
                  <th className="py-3 font-medium">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} onClick={() => { setDetailRow(row); setDetailOpen(true); }} className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium">{row.id}</td>
                    <td className="py-3">{row.contact_name}</td>
                    <td className="py-3">{row.contact_email}</td>
                    <td className="py-3">{row.contact_phone}</td>
                    <td className="py-3">{row.total_amount.toLocaleString()}</td>
                    <td className="py-3">
                      <StatusSelect value={row.status} onValueChange={(v) => setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: v } : r))} />
                    </td>
                    <td className="py-3">
                      <PaymentStatusSelect value={row.payment_status} onValueChange={(v) => setRows(prev => prev.map(r => r.id === row.id ? { ...r, payment_status: v } : r))} />
                    </td>
                    <td className="py-3">{row.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div>Showing 1–8 of 238</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">Previous</Button>
              <Button variant="secondary" size="sm">1</Button>
              <Button variant="ghost" size="sm">2</Button>
              <Button variant="ghost" size="sm">3</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {detailOpen && detailRow && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div ref={detailRef} className="bg-background rounded-md border shadow-xl w-[700px] max-w-[95vw]">
              <div className="p-2 border-b">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">Booking Detail</div>
                  <Button variant="ghost" size="sm" onClick={() => setDetailOpen(false)}>Đóng</Button>
                </div>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Contact Name</div>
                    <div className="text-sm font-medium">{detailRow.contact_name}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Contact Email</div>
                    <div className="text-sm font-medium">{detailRow.contact_email}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Contact Phone</div>
                    <div className="text-sm font-medium">{detailRow.contact_phone}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Total Amount</div>
                    <div className="text-sm font-medium">{detailRow.total_amount.toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="text-sm font-medium">{detailRow.status}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Payment Status</div>
                    <div className="text-sm font-medium">{detailRow.payment_status}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20 md:col-span-2">
                    <div className="text-xs text-muted-foreground">IDs</div>
                    <div className="text-sm font-medium">User: {detailRow.user_id} • Currency: {detailRow.currency_id} • Booking Payment: {detailRow.booking_payment_id}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
