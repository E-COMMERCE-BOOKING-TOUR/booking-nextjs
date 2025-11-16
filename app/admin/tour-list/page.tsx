"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Search, ChevronDown } from "lucide-react";

const popularPackages = [
    {
        name: "Alpine Escape",
        location: "Zermatt, Switzerland",
        price: "$1,800",
        rating: 4.8,
        image:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
    },
    {
        name: "Caribbean Cruise",
        location: "Bahamas",
        price: "$2,300",
        rating: 4.6,
        image:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
    },
    {
        name: "Parisian Romance",
        location: "Paris, France",
        price: "$1,450",
        rating: 4.7,
        image:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
    },
    {
        name: "Greek Island Hopping",
        location: "Cyclades, Greece",
        price: "$2,050",
        rating: 4.5,
        image:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
    },
];

const featuredPackages = [
    {
        name: "Venice Getaway",
        location: "Venice, Italy",
        price: "$1,500",
        nights: "4 nights",
        image:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
    },
    {
        name: "Safari Adventure",
        location: "Serengeti, Tanzania",
        price: "$3,200",
        nights: "7 nights",
        image:
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1080&auto=format&fit=crop",
    },
];

const recommendedPackages = [
    {
        name: "Tokyo Cultural Adventure",
        location: "Tokyo, Japan",
        price: "$2,500",
        image:
            "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=1080&auto=format&fit=crop",
    },
    {
        name: "New York City Highlights",
        location: "New York, USA",
        price: "$1,400",
        image:
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1080&auto=format&fit=crop",
    },
    {
        name: "Sydney Explorer",
        location: "Sydney, Australia",
        price: "$2,050",
        image:
            "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=1080&auto=format&fit=crop",
    },
];

