"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CardInput } from "@/components/CardInput";
import { tourApi } from "@/apis/tour";
import { toaster } from "@/components/chakra/toaster";
import { masterApi } from "@/apis/master";
import { useRouter } from "next/navigation";
import { ICountry, ICurrency, IDivision } from "@/types/response/base.type";
import { ISupplier } from "@/types/response/tour.type";
import { redirect } from "next/navigation";

export default function AdminTourEdit() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [summary, setSummary] = useState("");
    const [mapUrl, setMapUrl] = useState("");
    const [slug, setSlug] = useState("");
    const [address, setAddress] = useState("");
    const [scoreRating, setScoreRating] = useState<number | "">("");
    const [tax, setTax] = useState<number | "">("");
    const [isVisible, setIsVisible] = useState(false);
    const [publishedAt, setPublishedAt] = useState<string | "">("");
    const [publishStatus, setPublishStatus] = useState("draft");
    const [durationHours, setDurationHours] = useState<number | "">("");
    const [durationDaysDetail, setDurationDaysDetail] = useState<number | "">("");
    const [minPax, setMinPax] = useState<number | "">("");
    const [maxPax, setMaxPax] = useState<number | "">("");
    const [countryId, setCountryId] = useState<string>("1");
    const [divisionId, setDivisionId] = useState<string>("1");
    const [currencyId, setCurrencyId] = useState<string>("1");
    const [supplierId, setSupplierId] = useState<string>("1");
    const [countries, setCountries] = useState<ICountry[]>([]);
    const [divisions, setDivisions] = useState<IDivision[]>([]);
    const [currencies, setCurrencies] = useState<ICurrency[]>([]);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [tags, setTags] = useState({ popular: false, discount: false, featured: false });
    const visibleCls = isVisible ? "bg-green-500/15 text-green-700" : "bg-red-500/15 text-red-700";
    const publishCls = publishStatus === "active" ? "bg-green-500/15 text-green-700" : publishStatus === "draft" ? "bg-gray-500/15 text-gray-700" : "bg-red-500/15 text-red-700";
    const tagOptions: { key: keyof typeof tags; label: string }[] = [
        { key: "popular", label: "Phổ biến" },
        { key: "discount", label: "Giảm giá" },
        { key: "featured", label: "Nổi bật" },
    ];

    useEffect(() => {
        (async () => {
            try {
                const [cs, ds, crs, ss] = await Promise.all([
                    masterApi.getCountries(),
                    masterApi.getDivisions(),
                    masterApi.getCurrencies(),
                    masterApi.getSuppliers(),
                ]);
                setCountries(cs.map(c => ({ ...c, divisions: [] })));
                setDivisions(ds);
                setCurrencies(crs.map(c => ({ ...c, tours: [] })));
                setSuppliers(ss.map(s => ({ ...s, tours: [] })));
                if (cs.length) setCountryId(String(cs[0].id));
                if (ds.length) setDivisionId(String(ds[0].id));
                if (crs.length) setCurrencyId(String(crs[0].id));
                if (ss.length) setSupplierId(String(ss[0].id));
            } catch (e) {
                toaster.create({ description: "Lỗi tải dữ liệu select", type: "error" });
            }
        })();
    }, []);

    const handleFiles = (files: FileList | null) => {
        const arr = Array.from(files || []);
        setImages(arr);
        setPreviews(arr.map((f) => URL.createObjectURL(f)));
    };

    const removeImage = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
        setPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const [isSubmitting, startTransition] = useTransition();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const dto = {
                title,
                description,
                summary,
                map_url: mapUrl || null,
                slug,
                address,
                score_rating: typeof scoreRating === "number" ? scoreRating : null,
                tax: typeof tax === "number" ? tax : 0,
                is_visible: isVisible,
                published_at: publishedAt || null,
                status: publishStatus as "draft" | "active" | "inactive",
                duration_hours: typeof durationHours === "number" ? durationHours : null,
                duration_days: typeof durationDaysDetail === "number" ? durationDaysDetail : null,
                min_pax: typeof minPax === "number" ? minPax : 1,
                max_pax: typeof maxPax === "number" ? maxPax : null,
                country_id: 1,
                division_id: 8,
                currency_id: 1,
                supplier_id: 1,
                tour_category_ids: [],
                images: previews.map((src, i) => ({ image_url: src, sort_no: i, is_cover: i === 0 })),
            };
            try {
                await tourApi.create(dto);
                router.push("/admin/tour");
                router.refresh();
            } catch (error) {
                toaster.create({ description: "Tạo tour thất bại", type: "error" });
                console.log("Error: " + error)
            }
        });
    };

    return (
        <div className="w-full flex flex-col ">
            <Card className="border-none shadow-none">
                <CardHeader className="border-b">
                    <CardAction className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                            <Save className="size-4" color={'#ffffff'} />
                            Lưu
                        </Button>
                    </CardAction>
                </CardHeader>
            </Card>
            <Card className="border-none shadow-none">
                <CardContent className="">
                    <form className="px-2 flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CardInput title="Title">
                                <Input className="py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                            </CardInput>
                            <CardInput title="Slug">
                                <Input className="py-2" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" />
                            </CardInput>
                            <CardInput title="Description" className="md:col-span-2">
                                <Textarea className="border-input dark:bg-input/30 dark:border-input h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                            </CardInput>
                            <CardInput title="Summary" className="md:col-span-2">
                                <Textarea className="border-input dark:bg-input/30 dark:border-input h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" />
                            </CardInput>
                            <CardInput title="Map URL">
                                <Input className="py-2" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://..." />
                            </CardInput>
                            <CardInput title="Address">
                                <Input className="py-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
                            </CardInput>
                            <CardInput title="Score rating">
                                <Input className="py-2" type="number" step="0.1"  max={5} value={scoreRating} onChange={(e) => setScoreRating(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0–5" />
                            </CardInput>
                            <CardInput title="Tax">
                                <Input className="py-2" type="number" step="0.01" value={tax} onChange={(e) => setTax(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Tax" />
                            </CardInput>
                            <CardInput title="Hiển thị">
                                <Select value={isVisible ? "show" : "hide"} onValueChange={(v) => setIsVisible(v === "show")}>
                                    <SelectTrigger className={visibleCls}>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="show"><span className="text-green-700">Hiện</span></SelectItem>
                                        <SelectItem value="hide"><span className="text-red-700">Ẩn</span></SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Published at">
                                <Input className="py-2" type="datetime-local" value={publishedAt || ""} onChange={(e) => setPublishedAt(e.target.value)} />
                            </CardInput>
                            <CardInput title="Status">
                                <Select value={publishStatus} onValueChange={(v) => setPublishStatus(v)}>
                                    <SelectTrigger className={publishCls}><SelectValue placeholder="Chọn" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">draft</SelectItem>
                                        <SelectItem value="active">active</SelectItem>
                                        <SelectItem value="inactive">inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Duration hours">
                                <Input className="py-2" type="number" min={0} value={durationHours} onChange={(e) => setDurationHours(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Giờ" />
                            </CardInput>
                            <CardInput title="Duration days">
                                <Input className="py-2" type="number" min={0} value={durationDaysDetail} onChange={(e) => setDurationDaysDetail(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Ngày" />
                            </CardInput>
                            <CardInput title="Min pax">
                                <Input className="py-2" type="number" min={1} value={minPax} onChange={(e) => setMinPax(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Tối thiểu" />
                            </CardInput>
                            <CardInput title="Max pax">
                                <Input className="py-2" type="number" min={1} value={maxPax} onChange={(e) => setMaxPax(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Tối đa" />
                            </CardInput>
                            {/* <CardInput title="Country">
                                <Select value={countryId} onValueChange={(v) => setCountryId(v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn country" /></SelectTrigger>
                                    <SelectContent>
                                        {countries.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Division">
                                <Select value={divisionId} onValueChange={(v) => setDivisionId(v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn division" /></SelectTrigger>
                                    <SelectContent>
                                        {divisions.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Currency">
                                <Select value={currencyId} onValueChange={(v) => setCurrencyId(v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn currency" /></SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Supplier">
                                <Select value={supplierId} onValueChange={(v) => setSupplierId(v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn supplier" /></SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardInput> */}
                            {/* <CardInput title="Tùy chọn hiển thị">
                                <CardContent className="grid grid-cols-3 gap-2 p-3">
                                    {tagOptions.map((t) => (
                                        <label key={t.key} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={tags[t.key]}
                                                onCheckedChange={(checked) => setTags({ ...tags, [t.key]: checked })}
                                            />
                                            {t.label}
                                        </label>
                                    ))}
                                </CardContent>

                            </CardInput> */}
                            <CardInput title="Ảnh (nhiều ảnh)" className="md:col-span-2">
                                    <Input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} />
                                    {
                                        previews.length > 0 ? <Card className=" grid grid-cols-4 gap-2 p-2">
                                            {previews.map((src, i) => (
                                                <div key={i} className="relative overflow-hidden rounded-lg border">
                                                    <img src={src} alt={`preview-${i}`} className="h-24 w-full object-cover" />
                                                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 rounded-xs bg-black/40 text-white px-1 text-xs">
                                                        <X className="size-4" color="#ffffff" />
                                                    </button>
                                                </div>
                                            ))}
                                        </Card> : null
                                    }
                            </CardInput>
                        </div>
                        <CardAction className="flex items-center justify-end gap-2">
                            <a href="/admin/tour-list"><Button type="button" variant="ghost">Hủy</Button></a>
                            <Button type="submit" disabled={isSubmitting}>Lưu</Button>
                        </CardAction>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}