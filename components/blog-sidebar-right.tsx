"use client"

import { Box, Button, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { MoreHorizontal } from "lucide-react"

type TrendingItem = {
  id: string | number
  context?: string
  region?: string
  label: string
  posts: string
}

type BlogSidebarRightProps = {
  title?: string
  items?: TrendingItem[]
  className?: string
}

const defaultItems: TrendingItem[] = [
  { id: 1, context: "Vietnam", label: "Hello", posts: "457K posts" },
  { id: 2, region: "Vietnam", label: "phong", posts: "21.6K posts" },
  { id: 3, region: "Vietnam", label: "Adoption", posts: "45.7K posts" },
  { id: 4, region: "Vietnam", label: "FADE", posts: "34.4K posts" },
]

export default function BlogSidebarRight({
  title = "What’s happening",
  items = defaultItems,
  className,
}: Readonly<BlogSidebarRightProps>) {
  return (
    <Box
      className={className}
      padding={5}
      bg="blackAlpha.700"
      color="white"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      w="full"
    >
      <Text fontSize="lg" fontWeight="bold" px={2} py={1}>{title}</Text>

      <VStack align="stretch" mt={1} wordSpacing={2}>
        {items.map((it) => {
          const top = it.context ? `${it.context} · Trending` : it.region ? `Trending in ${it.region}` : "Trending"
          return (
            <Box key={it.id} px={2} py={3} borderRadius="md" _hover={{ bg: "whiteAlpha.100" }}>
              <HStack justify="space-between" align="start">
                <VStack align="start" wordSpacing={0.5}>
                  <Text fontSize="xs" color="whiteAlpha.700">{top}</Text>
                  <Text fontSize="md" fontWeight="semibold">{it.label}</Text>
                  <Text fontSize="xs" color="whiteAlpha.700">{it.posts}</Text>
                </VStack>
                <Button variant="ghost" size="sm" px={2} aria-label="more" _hover={{ bg: "whiteAlpha.200" }}>
                  <Icon as={MoreHorizontal} />
                </Button>
              </HStack>
            </Box>
          )
        })}
      </VStack>
    </Box>
  )
}