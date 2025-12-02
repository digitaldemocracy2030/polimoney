'use client';

import {
  Badge,
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { BarDatum } from '@nivo/bar';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { BoardContainer } from '@/components/BoardContainer';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import jsonData from '@/data/election-finance/ef-nakamura.json';
import type {
  EfData,
  EfSummary,
  EfTransactions,
} from '@/models/election-finance';
import {
  categorizeTransactionType,
  getCategoryJpName,
} from '@/utils/election-finance';

function calculateSummary(transactions: EfTransactions) {
  const summary: Record<string, EfSummary> = {};

  transactions.forEach((transaction) => {
    const category = transaction.category;
    const type = transaction.type;

    if (!summary[category]) {
      summary[category] = {
        category: getCategoryJpName(transaction.category),
        total: 0,
        count: 0,
        type: categorizeTransactionType(type),
      };
    }
    summary[category].total += transaction.price;
    summary[category].count += 1;
  });

  return Object.values(summary);
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  });
}

export default function ElectionFinancePage() {
  const data = jsonData as EfData;
  const metadata = data.metadata;
  const transactions = data.transactions;
  const summary = calculateSummary(transactions);

  const totalIncome = summary
    .filter((s) => s.type === 'income')
    .reduce((acc, s) => acc + s.total, 0);

  const totalExpense = summary
    .filter((s) => s.type === 'expense')
    .reduce((acc, s) => acc + s.total, 0);

  const carryover = Math.max(0, totalIncome - totalExpense);

  const barData: BarDatum[] = [
    {
      category: '支出',
      繰越額: 200000,
      支出: 800000,
    },
    {
      category: '収入',
      収入: 1000000,
    },
    // {
    //   category: '収支',
    //   収入: totalIncome,
    //   繰越額: carryover,
    // },
    // {
    //   category: '支出',
    //   支出: totalExpense,
    // },
  ];

  const incomeByType = transactions
    .filter((t) => categorizeTransactionType(t.type) === 'income')
    .reduce(
      (acc, t) => {
        const key = t.type;
        if (!acc[key]) acc[key] = 0;
        acc[key] += t.price;
        return acc;
      },
      {} as Record<string, number>,
    );

  const expenseChartData = summary
    .filter((s) => s.type === 'expense')
    .map((s) => ({
      id: s.category,
      label: s.category,
      value: s.total,
    }));

  const sortedTransactions = [...transactions]
    .map((transaction) => ({
      ...transaction,
      category: getCategoryJpName(transaction.category),
    }))
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <Box>
      <Header />

      <VStack gap={6} align="stretch">
        {/* ヘッダーセクション */}
        <BoardContainer>
          <Heading as="h1" size="2xl" mb={4}>
            選挙運動費用収支報告
          </Heading>
          <Stack gap={2} mb={4}>
            <HStack align="start" gap={2}>
              <Text fontWeight="bold" color="gray.700" minW="80px">
                対象
              </Text>
              <Text color="gray.900">{metadata.title}</Text>
            </HStack>
            <HStack align="start" gap={2}>
              <Text fontWeight="bold" color="gray.700" minW="80px">
                執行
              </Text>
              <Text color="gray.900">{metadata.date}</Text>
            </HStack>
            <HStack align="start" gap={2}>
              <Text fontWeight="bold" color="gray.700" minW="80px">
                候補者
              </Text>
              <Text color="gray.900">{metadata.name}</Text>
            </HStack>
          </Stack>
          <HStack gap={6} align="start">
            <Box flex={1} h="300px">
              <ResponsiveBar
                data={barData}
                keys={['収入', '繰越額', '支出']}
                indexBy="category"
                padding={0}
                groupMode="stacked"
                borderColor={{
                  from: 'color',
                  modifiers: [['darker', 1.6]],
                }}
                axisBottom={null}
                axisLeft={null}
                labelSkipWidth={1}
                labelSkipHeight={1}
                label={(d) => String(d.id)}
              />
            </Box>
            <VStack gap={4} minW="200px">
              <Stack gap={1}>
                <Text fontSize="sm" color="gray.600">
                  収入
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {formatCurrency(totalIncome)}
                </Text>
              </Stack>
              <Stack gap={1}>
                <Text fontSize="sm" color="gray.600">
                  支出
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.600">
                  {formatCurrency(totalExpense)}
                </Text>
              </Stack>
              <Stack gap={1}>
                <Text fontSize="sm" color="gray.600">
                  繰越
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {formatCurrency(carryover)}
                </Text>
              </Stack>
            </VStack>
          </HStack>
        </BoardContainer>

        {/* サマリーセクション */}
        <BoardContainer>
          <Heading as="h2" size="lg" mb={6}>
            カテゴリー別集計
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            {/* 収入 */}
            <Box>
              <Heading as="h3" size="md" mb={4}>
                収入
              </Heading>
              <Stack gap={2}>
                {Object.entries(incomeByType).map(([type, total]) => (
                  <HStack key={type} justify="space-between">
                    <Text>{type}</Text>
                    <Badge variant="outline" colorPalette="green">
                      {formatCurrency(total)}
                    </Badge>
                  </HStack>
                ))}
              </Stack>
            </Box>

            {/* 支出 */}
            <Box>
              <Heading as="h3" size="md" mb={4}>
                支出（カテゴリー別）
              </Heading>
              <Stack gap={2}>
                {summary
                  .filter((s) => s.type === 'expense')
                  .sort((a, b) => b.total - a.total)
                  .map((s) => (
                    <HStack key={s.category} justify="space-between">
                      <Text>{s.category}</Text>
                      <Badge variant="outline" colorPalette="red">
                        {formatCurrency(s.total)}
                      </Badge>
                    </HStack>
                  ))}
              </Stack>
            </Box>
          </SimpleGrid>
        </BoardContainer>

        {/* グラフ */}
        <BoardContainer>
          <Heading as="h2" size="lg" mb={6}>
            支出内訳
          </Heading>
          <Box h="400px">
            <ResponsivePie
              data={expenseChartData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              sortByValue
              colors={{ scheme: 'nivo' }}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.6]],
              }}
              arcLabelsSkipAngle={10}
              arcLinkLabelsSkipAngle={10}
              activeOuterRadiusOffset={10}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  symbolSize: 18,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000',
                      },
                    },
                  ],
                },
              ]}
              tooltip={({ datum: { id, value } }) => (
                <Box bg="white" p={2} borderRadius="md" boxShadow="md">
                  <Text fontSize="sm" fontWeight="bold">
                    {id}
                  </Text>
                  <Text fontSize="sm">{formatCurrency(value)}</Text>
                </Box>
              )}
            />
          </Box>
        </BoardContainer>

        {/* 詳細テーブル */}
        <BoardContainer>
          <Heading as="h2" size="lg" mb={6}>
            支出詳細一覧
          </Heading>
          <Box overflowX="auto">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>日付</Table.ColumnHeader>
                  <Table.ColumnHeader>カテゴリー</Table.ColumnHeader>
                  <Table.ColumnHeader>目的</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">
                    金額
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>備考</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedTransactions.map((transaction) => (
                  <Table.Row key={transaction.data_id}>
                    <Table.Cell>{transaction.date || '-'}</Table.Cell>
                    <Table.Cell>
                      <Badge size="sm">{transaction.category}</Badge>
                    </Table.Cell>
                    <Table.Cell>{transaction.purpose || '-'}</Table.Cell>
                    <Table.Cell textAlign="right" fontWeight="bold">
                      {formatCurrency(transaction.price)}
                    </Table.Cell>
                    <Table.Cell fontSize="xs">
                      {transaction.note || '-'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </BoardContainer>
      </VStack>

      <Notice />
      <Footer />
    </Box>
  );
}
