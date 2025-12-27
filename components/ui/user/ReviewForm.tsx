"use client";

import {
    Box,
    Button,
    HStack,
    Input,
    Text,
    Textarea,
    VStack,
    Heading,
    Image as ChakraImage,
} from "@chakra-ui/react";
import { FaStar, FaImage, FaTimes } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toaster } from "@/components/chakra/toaster";
import tourApi from "@/apis/tour";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/libs/i18n/client";
import { cookieName, fallbackLng } from "@/libs/i18n/settings";
import Cookies from "js-cookie";
import { useMemo } from "react";

const createSchema = (t: any) => z.object({
    rating: z.number().min(1, t("rating_required")).max(5),
    title: z.string().min(2, t("title_min_length")).max(255),
    content: z.string().min(10, t("content_min_length")),
});

type FormDataValues = {
    rating: number;
    title: string;
    content: string;
}

interface ReviewFormProps {
    tourId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
    lng?: string;
}

export default function ReviewForm({ tourId, onSuccess, onCancel, lng: propLng }: ReviewFormProps) {
    const searchParams = useSearchParams();
    const lng = propLng || searchParams?.get('lng') || fallbackLng;
    const { t } = useTranslation(lng);
    const schema = useMemo(() => createSchema(t), [t]);
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormDataValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            rating: 5,
            title: "",
            content: "",
        },
    });

    const createReviewMutation = useMutation({
        mutationFn: (formData: FormData) => tourApi.createReviewFormData(formData, token),
        onSuccess: () => {
            toaster.create({
                title: t("confirm"),
                description: t("review_submit_success"),
                type: "success",
            });
            reset();
            setSelectedFiles([]);
            previews.forEach(p => URL.revokeObjectURL(p));
            setPreviews([]);
            queryClient.invalidateQueries({ queryKey: ["reviews", tourId] });
            onSuccess?.();
        },
        onError: (error: any) => {
            toaster.create({
                title: "Error",
                description: error?.message || t("review_submit_error"),
                type: "error",
            });
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (selectedFiles.length + files.length > 2) {
            toaster.create({
                title: t("image_limit_title"),
                description: t("image_limit_reached"),
                type: "warning",
            });
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > 2 * 1024 * 1024) {
                toaster.create({
                    title: t("image_too_large_title"),
                    description: t("image_too_large_desc", { name: file.name }),
                    type: "warning",
                });
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setPreviews(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);

        // Reset input value so same file can be selected again if removed
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = (data: FormDataValues) => {
        const formData = new FormData();
        formData.append("rating", data.rating.toString());
        formData.append("title", data.title);
        formData.append("content", data.content);
        formData.append("tour_id", tourId.toString());

        selectedFiles.forEach((file) => {
            formData.append("images", file);
        });

        createReviewMutation.mutate(formData);
    };

    return (
        <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
            <VStack gap={5} align="stretch" as="form" onSubmit={handleSubmit(onSubmit)}>
                <Heading size="md">{t("review_write_title")}</Heading>

                <Box>
                    <Text mb={2} fontWeight="bold">{t("rating_label")} <Text as="span" color="red.500">*</Text></Text>
                    <Controller
                        name="rating"
                        control={control}
                        render={({ field }) => (
                            <HStack gap={1.5}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        size={28}
                                        color={star <= field.value ? "#FFB700" : "#E2E8F0"}
                                        cursor="pointer"
                                        onClick={() => field.onChange(star)}
                                        style={{ transition: "color 0.2s" }}
                                    />
                                ))}
                            </HStack>
                        )}
                    />
                    {errors.rating && <Text color="red.500" fontSize="xs" mt={1}>{errors.rating.message}</Text>}
                </Box>

                <Box>
                    <Text mb={2} fontWeight="bold">{t("title_label")} <Text as="span" color="red.500">*</Text></Text>
                    <Input
                        placeholder={t("title_placeholder")}
                        {...register("title")}
                    />
                    {errors.title && <Text color="red.500" fontSize="xs" mt={1}>{errors.title.message}</Text>}
                </Box>

                <Box>
                    <Text mb={2} fontWeight="bold">{t("content_label")} <Text as="span" color="red.500">*</Text></Text>
                    <Textarea
                        placeholder={t("content_placeholder")}
                        rows={4}
                        {...register("content")}
                    />
                    {errors.content && <Text color="red.500" fontSize="xs" mt={1}>{errors.content.message}</Text>}
                </Box>

                <Box>
                    <Text mb={3} fontWeight="bold">{t("images_label")}</Text>
                    <HStack gap={4} wrap="wrap">
                        {previews.map((preview, index) => (
                            <Box key={index} position="relative" w="120px" h="90px" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                                <ChakraImage src={preview} alt={`preview-${index}`} objectFit="cover" w="100%" h="100%" />
                                <Box
                                    position="absolute"
                                    top={1}
                                    right={1}
                                    bg="rgba(0,0,0,0.6)"
                                    borderRadius="full"
                                    w={6}
                                    h={6}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    cursor="pointer"
                                    onClick={() => removeImage(index)}
                                    _hover={{ bg: "red.500" }}
                                >
                                    <FaTimes color="white" size={12} />
                                </Box>
                            </Box>
                        ))}
                        {selectedFiles.length < 2 && (
                            <VStack
                                justify="center"
                                align="center"
                                w="120px"
                                h="90px"
                                border="2px dashed"
                                borderColor="gray.300"
                                borderRadius="md"
                                cursor="pointer"
                                _hover={{ borderColor: "main", bg: "blue.50", color: "main" }}
                                onClick={() => fileInputRef.current?.click()}
                                color="gray.500"
                                transition="all 0.2s"
                            >
                                <FaImage size={24} />
                                <Text fontSize="xs" fontWeight="bold">{t("add_image")}</Text>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </VStack>
                        )}
                    </HStack>
                </Box>

                <HStack gap={3} pt={2}>
                    <Button
                        bg="main"
                        color="white"
                        type="submit"
                        loading={createReviewMutation.isPending}
                        px={10}
                        h={11}
                        fontWeight="bold"
                        _hover={{ bg: "blue.700" }}
                    >
                        {t("submit_review")}
                    </Button>
                    {onCancel && (
                        <Button variant="outline" borderColor="gray.200" onClick={onCancel} h={11} px={6}>
                            {t("cancel")}
                        </Button>
                    )}
                </HStack>
            </VStack>
        </Box>
    );
}
