'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  Modal,
  Pagination,
  Progress,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { BanknoteArrowDownIcon, BanknoteArrowUpIcon, Info } from 'lucide-react';
import { useState } from 'react';
import { BoardContainer } from '@/components/BoardContainer';
import type { Transaction } from '@/models/type';

type Props = {
  direction: 'income' | 'expense';
  total: number;
  transactions: Transaction[];
  showPurpose: boolean;
  showDate: boolean;
};

export function BoardTransactions({
  direction,
  total,
  transactions,
  showPurpose,
  showDate,
}: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedTooltip, setSelectedTooltip] = useState<string | null>(null);

  const sorted = [...transactions].sort((a, b) => b.amount - a.amount);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  const progressColor = direction === 'income' ? 'cyan' : 'pink';

  const renderTooltipIcon = (item: Transaction) => {
    if (!item.tooltip) return null;
    return (
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={() => setSelectedTooltip(item.tooltip ?? null)}
        aria-label="詳細説明"
      >
        <Info size={14} />
      </ActionIcon>
    );
  };

  const renderProgress = (amount: number) => (
    <Group gap="xs" wrap="nowrap">
      <Progress
        value={(amount / total) * 100}
        size="xs"
        color={progressColor}
        flex={1}
      />
      <Text size="xs" w={44} ta="end">
        {((amount / total) * 100).toFixed(1)}%
      </Text>
    </Group>
  );

  const categoryBadge = (item: Transaction) => (
    <Badge variant="light" color="gray">
      {item.category}
      {item.subCategory && <span>：{item.subCategory}</span>}
    </Badge>
  );

  return (
    <BoardContainer id={direction}>
      <Group gap="xs" mb={4}>
        {direction === 'income' ? (
          <BanknoteArrowUpIcon size={24} color="var(--mantine-color-cyan-7)" />
        ) : (
          <BanknoteArrowDownIcon
            size={24}
            color="var(--mantine-color-pink-7)"
          />
        )}
        <Title order={2} size="h4">
          {direction === 'income' ? '収入' : '支出'}の一覧
        </Title>
      </Group>
      <Text size="sm" c="dimmed" mb="md">
        {direction === 'income'
          ? 'どうやって政治資金を得ているか'
          : '政治資金を何に使っているか'}
      </Text>

      {/* 一覧 (smartphone) */}
      <Stack gap={0} hiddenFrom="lg" mb="md">
        {paginated.map((item) => (
          <Box key={item.id} py="sm">
            <Divider mb="sm" />
            <Group gap="xs" mb={4}>
              {categoryBadge(item)}
              <Text size="xs" c="dimmed">
                {item.date}
              </Text>
            </Group>
            {direction === 'expense' && showPurpose && (
              <Text size="xs" fw={700}>
                {item.purpose}
              </Text>
            )}
            <Group justify="space-between" mb={4}>
              <Group gap={4}>
                <Text fw={700}>{item.name}</Text>
                {renderTooltipIcon(item)}
              </Group>
              <Text fw={700}>{item.amount.toLocaleString()}</Text>
            </Group>
            {renderProgress(item.amount)}
          </Box>
        ))}
      </Stack>

      {/* 一覧 (laptop) */}
      <Box visibleFrom="lg" mb="md">
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {direction === 'expense' && showPurpose && (
                <Table.Th>目的</Table.Th>
              )}
              <Table.Th>
                {direction === 'income' ? '収入元' : '支出先'}
              </Table.Th>
              <Table.Th>カテゴリー</Table.Th>
              <Table.Th ta="end">金額</Table.Th>
              <Table.Th miw={150}>割合</Table.Th>
              {showDate && <Table.Th>日付</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginated.map((item) => (
              <Table.Tr key={item.id}>
                {direction === 'expense' && showPurpose && (
                  <Table.Td fw={700}>{item.purpose}</Table.Td>
                )}
                <Table.Td fw={700}>
                  <Group gap={4} wrap="nowrap">
                    <Text size="sm" fw={700}>
                      {item.name}
                    </Text>
                    {renderTooltipIcon(item)}
                  </Group>
                </Table.Td>
                <Table.Td>{categoryBadge(item)}</Table.Td>
                <Table.Td fw={700} ta="end">
                  {item.amount.toLocaleString()}
                </Table.Td>
                <Table.Td>{renderProgress(item.amount)}</Table.Td>
                {showDate && <Table.Td>{item.date}</Table.Td>}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      <Group justify="center">
        <Pagination
          total={Math.ceil(transactions.length / pageSize)}
          value={page}
          onChange={setPage}
        />
      </Group>

      <Modal
        opened={selectedTooltip !== null}
        onClose={() => setSelectedTooltip(null)}
        title="詳細説明"
      >
        <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
          {selectedTooltip}
        </Text>
      </Modal>
    </BoardContainer>
  );
}
