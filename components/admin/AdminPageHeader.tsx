"use client";

import React from "react";

interface AdminPageHeaderProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

export const AdminPageHeader = ({ title, description, children }: AdminPageHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
                <p className="text-muted-foreground mt-1 text-lg">{description}</p>
            </div>
            {children}
        </div>
    );
};
