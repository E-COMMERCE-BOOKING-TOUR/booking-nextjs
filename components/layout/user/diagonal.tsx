"use client"
import { Box, Button, Container, Heading, Text, VStack } from "@chakra-ui/react";
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

export default function Diagonal() {
  return (
    <Box position="relative" w="full" h={{ base: "520px", md: "640px" }} overflow="hidden" bg="gray.900" marginTop="-100px" zIndex={1}>
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
          zIndex={0}
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
              galleryImages.map((image, index) => (
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

      {/* Dark overlay for better text contrast */}
      <Box
        position="absolute"
        inset={0}
        bg="blackAlpha.400"
        zIndex={0}
      />

      {/* Content */}
      <Container
        maxW="container.xl"
        h="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        zIndex={1}
        px={{ base: 6, md: 12 }}
      >
        <VStack gap={6} maxW="720px" textAlign="center" mt="5rem">
          <Heading
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="bold"
            color="white"
          >
            What is Lorem Ipsum?
          </Heading>

          <Text fontSize="md" color="whiteAlpha.900">
            There are many variations of passages of Lorem Ipsum
          </Text>

          <Box w="full" maxW="600px" h="1px" bg="whiteAlpha.400" my={4} />

          <Text
            fontSize="sm"
            color="whiteAlpha.800"
            lineHeight="1.8"
            maxW="700px"
          >
            There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in
            some form, by injected humour, or randomised words which don&apos;t look even slightly believable
          </Text>

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
              transform: "translateY(-2px)",
              shadow: "xl",
            }}
            transition="all 0.3s"
          >
            Explore Now
            <ChevronRight size={20} style={{ marginLeft: "8px" }} />
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
