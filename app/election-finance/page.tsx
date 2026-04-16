import fs from 'node:fs/promises';
import path from 'node:path';
import {
  Badge,
  Box,
  Card,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import type { EfMetadata } from '@/models/election-finance';

type EfEntry = {
  name: string;
  metadata: EfMetadata;
};

async function getEfEntries(): Promise<EfEntry[]> {
  const dir = path.join(process.cwd(), 'data', 'election-finance');
  const files = await fs.readdir(dir);
  const jsonFiles = files.filter(
    (f) => f.startsWith('ef-') && f.endsWith('.json'),
  );

  const entries = await Promise.all(
    jsonFiles.map(async (file) => {
      const filePath = path.join(dir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as { metadata: EfMetadata };
      const name = file.replace(/^ef-/, '').replace(/\.json$/, '');
      return { name, metadata: data.metadata };
    }),
  );

  return entries;
}

export const metadata: Metadata = {
  title: '選挙資金 | Polimoney (ポリマネー)',
};

export default async function Page() {
  const entries = await getEfEntries();

  return (
    <Box>
      <Header />
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5} mb={5} p={2}>
        {entries.map((entry) => (
          <Link href={`/election-finance/${entry.name}`} key={entry.name}>
            <Card.Root
              flexDirection="row"
              boxShadow="xs"
              border="none"
              alignItems="center"
            >
              <Box
                minW="130px"
                h="100%"
                minH="80px"
                bg="gray.100"
                borderTopLeftRadius="md"
                borderBottomLeftRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="3xl">🗳</Text>
              </Box>
              <Box>
                <Card.Body>
                  <Stack gap={0}>
                    <Text fontSize="xs">{entry.metadata.title}</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {entry.metadata.name}
                    </Text>
                    <HStack mt={1}>
                      <Badge variant="outline">{entry.metadata.date}</Badge>
                    </HStack>
                  </Stack>
                </Card.Body>
              </Box>
            </Card.Root>
          </Link>
        ))}
      </SimpleGrid>
      <Notice />
      <Footer />
    </Box>
  );
}
