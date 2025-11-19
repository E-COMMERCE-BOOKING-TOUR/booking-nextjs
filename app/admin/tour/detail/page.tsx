"use client";

import Link from "next/link";
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Calendar, Users, CheckCircle, XCircle } from "lucide-react";

const gallery = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crophttps://images.unsplash.com/photo-1518186233392-45f7f0f0c6f9?q=80&w=1600&auto=format&fit=crophttps://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1080&auto=format&fit=crop",
];

const travelPlans = [
    { day: 1, date: "Aug 25", title: "Vườn quốc gia Lake Manyara", note: "Safari nửa ngày, bữa sáng champagne, lái xe quan sát động vật buổi chiều" },
    { day: 2, date: "Aug 26", title: "Vườn quốc gia Serengeti", note: "Di chuyển đến Serengeti, lái xe quan sát động vật buổi chiều" },
    { day: 3, date: "Aug 27", title: "Vườn quốc gia Serengeti", note: "Lái xe quan sát động vật cả ngày, ăn trưa picnic" },
    { day: 4, date: "Aug 28", title: "Vườn quốc gia Serengeti", note: "Lái xe buổi sáng, lái xe quan sát động vật buổi chiều" },
    { day: 5, date: "Aug 29", title: "Miệng núi lửa Ngorongoro", note: "Tham quan miệng núi lửa, thăm làng Maasai" },
    { day: 6, date: "Aug 30", title: "Vườn quốc gia Serengeti", note: "Lái xe buổi sáng, thời gian nghỉ ngơi tại trại, bữa tối bush dinner" },
    { day: 7, date: "Aug 31", title: "Vườn quốc gia Lake Manyara", note: "Lái xe quan sát động vật, bữa sáng ngoài trời (bush breakfast)" },
    { day: 8, date: "Sep 01", title: "Khởi hành từ Arusha", note: "Di chuyển ra sân bay, khởi hành" },
];

const includes = [
    "Lưu trú tại các lều nghỉ dưỡng sang trọng",
    "Bao gồm tất cả bữa ăn (sáng, trưa và tối)",
    "Các chuyến lái xe quan sát động vật có hướng dẫn mỗi ngày",
    "Trải nghiệm khinh khí cầu cùng bữa sáng champagne",
    "Thăm làng Maasai",
    "Thức uống ngắm hoàng hôn và các buổi tối bush dinner",
    "Tất cả phí vào công viên",
    "Đưa đón sân bay",
    "Bảo hiểm du lịch",
];

const excludes = [
    "Vé máy bay quốc tế",
    "Chi phí cá nhân (quà lưu niệm, đồ uống thêm)",
    "Tiền tip cho hướng dẫn viên và nhân viên",
    "Các hoạt động tùy chọn không được liệt kê trong lịch trình",
];

export default function AdminDetailTour() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Link href="/admin/tour-list" className="inline-flex items-center gap-2 text-sm">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="size-4" />
                        Trở về
                    </Button>
                </Link>
                <Button size="sm">Chỉnh sửa</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 row-span-2 overflow-hidden rounded-xl border">
                                <img src={gallery[0]} alt="main" className="h-[280px] w-full object-cover" />
                            </div>
                            <div className="overflow-hidden rounded-xl border">
                                <img src={gallery[1]} alt="image-2" className="h-[135px] w-full object-cover" />
                            </div>
                            <div className="overflow-hidden rounded-xl border">
                                <img src={gallery[2]} alt="image-3" className="h-[135px] w-full object-cover" />
                            </div>
                            {/* <div className="overflow-hidden rounded-xl border">
                <img src={gallery[3]} alt="image-4" className="h-[135px] w-full object-cover" />
              </div> */}
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                                <div className="text-2xl font-semibold">Safari Adventure</div>
                                <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                                    <MapPin className="size-4" /> Serengeti, Tanzania
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1">8 Ngày / 7 Đêm</span>
                                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1"><Users className="size-3 mr-1" />15 người</span>
                                </div>
                            </div>
                            <div className="sm:col-span-1 text-right">
                                <div className="text-xl font-semibold">$3,200</div>
                                <div className="text-xs text-muted-foreground">/ người</div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                                <div className="text-sm font-medium flex items-center gap-2"><Calendar className="size-4" /> Lịch trình</div>
                                <div className="text-sm text-muted-foreground mt-1">August 25, 2028 — September 01, 2028</div>
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Hãy trải nghiệm chuyến phiêu lưu đầy phấn khích với gói Safari Adventure của chúng tôi.
                                    Băng qua vùng Serengeti và chiêm ngưỡng những loài động vật hoang dã hùng vĩ trong môi trường sống tự nhiên của chúng.
                                    Gói safari trọn gói này mang đến cho bạn chỗ ở sang trọng, các tour tham quan được hướng dẫn bởi chuyên gia, và những trải nghiệm khó quên.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm font-medium">Bao gồm</div>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {includes.map((i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                                            <span>{i}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-medium">Không bao gồm</div>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {excludes.map((e) => (
                                        <div key={e} className="flex items-start gap-2 text-sm">
                                            <XCircle className="size-4 text-red-600 flex-shrink-0" />
                                            <span>{e}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-xl">Kế hoạch tham quan</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-3">
                            {travelPlans.map((p) => (
                                <div key={p.day} className="grid grid-cols-[60px_1fr] items-start gap-3 rounded-md border p-3">
                                    <div className="text-sm text-muted-foreground">
                                        <div className="text-xs">Ngày {p.day}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium">{p.title}</div>
                                        <div className="text-xs text-muted-foreground">{p.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}