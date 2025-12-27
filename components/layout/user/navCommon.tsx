import { HStack, Image } from "@chakra-ui/react";
import { NavItem } from "./navItem";

export const MenuLinks = ({ items = [] }: { items?: any[], isMobile?: boolean }) => {
    const LinkComponent = HStack;

    return (
        <LinkComponent
            gap={8}
            align={"center"}
            justifyContent="center"
        >
            {items.map((link) => (
                <NavItem key={link.name} item={link} />
            ))}
        </LinkComponent>
    );
};

export const Logo = ({ logoUrl }: { logoUrl?: string | null }) => {
    return (
        <Image
            src={logoUrl || "/assets/images/logo.png"}
            objectFit="contain"
            alt="logo"
            width={200}
            height={30}
        />
    );
};
