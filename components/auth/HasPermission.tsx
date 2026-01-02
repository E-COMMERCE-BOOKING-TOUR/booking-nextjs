"use client";

import { usePermissions } from "@/hooks/usePermissions";
import React from "react";

interface HasPermissionProps {
    permission?: string;
    permissions?: string[];
    operator?: "any" | "all";
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const HasPermission: React.FC<HasPermissionProps> = ({
    permission,
    permissions,
    operator = "any",
    children,
    fallback = null,
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    let allowed = false;

    if (permission) {
        allowed = hasPermission(permission);
    } else if (permissions) {
        if (operator === "any") {
            allowed = hasAnyPermission(permissions);
        } else {
            allowed = hasAllPermissions(permissions);
        }
    } else {
        // If neither is provided, don't show children unless you want to default to true.
        // Usually, misconfiguration should fail closed.
        allowed = false;
    }

    if (allowed) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
