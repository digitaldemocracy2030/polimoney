import {
  Badge,
  Box,
  Card,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import {
  comingSoonId,
  politicianMaster,
} from '@/data/politician-master';

export const metadata: Metadata = {
  title: '政治家一覧 | Polimoney (ポリマネー)',
};

export default function Page() {
  const entries = politicianMaster.filter(
    (e) => !e.id.startsWith(comingSoonId),
  );

  return (
    <Box>
      <Header />
      <Box px={4} py={6}>
        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          政治家一覧
        </Text>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          {entries.map((entry) => (
            <Link
              href={`/politicians/${entry.id}`}
              key={entry.id}
            >
              <Card.Root
                flexDirection="row"
                h="90px"
                boxShadow="xs"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ boxShadow: 'sm', borderColor: 'gray.300' }}
                transition="all 0.15s"
                cursor="pointer"
                overflow="hidden"
              >
                <Image
                  objectFit="cover"
                  w="90px"
                  h="90px"
                  flexShrink={0}
                  src={entry.profile.image}
                  alt={entry.profile.name}
                />
                <Card.Body px={4} py={3} display="flex" alignItems="center">
                  <Stack gap={0}>
                    <Text fontSize="xs" color="gray.500">
                      {entry.profile.title}
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">
                      {entry.profile.name}
                    </Text>
                    <HStack mt={1}>
                      {entry.profile.party && (
                        <Badge variant="outline" colorPalette="red" fontSize="xs">
                          {entry.profile.party}
                        </Badge>
                      )}
                      {entry.profile.district && (
                        <Badge variant="outline" fontSize="xs">
                          {entry.profile.district}
                        </Badge>
                      )}
                    </HStack>
                  </Stack>
                </Card.Body>
              </Card.Root>
            </Link>
          ))}
        </SimpleGrid>
      </Box>
      <Notice />
      <Footer />
    </Box>
  );
}
