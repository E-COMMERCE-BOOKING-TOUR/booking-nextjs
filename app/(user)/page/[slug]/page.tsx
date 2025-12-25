import { Container, Box, Heading } from '@chakra-ui/react';
import { staticPagesApi } from '@/apis/static-pages';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface StaticPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const page = await staticPagesApi.getBySlug(slug);
        return {
            title: page.meta_title || `${page.title} - TripConnect`,
            description: page.meta_description || undefined,
        };
    } catch (error) {
        return {
            title: 'Trang không tồn tại',
        };
    }
}

export default async function StaticPageDetail({ params }: StaticPageProps) {
    const { slug } = await params;
    let page = null;

    try {
        page = await staticPagesApi.getBySlug(slug);
    } catch (error) {
        return notFound();
    }

    if (!page) return notFound();

    return (
        <Box py={{ base: 10, md: 20 }} bg="white">
            <Container maxW="3xl">
                <Box mb={10}>
                    <Heading
                        as="h1"
                        size="2xl"
                        fontWeight="black"
                        letterSpacing="tight"
                        mb={4}
                        color="main"
                    >
                        {page.title}
                    </Heading>
                    <Box h="4px" w="60px" bg="secondary" borderRadius="full" />
                </Box>

                <Box
                    className="static-content"
                    fontSize="lg"
                    lineHeight="tall"
                    color="gray.700"
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                    css={{
                        '& h2': {
                            fontSize: '2xl',
                            fontWeight: 'bold',
                            mt: 8,
                            mb: 4,
                            color: 'gray.800'
                        },
                        '& h3': {
                            fontSize: 'xl',
                            fontWeight: 'semibold',
                            mt: 6,
                            mb: 4,
                            color: 'gray.800'
                        },
                        '& p': { mb: 6 },
                        '& ul, & ol': { mb: 6, pl: 6 },
                        '& li': { mb: 2 },
                        '& a': { color: 'main', textDecoration: 'underline' }
                    }}
                />
            </Container>
        </Box>
    );
}
