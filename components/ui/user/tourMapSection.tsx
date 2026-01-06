"use client";

import { Box, Button, Icon, Image } from "@chakra-ui/react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface TourMapSectionProps {
    mapUrl: string;
    previewImage?: string;
}

const DEFAULT_PREVIEW = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop";

export default function TourMapSection({ mapUrl, previewImage }: TourMapSectionProps) {
    const t = useTranslations('common');
    const [showMap, setShowMap] = useState(false);

    return (
        <Box w="full" borderRadius="2xl" overflow="hidden" height="250px" position="relative" boxShadow="sm" border="1px solid" borderColor="gray.100">
            {showMap ? (
                <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                />
            ) : (
                <Image
                    src={previewImage || DEFAULT_PREVIEW}
                    alt="Map preview"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                />
            )}
            <Button
                position="absolute"
                bottom="20px"
                left="50%"
                transform="translateX(-50%)"
                bg="white"
                color="main"
                size="sm"
                px={6}
                rounded="full"
                fontWeight="black"
                boxShadow="xl"
                _hover={{ bg: "gray.50", transform: "translateX(-50%) translateY(-2px)" }}
                transition="all 0.2s"
                onClick={() => setShowMap(!showMap)}
            >
                {showMap ? t("hide_map") : t("show_on_map")}
                <Icon as={FaMapMarkerAlt} ml={2} />
            </Button>
        </Box>
    );
}


