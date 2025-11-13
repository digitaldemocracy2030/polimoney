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
import { ResponsivePie } from '@nivo/pie';
import { BoardContainer } from '@/components/BoardContainer';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import data from '@/data/election-finance/ef-nakamura.json';
import type { ElectionFinanceData } from '@/models/election-finance';

type CategorySummary = {
  category: string;
  total: number;
  count: number;
  type: 'income' | 'expense';
};

function categorizeTransactionType(category: string): 'income' | 'expense' {
  const incomeCategories = ['その他の収入', '寄附'];
  return incomeCategories.includes(category) ? 'income' : 'expense';
}

function calculateSummary(transactions: ElectionFinanceData) {
  const summary: Record<string, CategorySummary> = {};

  transactions.forEach((transaction) => {
    const category = transaction.category;
    if (!summary[category]) {
      summary[category] = {
        category,
        total: 0,
        count: 0,
        type: categorizeTransactionType(category),
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
  const typedData = data as ElectionFinanceData;
  const summary = calculateSummary(typedData);

  const totalIncome = summary
    .filter((s) => s.type === 'income')
    .reduce((acc, s) => acc + s.total, 0);

  const totalExpense = summary
    .filter((s) => s.type === 'expense')
    .reduce((acc, s) => acc + s.total, 0);

  const expenseByCategoryForChart = summary
    .filter((s) => s.type === 'expense')
    .map((s) => ({
      id: s.category,
      label: s.category,
      value: s.total,
    }));

  const sortedTransactions = [...typedData].sort((a, b) => {
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
          <Heading as="h1" size="2xl" mb={6}>
            選挙運動費用収支報告
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Stack gap={1}>
              <Text fontSize="sm" color="gray.600">
                総収入
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {formatCurrency(totalIncome)}
              </Text>
            </Stack>
            <Stack gap={1}>
              <Text fontSize="sm" color="gray.600">
                総支出
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                {formatCurrency(totalExpense)}
              </Text>
            </Stack>
            <Stack gap={1}>
              <Text fontSize="sm" color="gray.600">
                収支
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={
                  totalIncome - totalExpense >= 0 ? 'green.600' : 'red.600'
                }
              >
                {formatCurrency(totalIncome - totalExpense)}
              </Text>
            </Stack>
          </SimpleGrid>
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
                {summary
                  .filter((s) => s.type === 'income')
                  .map((s) => (
                    <HStack key={s.category} justify="space-between">
                      <Text>{s.category}</Text>
                      <Badge variant="outline" colorPalette="green">
                        {formatCurrency(s.total)}
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
            支出内訳（円グラフ）
          </Heading>
          <Box h="400px">
            <ResponsivePie
              data={expenseByCategoryForChart}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={{ scheme: 'nivo' }}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.6]],
              }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: 'color',
                modifiers: [['darker', 2]],
              }}
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
                  <Table.Row
                    key={`${transaction.date}-${transaction.category}-${transaction.price}`}
                  >
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
