"use client";
import { Box, Text, VStack, HStack, Button, Icon, Textarea, Image, Input, List } from "@chakra-ui/react";
import { useState } from "react";
import { FiEdit, FiX, FiUsers, FiTag, FiImage, FiSmile, FiCalendar, FiMapPin } from "react-icons/fi";
import ItemBlog from "./ItemBlog";

const dataBlog = [
    {
        id: 0,
        title: "NestJS: tốc độ cao, dễ mở rộng, có hỗ trợ microservice  NextJS: sử dụng react và web cần SEO nên cần ..",
        description: "Description",
        images: ["https://picsum.photos/200/300", "https://picsum.photos/200/300"],
        tags: ["tag1", "tag2"],
        timestamp: "2023-01-01",
        views: 100,
        likes: 10,
        comments: 10,
    },
    {
        id: 1,
        title: "NestJS: tốc độ cao, dễ mở rộng, có hỗ trợ microservice  NextJS: sử dụng react và web cần SEO nên cần ..",
        description: "Description",
        images: ["https://picsum.photos/200/300"],
        tags: ["tag1", "tag2"],
        timestamp: "2023-01-01",
        views: 100,
        likes: 10,
        comments: 10,
    },
    {
        id: 2,
        title: "NestJS: tốc độ cao, dễ mở rộng, có hỗ trợ microservice  NextJS: sử dụng react và web cần SEO nên cần ..",
        description: "Description",
        images: ["https://picsum.photos/200/300", "https://picsum.photos/200/300", "https://picsum.photos/200/300"],
        tags: ["tag1", "tag2"],
        timestamp: "2023-01-01",
        views: 100,
        likes: 10,
        comments: 10,
    },
    {
        id: 3,
        title: "Title",
        description: "Description",
        images: ["https://picsum.photos/200/300", "https://picsum.photos/200/300", "https://picsum.photos/200/300", "https://picsum.photos/200/300"],
        tags: ["tag1", "tag2"],
        timestamp: "2023-01-01",
        views: 100,
        likes: 10,
        comments: 10,
    },
]

const ForYou = () => {
    const [content, setContent] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [showDescription, setShowDescription] = useState(false);
    const [description, setDescription] = useState("");

    const onSelectFiles = (files: FileList | null) => {
        const arr = Array.from(files || []);
        const urls = arr.map((f) => URL.createObjectURL(f));
        setImages(urls);
    };

    const removeImage = (idx: number) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <VStack align="stretch" gap={3}>
            <Box bg="blackAlpha.600" color="white" p={4} borderRadius="lg">
                <HStack align="flex-start" gap={3}>
                    <Box
                        bg="pink.600"
                        color="white"
                        rounded="full"
                        minW={10}
                        minH={10}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold">H</Box>
                    <VStack align="stretch" gap={3} flex={1}>
                        <Textarea
                            placeholder="What's happening?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            variant="outline"
                            fontSize="lg"
                            resize="none"
                        />

                        {images.length > 0 && (
                            <Box position="relative" borderRadius="lg" overflow="hidden" bg="blackAlpha.700">
                                <HStack position="absolute" top={2} left={2} gap={2}>
                                    <Button size="sm" variant="outline" colorScheme="gray"><Icon as={FiEdit} />Edit</Button>
                                </HStack>
                                <Button size="sm" variant="ghost" position="absolute" top={2} right={2} onClick={() => removeImage(0)}>
                                    <Icon as={FiX} />
                                </Button>
                                <Image src={images[0]} alt="preview" w="full" h="auto" objectFit="cover" />
                            </Box>
                        )}

                        <HStack gap={4} fontSize="sm" color="whiteAlpha.800">
                            <HStack gap={2} cursor="pointer">
                                <Icon as={FiUsers} />
                                <Text>Tag people</Text>
                            </HStack>
                            <HStack gap={2} cursor="pointer" onClick={() => setShowDescription((p) => !p)}>
                                <Icon as={FiTag} />
                                <Text>Add description</Text>
                            </HStack>
                        </HStack>

                        {showDescription && (
                            <Input placeholder="Add a description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        )}

                        <Text fontSize="sm" color="blue.300">Everyone can reply</Text>

                        <HStack justify="space-between" align="center">
                            <HStack gap={3}>
                                <Button as="label" variant="ghost" colorScheme="whiteAlpha" px={2}>
                                    <Icon as={FiImage} />
                                    <Input type="file" accept="image/*" multiple display="none" onChange={(e) => onSelectFiles(e.target.files)} />
                                </Button>
                                <Button variant="ghost" colorScheme="whiteAlpha" px={2}><Icon as={FiSmile} /></Button>
                                <Button variant="ghost" colorScheme="whiteAlpha" px={2}><Icon as={FiCalendar} /></Button>
                                <Button variant="ghost" colorScheme="whiteAlpha" px={2}><Icon as={FiMapPin} /></Button>
                            </HStack>

                            <Button colorScheme="blue" borderRadius="full">Post</Button>
                        </HStack>
                    </VStack>
                </HStack>
            </Box>
            <List.Root w="full" variant="marker" gap={3} display="flex" flexDirection="column" alignItems={'center'}>
                {
                    dataBlog.map((item) => (
                        <List.Item key={item.id}
                            w="full"
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'center'}
                        >
                            <ItemBlog
                                image={item.images?.[0] || ""}
                                id={item.id}
                                title={item.title}
                                description={item.description}
                                images={item.images}
                                tags={item.tags}
                                timestamp={item.timestamp}
                                views={item.views}
                                likes={item.likes}
                                comments={item.comments} />
                        </List.Item>
                    ))
                }
            </List.Root>
        </VStack>
    );
}

export default ForYou;