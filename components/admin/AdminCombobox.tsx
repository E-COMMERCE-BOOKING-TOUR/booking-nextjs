"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/libs/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface AdminComboboxProps {
    value: string;
    onValueChange: (val: string) => void;
    placeholder: string;
    searchPlaceholder?: string;
    emptyText?: string;
    options: { label: string; value: string }[];
    className?: string;
    width?: string;
}

export const AdminCombobox = ({
    value,
    onValueChange,
    placeholder,
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    options,
    className = "",
    width = "w-[200px]",
}: AdminComboboxProps) => {
    const [open, setOpen] = React.useState(false);

    const selectedLabel = React.useMemo(() => {
        return options.find((opt) => opt.value === value)?.label || placeholder;
    }, [value, options, placeholder]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        width,
                        "justify-between bg-white/5 border-white/10 hover:bg-white/10 text-white font-normal",
                        className
                    )}
                >
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn(width, "p-0 border-white/10 bg-slate-900")}>
                <Command className="bg-transparent text-white">
                    <CommandInput
                        placeholder={searchPlaceholder}
                        className="h-9 border-none focus:ring-0"
                    />
                    <CommandList>
                        <CommandEmpty className="py-2 px-4 text-sm text-slate-400">{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label} // CommandItem uses value for filtering, label is usually better for search
                                    onSelect={() => {
                                        onValueChange(option.value);
                                        setOpen(false);
                                    }}
                                    className="text-slate-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
