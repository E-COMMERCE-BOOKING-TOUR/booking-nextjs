import { Heading, Text, VStack } from '@chakra-ui/react';

export default function HeaderList({ title, description }: { title: string; description?: string }) {
  return (
    <VStack gap={2} alignItems="flex-start" mb={4} mt={8}>
      <Heading as="h2" size="2xl" fontWeight="bold" >
        {title}
      </Heading>
      {description && <Text color="gray.500">{description}</Text>}
    </VStack>
  );
}
