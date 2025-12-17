'use client';

import { Box, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { BarDatum } from '@nivo/bar';
import { ResponsiveBar } from '@nivo/bar';
import { BoardContainer } from '@/components/BoardContainer';
import { TransactionSection } from '@/components/election-finance/TransactionSection';
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

  const incomeChartData = Object.entries(incomeByType).map(([type, total]) => ({
    id: type,
    label: type,
    value: total,
  }));

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

  const incomeTransactions = sortedTransactions.filter(
    (t) => categorizeTransactionType(t.type) === 'income',
  );
  const expenseTransactions = sortedTransactions.filter(
    (t) =>
      categorizeTransactionType(t.type) === 'expense' &&
      !('public_expense_amount' in t && t.public_expense_amount),
  );
  const publicExpenseTransactions = sortedTransactions.filter(
    (t) => 'public_expense_amount' in t && t.public_expense_amount,
  );

  const totalPublicExpense = publicExpenseTransactions.reduce(
    (acc, t) => acc + (t.public_expense_amount || 0),
    0,
  );

  const publicExpenseByType = publicExpenseTransactions.reduce(
    (acc, t) => {
      const key = t.category;
      if (!acc[key]) acc[key] = 0;
      acc[key] += t.public_expense_amount || 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  const publicExpenseChartData = Object.entries(publicExpenseByType).map(
    ([type, total]) => ({
      id: type,
      label: type,
      value: total,
    }),
  );

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
                  公費
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {formatCurrency(totalPublicExpense)}
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

        {/* 収入セクション */}
        <TransactionSection
          title="収入"
          chartData={incomeChartData}
          summaryData={incomeByType}
          transactions={incomeTransactions}
          colorScheme="greens"
          badgeColorPalette="green"
          showType={true}
        />

        {/* 支出セクション */}
        <TransactionSection
          title="支出"
          chartData={expenseChartData}
          summaryData={Object.fromEntries(
            summary
              .filter((s) => s.type === 'expense')
              .map((s) => [s.category, s.total]),
          )}
          transactions={expenseTransactions}
          colorScheme="nivo"
          badgeColorPalette="red"
        />

        {/* 公費セクション */}
        <TransactionSection
          title="公費"
          chartData={publicExpenseChartData}
          summaryData={publicExpenseByType}
          transactions={publicExpenseTransactions}
          colorScheme="blues"
          badgeColorPalette="blue"
          usePublicExpenseAmount={true}
        />
      </VStack>

      <Notice />
      <Footer />
    </Box>
  );
}
