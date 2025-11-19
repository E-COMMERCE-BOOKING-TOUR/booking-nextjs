"use client";

import { Box, Button, Icon, Image } from "@chakra-ui/react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useState } from "react";

interface TourMapSectionProps {
    mapUrl: string;
    previewImage?: string;
}

const DEFAULT_PREVIEW = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop";

export default function TourMapSection({ mapUrl, previewImage }: TourMapSectionProps) {
    const [showMap, setShowMap] = useState(false);

    return (
        <Box borderRadius="lg" overflow="hidden" height="auto" position="relative">
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
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                colorScheme="blue"
                size="lg"
                onClick={() => setShowMap(!showMap)}
            >
                {showMap ? "Hide map" : "Show on map"}
                <Icon as={FaMapMarkerAlt} />
            </Button>
        </Box>
    );
}


