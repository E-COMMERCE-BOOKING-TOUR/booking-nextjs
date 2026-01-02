import { useSession } from "next-auth/react";

export const usePermissions = () => {
    const { data: session } = useSession();
    const user = session?.user;
    console.log(user)
    const hasPermission = (permission_name: string): boolean => {
        if (!user) return false;

        // Admin has all permissions
        if (user.role?.name?.toLowerCase() === 'admin') return true;

        const permissions = user.role?.permissions || [];
        return permissions.some((p: any) =>
            (typeof p === 'string' ? p : p.permission_name) === permission_name
        );
    };

    const hasAnyPermission = (permission_names: string[]): boolean => {
        if (!user) return false;
        if (user.role?.name?.toLowerCase() === 'admin') return true;

        const permissions = user.role?.permissions || [];
        return permission_names.some(name =>
            permissions.some((p: any) =>
                (typeof p === 'string' ? p : p.permission_name) === name
            )
        );
    };

    const hasAllPermissions = (permission_names: string[]): boolean => {
        if (!user) return false;
        if (user.role?.name?.toLowerCase() === 'admin') return true;

        const permissions = user.role?.permissions || [];
        return permission_names.every(name =>
            permissions.some((p: any) =>
                (typeof p === 'string' ? p : p.permission_name) === name
            )
        );
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        user
    };
};
