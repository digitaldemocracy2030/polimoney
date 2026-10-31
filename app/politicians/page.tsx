import { SimpleGrid, Title } from '@mantine/core';
import type { Metadata } from 'next';
import { PageLayout } from '@/components/PageLayout';
import { PoliticianCard } from '@/components/PoliticianCard';
import { comingSoonId, politicianMaster } from '@/data/politician-master';

export const metadata: Metadata = {
  title: '政治家一覧 | Polimoney (ポリマネー)',
};

export default function Page() {
  const entries = politicianMaster.filter(
    (e) => !e.id.startsWith(comingSoonId),
  );

  return (
    <PageLayout>
      <Title order={2} mb="md">
        政治家一覧
      </Title>
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
        {entries.map((entry) => (
          <PoliticianCard key={entry.id} entry={entry} />
        ))}
      </SimpleGrid>
    </PageLayout>
  );
}
