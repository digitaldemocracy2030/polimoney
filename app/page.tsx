import { Box, Card, SimpleGrid, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';

export const metadata = {
  title: 'Polimoney - 政治資金の透明性を高める',
  description:
    'Polimoneyは、デジタル民主主義2030プロジェクトの一環として、政治資金の透明性を高めるために開発されたオープンソースのプロジェクトです。',
};

const categories = [
  {
    href: '/politicians',
    title: '政治家詳細',
    description: '政治家ごとの政治資金収支報告書を確認する',
  },
  {
    href: '/election-finance',
    title: '選挙資金',
    description: '選挙ごとの候補者選挙運動費用収支報告書を確認する',
  },
];

export default function Page() {
  return (
    <Box>
      <Header />
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} p={4} minH="60vh">
        {categories.map((cat) => (
          <Link href={cat.href} key={cat.href} style={{ display: 'block' }}>
            <Card.Root
              h="100%"
              minH="240px"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ boxShadow: 'md', borderColor: 'gray.400' }}
              transition="all 0.15s"
              cursor="pointer"
              justifyContent="center"
              alignItems="center"
              textAlign="center"
            >
              <Card.Body
                display="flex"
                flexDirection="column"
                gap={3}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize="2xl" fontWeight="bold">
                  {cat.title}
                </Text>
                <Text fontSize="sm" color="gray.600" maxW="300px">
                  {cat.description}
                </Text>
              </Card.Body>
            </Card.Root>
          </Link>
        ))}
      </SimpleGrid>
      <Notice />
      <Footer />
    </Box>
  );
}
