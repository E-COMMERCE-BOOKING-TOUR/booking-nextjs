"use client";

import { HStack, Icon } from "@chakra-ui/react";
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
    rating: number;
}

export default function StarRating({ rating }: StarRatingProps) {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(<Icon key={i} as={FaStar} color="orange.400" boxSize={4} />);
        } else if (i - 0.5 === rating) {
            stars.push(<Icon key={i} as={FaStarHalfAlt} color="orange.400" boxSize={4} />);
        } else {
            stars.push(<Icon key={i} as={FaRegStar} color="gray.300" boxSize={4} />);
        }
    }

    return <HStack gap={1}>{stars}</HStack>;
}

