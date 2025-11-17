"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CardInput } from "@/components/CardInput";

export default function AdminTourEdit() {
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

    const handleFiles = (files: FileList | null) => {
        const arr = Array.from(files || []);
        setImages(arr);
        setPreviews(arr.map((f) => URL.createObjectURL(f)));
    };

    const removeImage = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
        setPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="w-full flex flex-col ">
            <Card className="border-none shadow-none">
                <CardHeader className="border-b">
                    <CardAction className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSubmit}>
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
                            <CardInput title="Country">
                                <Select value={countryId} onValueChange={(v) => setCountryId(v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn country" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Vietnam</SelectItem>
                                        <SelectItem value="2">USA</SelectItem>
                                        <SelectItem value="3">Japan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Division">
                                <Select value={divisionId} onValueChange={(v) => setDivisionId(v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn division" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">North</SelectItem>
                                        <SelectItem value="2">Central</SelectItem>
                                        <SelectItem value="3">South</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Currency">
                                <Select value={currencyId} onValueChange={(v) => setCurrencyId(v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn currency" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">VND</SelectItem>
                                        <SelectItem value="2">USD</SelectItem>
                                        <SelectItem value="3">JPY</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Supplier">
                                <Select value={supplierId} onValueChange={(v) => setSupplierId(v)}>
                                    <SelectTrigger><SelectValue placeholder="Chọn supplier" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Venice Experience Co.</SelectItem>
                                        <SelectItem value="2">Serengeti Safaris Ltd.</SelectItem>
                                        <SelectItem value="3">Swiss Alpine Tours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardInput>
                            <CardInput title="Tùy chọn hiển thị">
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

                            </CardInput>
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
                            <Button type="submit">Lưu</Button>
                        </CardAction>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}