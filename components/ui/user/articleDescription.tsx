'use client'

import { Box } from "@chakra-ui/react";

export default function ArticleDescription({ description }: { description: string }) {
    return (
        <Box
            as="div"
            fontSize="sm"
            color="gray.600"
            lineHeight="1.6"
            dangerouslySetInnerHTML={{ __html: description }}
            suppressHydrationWarning
            css={{
                '& > *': {
                    margin: 0,
                    padding: 0
                }
            }}
        />
    )
}