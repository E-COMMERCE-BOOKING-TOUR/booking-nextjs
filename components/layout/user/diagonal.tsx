"use client"
import { Box, Button, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { IDivisionTrending } from "@/types/response/division";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

const galleryImages = [
  "/assets/images/travel.jpg",
  "/assets/images/travel.jpg",
  "/assets/images/travel.jpg",
  "/assets/images/travel.jpg",
  "/assets/images/travel.jpg",
  "/assets/images/travel.jpg",
];

const layersConfig = [
  { translateY: "calc(-100vh * 0.95)", duration: "25s", direction: "normal", opacity: 0.6 },
  { translateY: "calc(-100vh * 0.57)", duration: "30s", direction: "reverse", opacity: 0.7 },
  { translateY: "calc(-100vh * 0.19)", duration: "35s", direction: "normal", opacity: 0.8 },
  { translateY: "calc(100vh * 0.19)", duration: "28s", direction: "reverse", opacity: 0.8 },
  { translateY: "calc(100vh * 0.57)", duration: "32s", direction: "normal", opacity: 0.7 },
  { translateY: "calc(100vh * 0.95)", duration: "38s", direction: "reverse", opacity: 0.6 },
];

export default function Diagonal({ divisions = [] }: { divisions?: IDivisionTrending[] }) {
  const displayImages = divisions.length > 0
    ? divisions.map(d => d.image)
    : galleryImages;

  return (
    <>
      <Box
        position="relative"
        w="full"
        h={{ base: "520px", md: "640px" }}
        overflow="hidden"
        bg="gray.900"
        marginBottom="-120px"
        zIndex={10}
      >
        <style jsx global>{`
        @keyframes scrollLeft {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-2400px, 0, 0);
          }
        }
        @keyframes scrollRight {
          0% {
            transform: translate3d(-2400px, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        
        /* Smooth animation with hardware acceleration */
        .diagonal-scroll-wrapper {
          will-change: transform;
          transform: translateZ(0);
        }
        
        .diagonal-image-box {
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      `}</style>

        {/* Multiple Diagonal Image Layers */}
        {layersConfig.map((layer, layerIndex) => (
          <Box
            key={`layer-${layerIndex}`}
            position="absolute"
            top="50%"
            left="50%"
            width="max(200%, 2560px)"
            height="calc(100vh * 0.38)"
            zIndex={10}
            overflow="hidden"
            opacity={layer.opacity}
            style={{ transform: `translate(-50%, -50%) rotate(-70deg) translateY(${layer.translateY}) translateZ(0)` }}
          >
            <Box
              className="diagonal-scroll-wrapper"
              display="flex"
              h="full"
              gap={0}
              style={{
                animation: `${layer.direction === "normal" ? "scrollLeft" : "scrollRight"} ${layer.duration} linear infinite`,
              }}
            >
              {/* Render 3 sets for truly seamless loop */}
              {[0, 1, 2].map((setIndex) => (
                displayImages.map((image, index) => (
                  <Box
                    key={`layer${layerIndex}-set${setIndex}-img${index}`}
                    className="diagonal-image-box"
                    position="relative"
                    w="400px"
                    h="full"
                    flexShrink={0}
                    overflow="hidden"
                  >
                    <Image
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      priority={layerIndex < 2 && index < 3 && setIndex === 0}
                    />
                    <Box
                      position="absolute"
                      inset={0}
                      bg="blackAlpha.400"
                    />
                  </Box>
                ))
              ))}
            </Box>
          </Box>
        ))}
        {/* Content */}
        <Container
          maxW="container.xl"
          h="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          zIndex={11}
        >
          <VStack gap={6} maxW="720px" textAlign="center">
            <Heading
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="bold"
              color="white"
              lineHeight="1.3"
            >
              Discover the best destinations for your next trip with TripConnect&apos;s Travel Platform
            </Heading>

            <Text fontSize="md" color="whiteAlpha.900">
              Discover the best destinations for your next trip with TripConnect&apos;s Travel Platform
            </Text>

            <Box w="full" maxW="600px" h="1px" bg="whiteAlpha.400" my={1} />

            <Button
              size="lg"
              variant="outline"
              borderColor="white"
              color="white"
              borderRadius="full"
              px={8}
              py={6}
              fontSize="md"
              fontWeight="semibold"
              _hover={{
                bg: "white",
                color: "blue.900",
                shadow: "xl",
              }}
              transition="all 0.3s"
            >
              Discover Now
              <ChevronRight size={20} style={{ marginLeft: "8px" }} />
            </Button>
          </VStack>
        </Container>
        {/* Dark overlay for better text contrast */}
        <Box
          position="absolute"
          inset={0}
          bg="blackAlpha.400"
          zIndex={0}
        />
      </Box>
    </>
  );
}
