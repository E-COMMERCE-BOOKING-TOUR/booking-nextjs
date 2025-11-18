"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Search, ChevronDown } from "lucide-react";
import { ITour } from "@/types/response/tour.type";
import { adminApi } from "@/apis/admin";

export default function AdminTourList() {
  const [openId, setOpenId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [tours, setTours] = useState<ITour[]>([]);
  
      useEffect(() => {
          (async () => {
              try {
                  const resTour = await adminApi.getTour();
                  setTours(resTour);
              } catch (e) {
                  throw new Error('Error get notification: ' + e);
              }
          })();
      }, []);

  const StatusBadge = ({ s }: { s: string }) => {
    const base = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium";
    const cls = s === "active" ? "bg-green-500/15 text-green-700" : s === "raw" ? "bg-orange-500/15 text-orange-700" : s === "inactive" ? "bg-gray-500/15 text-gray-700" : "bg-red-500/15 text-red-700";
    return <span className={`${base} ${cls}`}>{s}</span>;
  };

  // const toggleTag = (id: number, key: keyof (typeof tours)[0]["status"]) => {
  //   setTours((prev) => prev.map((t) => (t.id === id ? { ...t, status: { ...t.status, [key]: !t.status[key] } } : t)));
  // };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (openId !== null && !dropdownRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openId]);



  return (
    <div className="w-full flex flex-col gap-4">
      <CardAction className="w-full flex items-center gap-2 justify-between">
        <div className="hidden sm:flex items-center gap-2">
          <Label htmlFor="search" className="sr-only">Search</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2 top-1/2 size-4 -translate-y-1/2" />
            <Input id="search" placeholder="Tìm kiếm tour" className="pl-8 w-[240px]" />
          </div>
        </div>
        <a href="/admin/tour/edit"><Button size="sm" variant="default">+ Thêm tour</Button></a>
      </CardAction>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-3 font-medium">Tên tour</th>
                  <th className="py-3 font-medium">Địa điểm</th>
                  <th className="py-3 font-medium">Số ngày</th>
                  <th className="py-3 font-medium">Trạng thái</th>
                  {/* <th className="py-3 font-medium">Tùy chọn</th> */}
                  <th className="py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tours.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => console.log(t)}>
                    <td className="py-3 font-medium">{t.title}</td>
                    <td className="py-3">{t.address}</td>
                    <td className="py-3">{t.duration_days} ngày</td>
                    <td className="py-3"><StatusBadge s={t.status} /></td>
                    {/* <td className="py-3">
                      <div ref={openId === t.id ? dropdownRef : null} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" size="sm" className="gap-2" onClick={(e) => { e.stopPropagation(); setOpenId(openId === t.id ? null : t.id); }}>
                          Tùy chọn <ChevronDown className="size-4" />
                        </Button>
                        {openId === t.id && (
                          <div className="bg-popover text-popover-foreground absolute z-10 mt-2 w-52 rounded-md border p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="text-xs text-muted-foreground mb-2">Hiển thị cho người dùng</div>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={t.tags.popular} onChange={() => toggleTag(t.id, "popular")} /> Phổ biến</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={t.tags.discount} onChange={() => toggleTag(t.id, "discount")} /> Giảm giá</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={t.tags.featured} onChange={() => toggleTag(t.id, "featured")} /> Nổi bật</label>
                          </div>
                        )}
                      </div>
                    </td> */}
                    <td className="py-3">
                      <a href="/admin/tour-detail" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}