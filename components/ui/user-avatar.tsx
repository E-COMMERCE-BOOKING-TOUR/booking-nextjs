
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";

interface UserAvatarProps {
    name?: string;
    image?: string;
    className?: string;
}

const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
];

export function UserAvatar({ name = "User", image, className }: UserAvatarProps) {
    const initials = useMemo(() => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    }, [name]);

    const bgColor = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    }, [name]);

    return (
        <Avatar className={className}>
            <AvatarImage src={image} alt={name} className="object-cover" />
            <AvatarFallback className={`${bgColor} text-white font-medium`}>
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
