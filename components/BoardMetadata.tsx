import { Group, SimpleGrid, Text } from '@mantine/core';
import { BoardContainer } from '@/components/BoardContainer';
import type { Report } from '@/models/type';

type Props = {
  report: Report;
};

function MetadataItem({ label, value }: { label: string; value?: string }) {
  return (
    <Group gap="xs" wrap="nowrap" align="flex-start">
      <Text size="xs" c="dimmed" w={130} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="xs" fw={700} style={{ whiteSpace: 'pre-wrap' }}>
        {value}
      </Text>
    </Group>
  );
}

export function BoardMetadata({ report }: Props) {
  const items: [string, string | undefined][] = [
    ['データ引用元', `${report.year}年収支報告書`],
    ['政治団体の区分', report.orgType],
    ['政治団体の名称', report.orgName],
    ['活動区域の区分', report.activityArea],
    ['代表者', report.representative],
    ['資金管理団体の指定', report.fundManagementOrg],
    ['会計責任者', report.accountingManager],
    ['最終更新日', report.lastUpdate],
    ['事務担当者', report.administrativeManager],
  ];

  return (
    <BoardContainer>
      <Text size="sm" fw={700} mb="sm">
        本収支報告に関する情報開示
      </Text>
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xs">
        {items.map(([label, value]) => (
          <MetadataItem key={label} label={label} value={value} />
        ))}
      </SimpleGrid>
    </BoardContainer>
  );
}
