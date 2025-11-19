import { Breadcrumb as BreadcrumbPrimitive } from "@chakra-ui/react";
import { Fragment } from "react/jsx-runtime";

export default function Breadcrumb({ items }: { items: { label: string; href: string }[] }) {
    return <BreadcrumbPrimitive.Root my={4}>
        <BreadcrumbPrimitive.List>
            {items.map((item, index) => (
                <Fragment key={index}>
                    <BreadcrumbPrimitive.Item fontWeight="bold" fontSize="md">
                        {item.href ? (
                            <BreadcrumbPrimitive.Link href={item.href}>{item.label}</BreadcrumbPrimitive.Link>
                        ) : (
                            <BreadcrumbPrimitive.CurrentLink>{item.label}</BreadcrumbPrimitive.CurrentLink>
                        )}
                    </BreadcrumbPrimitive.Item>
                    {index < items.length - 1 && (
                        <BreadcrumbPrimitive.Separator />
                    )}
                </Fragment>
            ))}
        </BreadcrumbPrimitive.List>
    </BreadcrumbPrimitive.Root>;
}