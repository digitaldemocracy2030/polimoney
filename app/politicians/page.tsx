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
import { PoliticianCard } from '@/components/PoliticianCard';
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
          {entries.map((entry) => (
            <PoliticianCard key={entry.id} entry={entry} />
          ))}
        </SimpleGrid>
      </Box>
      <Notice />
      <Footer />
    </Box>
  );
}
