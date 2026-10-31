import { SimpleGrid, Stack, Text } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { PoliticianCard } from '@/components/PoliticianCard';
import { comingSoonId, politicianMaster } from '@/data/politician-master';

export const metadata = {
  title: 'Polimoney - 政治資金の透明性を高める',
  description:
    'Polimoneyは、デジタル民主主義2030プロジェクトの一環として、政治資金の透明性を高めるために開発されたオープンソースのプロジェクトです。',
};

const TOP_COUNT = 9;

export default function Page() {
  const topPoliticians = politicianMaster
    .filter((e) => !e.id.startsWith(comingSoonId))
    .slice(0, TOP_COUNT);

  return (
    <PageLayout>
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          政治資金の流れを見える化するプラットフォームです。透明性の高い政治実現を目指して、オープンソースで開発されています。
        </Text>
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
          {topPoliticians.map((entry) => (
            <PoliticianCard key={entry.id} entry={entry} />
          ))}
        </SimpleGrid>
        {/* TODO: データが増えた場合「政治家一覧をもっと見る」ボタンと表示上限を設ける */}
        {/* TODO: 政治団体導線を再公開する際に政治団体セクション（一覧カード＋もっと見る）を復帰する */}
      </Stack>
    </PageLayout>
  );
}