export default function AdminTourList() {
    const [openId, setOpenId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [tours, setTours] = useState([
    { id: 1, name: "Alpine Escape", location: "Swiss Alps, Switzerland", days: 7, status: "Đang mở", tags: { popular: true, discount: false, featured: true } },
    { id: 2, name: "Bali Beach Escape", location: "Bali, Indonesia", days: 8, status: "Đã đủ", tags: { popular: true, discount: true, featured: false } },
    { id: 3, name: "Caribbean Cruise", location: "Caribbean Sea", days: 5, status: "Đóng", tags: { popular: false, discount: false, featured: false } },
    { id: 4, name: "Greek Island Hopping", location: "Santorini, Greece", days: 6, status: "Hủy", tags: { popular: false, discount: true, featured: false } },
  ]);
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDays, setNewDays] = useState<number | "">("");
  const [newStatus, setNewStatus] = useState("Đang mở");
  const [newTags, setNewTags] = useState({ popular: false, discount: false, featured: false });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    const arr = Array.from(files || []);
    setImages(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = () => {
    const nextId = Math.max(0, ...tours.map((t) => t.id)) + 1;
    setTours([...tours, { id: nextId, name: newName, location: newLocation, days: Number(newDays || 0), status: newStatus, tags: newTags }]);
    setOpenCreate(false);
    setNewName("");
    setNewLocation("");
    setNewDays("");
    setNewStatus("Đang mở");
    setNewTags({ popular: false, discount: false, featured: false });
    setImages([]);
    setPreviews([]);
  };

    const StatusBadge = ({ s }: { s: string }) => {
        const base = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium";
        const cls = s === "Đang mở" ? "bg-green-500/15 text-green-700" : s === "Đã đủ" ? "bg-orange-500/15 text-orange-700" : s === "Đóng" ? "bg-gray-500/15 text-gray-700" : "bg-red-500/15 text-red-700";
        return <span className={`${base} ${cls}`}>{s}</span>;
    };

    const toggleTag = (id: number, key: keyof (typeof tours)[0]["tags"]) => {
    setTours((prev) => prev.map((t) => (t.id === id ? { ...t, tags: { ...t.tags, [key]: !t.tags[key] } } : t)));
  };

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
                <Button size="sm" variant="default" onClick={() => setOpenCreate(true)}>+ Thêm tour</Button>
          </CardAction>

          <Sheet open={openCreate} onOpenChange={setOpenCreate}>
            <SheetContent className="sm:max-w-[700px]">
              <SheetHeader className="p-2">
                <SheetTitle>Thêm tour</SheetTitle>
                <SheetDescription>Nhập thông tin cho tour mới</SheetDescription>
              </SheetHeader>
              <form className="mt-2 p-2 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1 p-2 rounded-md border bg-muted/20">
                    <Label>Tên tour</Label>
                    <Input className="py-2" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tên tour" />
                  </div>
                  <div className="flex flex-col gap-1 p-2 rounded-md border bg-muted/20">
                    <Label>Địa điểm</Label>
                    <Input className="py-2" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Địa điểm" />
                  </div>
                  <div className="flex flex-col gap-1 p-2 rounded-md border bg-muted/20">
                    <Label>Số ngày</Label>
                    <Input className="py-2" type="number" min={1} value={newDays} onChange={(e) => setNewDays(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Số ngày" />
                  </div>
                  <div className="flex flex-col gap-1 p-2 rounded-md border bg-muted/20">
                    <Label>Trạng thái</Label>
                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v)}>
                      <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Đang mở">Đang mở</SelectItem>
                        <SelectItem value="Đã đủ">Đã đủ</SelectItem>
                        <SelectItem value="Đóng">Đóng</SelectItem>
                        <SelectItem value="Hủy">Hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2 rounded-md border">
                  <label className="col-span-3 text-sm">Tùy chọn hiển thị</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newTags.popular} onChange={(e) => setNewTags({ ...newTags, popular: e.target.checked })} /> Phổ biến</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newTags.discount} onChange={(e) => setNewTags({ ...newTags, discount: e.target.checked })} /> Giảm giá</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={newTags.featured} onChange={(e) => setNewTags({ ...newTags, featured: e.target.checked })} /> Nổi bật</label>
                </div>

                <div className="p-2 rounded-md border">
                  <Label>Ảnh (nhiều ảnh)</Label>
                  <Input className="mt-1 py-2" type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative overflow-hidden rounded-lg border">
                        <img src={src} alt={`preview-${i}`} className="h-24 w-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 rounded-xs bg-black/40 text-white px-1 text-xs">x</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)}>Hủy</Button>
                  <Button type="submit">Lưu</Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>

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
                                    <th className="py-3 font-medium">Tùy chọn</th>
                                    <th className="py-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {tours.map((t) => (
                                    <tr key={t.id} className="hover:bg-muted/30">
                                        <td className="py-3 font-medium">{t.name}</td>
                                        <td className="py-3">{t.location}</td>
                                        <td className="py-3">{t.days} ngày</td>
                                        <td className="py-3"><StatusBadge s={t.status} /></td>
                                        <td className="py-3">
                                            <div ref={openId === t.id ? dropdownRef : null} className="relative inline-block">
                        <Button variant="secondary" size="sm" className="gap-2" onClick={() => setOpenId(openId === t.id ? null : t.id)}>
                                                    Tùy chọn <ChevronDown className="size-4" />
                                                </Button>
                                                {openId === t.id && (
                                                    <div className="bg-popover text-popover-foreground absolute z-10 mt-2 w-52 rounded-md border p-3 shadow-xl">
                                                        <div className="text-xs text-muted-foreground mb-2">Hiển thị cho người dùng</div>
                                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={t.tags.popular} onChange={() => toggleTag(t.id, "popular")} /> Phổ biến</label>
                                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={t.tags.discount} onChange={() => toggleTag(t.id, "discount")} /> Giảm giá</label>
                                                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={t.tags.featured} onChange={() => toggleTag(t.id, "featured")} /> Nổi bật</label>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <a href="/admin/tour-detail">
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