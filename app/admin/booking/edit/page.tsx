"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Save } from "lucide-react";
import { CardInput } from "@/components/CardInput";

export default function AdminBookingEdit() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | "">("");

  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled" | "expired">("pending");
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid" | "refunded" | "partial">("unpaid");

  const [userId, setUserId] = useState<string>("1");
  const [currencyId, setCurrencyId] = useState<string>("1");
  const [paymentInformationId, setPaymentInformationId] = useState<string>("1");
  const [tourInventoryHoldId, setTourInventoryHoldId] = useState<string>("1");
  const [bookingPaymentId, setBookingPaymentId] = useState<string>("1");

  const statusCls =
    status === "confirmed"
      ? "bg-green-500/15 text-green-700"
      : status === "pending"
      ? "bg-orange-500/15 text-orange-700"
      : status === "cancelled"
      ? "bg-red-500/15 text-red-700"
      : "bg-gray-500/15 text-gray-700";

  const paymentCls =
    paymentStatus === "paid"
      ? "bg-green-500/15 text-green-700"
      : paymentStatus === "unpaid"
      ? "bg-red-500/15 text-red-700"
      : paymentStatus === "refunded"
      ? "bg-purple-500/15 text-purple-700"
      : "bg-orange-500/15 text-orange-700";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full flex flex-col">
      <Card className="border-none shadow-none">
        <CardHeader className="border-b">
          <CardAction className="flex items-center gap-2">
            <Button size="sm" onClick={handleSubmit}>
              <Save className="size-4" color="#ffffff" />
              Lưu
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="border-none shadow-none">
        <CardContent>
          <form className="px-2 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardInput title="Contact name">
                <Input className="py-2" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Tên người liên hệ" />
              </CardInput>
              <CardInput title="Contact email">
                <Input className="py-2" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email" />
              </CardInput>
              <CardInput title="Contact phone">
                <Input className="py-2" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Số điện thoại" />
              </CardInput>
              <CardInput title="Total amount">
                <Input className="py-2" type="number" min={0} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Tổng tiền" />
              </CardInput>

              <CardInput title="Status">
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger className={statusCls}>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending"><span className="text-orange-700">pending</span></SelectItem>
                    <SelectItem value="confirmed"><span className="text-green-700">confirmed</span></SelectItem>
                    <SelectItem value="cancelled"><span className="text-red-700">cancelled</span></SelectItem>
                    <SelectItem value="expired"><span className="text-gray-700">expired</span></SelectItem>
                  </SelectContent>
                </Select>
              </CardInput>

              <CardInput title="Payment status">
                <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as typeof paymentStatus)}>
                  <SelectTrigger className={paymentCls}>
                    <SelectValue placeholder="Chọn trạng thái thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid"><span className="text-red-700">unpaid</span></SelectItem>
                    <SelectItem value="paid"><span className="text-green-700">paid</span></SelectItem>
                    <SelectItem value="refunded"><span className="text-purple-700">refunded</span></SelectItem>
                    <SelectItem value="partial"><span className="text-orange-700">partial</span></SelectItem>
                  </SelectContent>
                </Select>
              </CardInput>

              <CardInput title="User ID">
                <Input className="py-2" type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
              </CardInput>

              <CardInput title="Currency ID">
                <Input className="py-2" type="text" value={currencyId} onChange={(e) => setCurrencyId(e.target.value)} placeholder="Currency ID" />
              </CardInput>

              <CardInput title="Payment information ID">
                <Input className="py-2" type="text" value={paymentInformationId} onChange={(e) => setPaymentInformationId(e.target.value)} placeholder="Payment information ID" />
              </CardInput>

              <CardInput title="Tour inventory hold ID">
                <Input className="py-2" type="text" value={tourInventoryHoldId} onChange={(e) => setTourInventoryHoldId(e.target.value)} placeholder="Tour inventory hold ID" />
              </CardInput>

              <CardInput title="Booking payment ID">
                <Input className="py-2" type="text" value={bookingPaymentId} onChange={(e) => setBookingPaymentId(e.target.value)} placeholder="Booking payment ID" />
              </CardInput>
            </div>

            <CardAction className="flex items-center justify-end gap-2">
              <a href="/admin/booking"><Button type="button" variant="ghost">Hủy</Button></a>
              <Button type="submit">Lưu</Button>
            </CardAction>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}