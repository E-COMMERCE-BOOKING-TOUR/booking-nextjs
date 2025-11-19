"use client";

import { Card, CardTitle, CardHeader, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PhoneCall, MessageCircle, Plus, MapPin, Globe, ShieldCheck, FileText, CheckCircle } from "lucide-react";

const partners = [
  { id: 1, company: "Venice Experience Co.", email: "contact@veniceexp.co", phone: "+39 041 123 456", category: "Tour Agency", logo: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200&auto=format&fit=crop" },
  { id: 2, company: "Serengeti Safaris Ltd.", email: "hello@serengeti.tz", phone: "+255 754 222 333", category: "Safari Operator", logo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" },
  { id: 3, company: "Swiss Alpine Tours", email: "info@swissalps.ch", phone: "+41 21 333 4444", category: "Tour Agency", logo: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop" },
  { id: 4, company: "Caribbean Cruise Corp.", email: "support@caricruise.com", phone: "+1 (305) 444-5555", category: "Cruise", logo: "https://images.unsplash.com/photo-1545996124-89d73c8bba7f?q=80&w=200&auto=format&fit=crop" },
  { id: 5, company: "Paris Concierge", email: "team@parisconcierge.fr", phone: "+33 1 555 666", category: "Hotel Partner", logo: "https://images.unsplash.com/photo-1543896511-061c3e267f33?q=80&w=200&auto=format&fit=crop" },
  { id: 6, company: "Tokyo Culture Assoc.", email: "contact@tokyoculture.jp", phone: "+81 3 666 7777", category: "Tour Agency", logo: "https://images.unsplash.com/photo-1547394761-5e19b85f5f39?q=80&w=200&auto=format&fit=crop" },
  { id: 7, company: "Greek Islands Travel", email: "care@greekislands.gr", phone: "+30 21 777 8888", category: "Transport", logo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop" },
  { id: 8, company: "Bali Beach Resorts", email: "hello@balibeach.id", phone: "+62 21 888 9999", category: "Hotel Partner", logo: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=200&auto=format&fit=crop" },
  { id: 9, company: "NYC Experiences", email: "biz@nycexp.us", phone: "+1 (212) 999-0000", category: "Tour Agency", logo: "https://images.unsplash.com/photo-1546938576-6e6a5f54d4a0?q=80&w=200&auto=format&fit=crop" },
];

const selectedPartner = {
  company: "Venice Experience Co.",
  category: "Tour Agency",
  logo: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200&auto=format&fit=crop",
  cover: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=1600&auto=format&fit=crop",
  yearsInOperation: "10 năm",
  partnerTier: "Platinum",
  contractType: "Hợp đồng năm",
  status: "Đang hoạt động",
  address: "Cannaregio, Venice, Italy",
  website: "https://veniceexp.co",
  services: [
    "Tổ chức tour tham quan thành phố",
    "Đặt khách sạn và dịch vụ lưu trú",
    "Vận chuyển trong thành phố",
    "Hỗ trợ hướng dẫn viên đa ngôn ngữ",
  ],
  compliance: [
    "Giấy phép lữ hành quốc tế",
    "Chứng nhận an toàn dịch vụ",
    "Bảo hiểm trách nhiệm nghề nghiệp",
  ],
  contracts: [
    { name: "Thỏa thuận hợp tác 2025", period: "Jan 2025 – Dec 2025", terms: "Cam kết chất lượng dịch vụ, SLA phản hồi < 2h, tỉ lệ hủy < 2%." },
    { name: "MOU giữa đôi bên", period: "Effective từ Mar 2024", terms: "Chia sẻ dữ liệu đặt chỗ, quy trình xử lý sự cố và bồi hoàn." },
  ],
};

export default function AdminSupplier() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Đối tác</CardTitle>
          <CardAction className="flex items-center gap-2 flex-wrap">
            <div className="hidden md:flex items-center gap-2">
              <Label htmlFor="search">Tìm đối tác</Label>
              <Input id="search" placeholder="Tên, email, số điện thoại..." className="w-[260px]" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tất cả loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="agency">Tour Agency</SelectItem>
                <SelectItem value="hotel">Hotel Partner</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="cruise">Cruise</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-2"><Plus className="size-4" /> Thêm đối tác</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            {partners.map((p, idx) => (
              <div key={p.id} className={`rounded-lg border p-3 flex items-center gap-3 ${idx===0?"bg-secondary/20":""}  hover:bg-muted/100`}>
                <div className="size-10 rounded-full overflow-hidden border"><img src={p.logo} alt={p.company} className="h-full w-full object-cover" /></div>
                <div className="flex-1">
                  <div className="font-medium">{p.company}</div>
                  <div className="text-xs text-muted-foreground">{p.email} • {p.phone}</div>
                </div>
                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs">{p.category}</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon-sm"><PhoneCall className="size-4" /></Button>
                  <Button variant="ghost" size="icon-sm"><MessageCircle className="size-4" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div>Đang hiển thị 9 trên tổng 1.620</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">Trước</Button>
              <Button variant="secondary" size="sm">1</Button>
              <Button variant="ghost" size="sm">2</Button>
              <Button variant="ghost" size="sm">3</Button>
              <Button variant="ghost" size="sm">Sau</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-xl">
            <img src={selectedPartner.cover} alt="cover" className="h-32 w-full object-cover" />
          </div>
          <div className="-mt-6 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full overflow-hidden border bg-background"><img src={selectedPartner.logo} alt={selectedPartner.company} className="h-full w-full object-cover" /></div>
                <div>
                  <div className="text-lg font-semibold">{selectedPartner.company}</div>
                  <div className="text-xs text-muted-foreground">{selectedPartner.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="icon-sm"><PhoneCall className="size-4" /></Button>
                <Button variant="secondary" size="icon-sm"><MessageCircle className="size-4" /></Button>
              </div>
            </div>
          </div>

          <div className="px-6">
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Năm hoạt động</div>
                <div className="font-medium mt-1">{selectedPartner.yearsInOperation}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Hạng đối tác</div>
                <div className="font-medium mt-1">{selectedPartner.partnerTier}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Loại hợp đồng</div>
                <div className="font-medium mt-1">{selectedPartner.contractType}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Trạng thái</div>
                <div className="font-medium mt-1">{selectedPartner.status}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 flex items-center gap-2 text-sm"><MapPin className="size-4" /> {selectedPartner.address}</div>
              <a href={selectedPartner.website} target="_blank" className="rounded-lg border p-3 flex items-center gap-2 text-sm"><Globe className="size-4" /> {selectedPartner.website}</a>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium">Dịch vụ cung cấp</div>
              <div className="mt-2 flex flex-col gap-2">
                {selectedPartner.services.map((s) => (
                  <div key={s} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium">Tuân thủ & Chứng nhận</div>
              <div className="mt-2 flex flex-col gap-2">
                {selectedPartner.compliance.map((c) => (
                  <div key={c} className="flex items-start gap-2 text-sm">
                    <ShieldCheck className="size-4 text-blue-600 flex-shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium">Hợp đồng</div>
              <div className="mt-2 flex flex-col gap-3">
                {selectedPartner.contracts.map((ct) => (
                  <div key={ct.name} className="rounded-lg border p-3">
                    <div className="font-medium flex items-center gap-2"><FileText className="size-4" /> {ct.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{ct.period}</div>
                    <p className="text-sm text-muted-foreground mt-2">{ct.terms}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button className="mt-6 w-full" variant="secondary">Chỉnh sửa hồ sơ</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}