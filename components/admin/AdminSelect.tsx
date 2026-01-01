"use client";

import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AdminSelectProps {
    value: string;
    onValueChange: (val: string) => void;
    placeholder: string;
    options: { label: string; value: string }[];
    className?: string;
    width?: string;
}

export const AdminSelect = ({
    value,
    onValueChange,
    placeholder,
    options,
    className = "",
    width = "w-[160px]",
}: AdminSelectProps) => {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className={`${width} bg-white/5 border-white/10 ${className}`}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
