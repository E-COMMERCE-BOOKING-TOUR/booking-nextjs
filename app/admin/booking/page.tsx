"use client";

import { useState, useRef, useEffect } from "react";

import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { ArrowLeft, ChevronDown, Plus, Search, TrendingUp } from "lucide-react";
import { PieChartDashboard } from "../dashboard/components/PieChart.dashboard";

const kpis = [
  { label: "Total Booking", value: "1,200", delta: "+2.9%" },
  { label: "Total Participants", value: "2,845", delta: "-1.6%" },
  { label: "Total Earnings", value: "$14,795", delta: "+4.7%" },
];

const overview = [
  { m: "Aug 1", done: 900, canceled: 300 },
  { m: "Sep 7", done: 1100, canceled: 350 },
  { m: "Oct 12", done: 1200, canceled: 400 },
  { m: "Nov 27", done: 1760, canceled: 500 },
  { m: "Dec 9", done: 1500, canceled: 520 },
  { m: "Jan 22", done: 1650, canceled: 480 },
  { m: "Feb 14", done: 1400, canceled: 450 },
  { m: "Mar 30", done: 1600, canceled: 420 },
  { m: "Apr 18", done: 1720, canceled: 460 },
  { m: "May 26", done: 1550, canceled: 410 },
  { m: "Jun 22", done: 1680, canceled: 430 },
  { m: "Jul 28", done: 1620, canceled: 390 },
];

const bookings = [
  { name: "Camello Luy", code: "BG023482", package: "Venice Doenara", duration: "5 Days / 7 Nights", dates: "June 25 – June 30", price: "$1,500", status: "Confirmed" },
  { name: "Raphael Coronel", code: "BG023438", package: "Safari Adventure", duration: "8 Days / 7 Nights", dates: "June 25 – July 2", price: "$3,200,000,000", status: "Pending" },
  { name: "Luigiv Contessa", code: "BG023412", package: "Alpine Escape", duration: "7 Days / 6 Nights", dates: "Jan 26 – Feb 2", price: "$2,300", status: "Completed" },
  { name: "Armando Max Meyers", code: "BG023405", package: "Caribbean Cruise", duration: "5 Days / 4 Nights", dates: "Jun 25 – Jun 30", price: "$1,600", status: "Cancelled" },
  { name: "Jorma Dum", code: "BG023380", package: "Parisian Romance", duration: "4 Days / 4 Nights", dates: "Jun 27 – Jun 30", price: "$1,450", status: "Confirmed" },
  { name: "Hilary Grey", code: "BG023370", package: "Tokyo Cultural Adventure", duration: "7 Days / 6 Nights", dates: "Jan 23 – Jan 29", price: "$2,500", status: "Pending" },
  { name: "Ashlynn Dean", code: "BG023365", package: "New York Highlights", duration: "3 Days / 2 Nights", dates: "Jun 26 – Jun 28", price: "$1,400", status: "Completed" },
  { name: "Uday Singh", code: "BG023351", package: "Bali Beach Escape", duration: "8 Days / 7 Nights", dates: "Jun 24 – Jul 2", price: "$2,050", status: "Confirmed" },
];

export default function AdminBooking() {
  const [rows, setRows] = useState(bookings);
  const [statusOpenId, setStatusOpenId] = useState<string | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const statusOptions = ["Confirmed", "Pending", "Cancelled", "Completed"];
  const badgeCls = (s: string) => s === "Completed" ? "bg-blue-500/15 text-blue-700" : s === "Confirmed" ? "bg-green-500/15 text-green-700" : s === "Pending" ? "bg-orange-500/15 text-orange-700" : "bg-red-500/15 text-red-700";
  const setRowStatus = (code: string, s: string) => setRows(prev => prev.map(r => r.code === code ? { ...r, status: s } : r));
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<typeof bookings[0] | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!statusDropdownRef.current) return;
      if (statusOpenId && !statusDropdownRef.current.contains(e.target as Node)) setStatusOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setStatusOpenId(null); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [statusOpenId]);
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
                  <th className="py-3 font-medium">Name</th>
                  <th className="py-3 font-medium">Booking Code</th>
                  <th className="py-3 font-medium">Package</th>
                  <th className="py-3 font-medium">Duration</th>
                  <th className="py-3 font-medium">Dates</th>
                  <th className="py-3 font-medium">Price</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => {
                  const getStatusBadge = (status: string) => {
                    const base =
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium";

                    switch (status) {
                      case "Completed":
                        return (
                          <span className={`${base} bg-blue-500/15 text-blue-700`}>
                            Completed
                          </span>
                        );

                      case "Confirmed":
                        return (
                          <span className={`${base} bg-green-500/15 text-green-700`}>
                            Confirmed
                          </span>
                        );

                      case "Pending":
                        return (
                          <span className={`${base} bg-orange-500/15 text-orange-700`}>
                            Pending
                          </span>
                        );

                      case "Cancelled":
                        return (
                          <span className={`${base} bg-red-500/15 text-red-700`}>
                            Cancelled
                          </span>
                        );
                    }
                  };

                  return (
                    <tr
                      key={row.code}
                      onClick={() => { setDetailRow(row); setDetailOpen(true); }}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 font-medium">{row.name}</td>
                      <td className="py-3">{row.code}</td>
                      <td className="py-3">{row.package}</td>
                      <td className="py-3">{row.duration}</td>
                      <td className="py-3">{row.dates}</td>
                      <td className="py-3">{row.price}</td>
                      <td className="py-3">
                        <div ref={statusOpenId === row.code ? statusDropdownRef : null} className="relative inline-block">
                          <Button variant="secondary" size="sm" className={`gap-2 ${badgeCls(row.status)}`} onClick={(e) => { e.stopPropagation(); setStatusOpenId(statusOpenId === row.code ? null : row.code); }}>
                            {row.status}
                            <ChevronDown className="size-4" />
                          </Button>
                          {statusOpenId === row.code && (
                            <div className="bg-popover text-popover-foreground absolute z-10 mt-2 w-40 rounded-md border p-2 shadow-xl">
                              {statusOptions.map((opt) => (
                                <button key={opt} type="button" className="w-full text-left px-2 py-1 rounded-sm hover:bg-muted" onClick={() => { setRowStatus(row.code, opt); setStatusOpenId(null); }}>
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                    <div className="text-xs text-muted-foreground">Name</div>
                    <div className="text-sm font-medium">{detailRow.name}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Booking Code</div>
                    <div className="text-sm font-medium">{detailRow.code}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Package</div>
                    <div className="text-sm font-medium">{detailRow.package}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="text-sm font-medium">{detailRow.duration}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Dates</div>
                    <div className="text-sm font-medium">{detailRow.dates}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="text-sm font-medium">{detailRow.price}</div>
                  </div>
                  <div className="p-2 rounded-md border bg-muted/20 md:col-span-2">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="text-sm font-medium">{detailRow.status}</div>
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
