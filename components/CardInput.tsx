import { Card, CardTitle } from "@/components/ui/card";
import React from "react";

type CardInputProps = {
    children: React.ReactNode,
    className?: string,
    title?: string,
}

export const CardInput = (props: CardInputProps) => {
    return (
        <Card className={`flex flex-col gap-1 p-2 ${props.className}`}>
            <CardTitle className="py-2 w-full">{props.title}</CardTitle>
            {props.children}
        </Card>
    )
}