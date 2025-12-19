'use client';

import { Box, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { BarDatum } from '@nivo/bar';
import { ResponsiveBar } from '@nivo/bar';
import { BoardContainer } from '@/components/BoardContainer';
import type { ChartData } from '@/components/election-finance/TransactionSection';
import { TransactionSection } from '@/components/election-finance/TransactionSection';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
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

function calculateIncomeByType(transactions: EfTransactions) {
  return transactions
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
}

function calculateExpenseChartData(summary: EfSummary[]) {
  return summary
    .filter((s) => s.type === 'expense')
    .map((s) => ({
      id: s.category,
      label: s.category,
      value: s.total,
    }));
}

function calculatePublicExpenseByType(
  transactions: Array<{ category: string; public_expense_amount?: number }>,
) {
  return transactions
    .filter((t) => 'public_expense_amount' in t && t.public_expense_amount)
    .reduce(
      (acc, t) => {
        const key = t.category;
        if (!acc[key]) acc[key] = 0;
        acc[key] += t.public_expense_amount || 0;
        return acc;
      },
      {} as Record<string, number>,
    );
}

interface ElectionFinanceClientProps {
  data: EfData;
}

export function ElectionFinanceClient({ data }: ElectionFinanceClientProps) {
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

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const incomeTransactions = sortedTransactions
    .filter((t) => categorizeTransactionType(t.type) === 'income')
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  const expenseTransactions = sortedTransactions
    .filter(
      (t) =>
        categorizeTransactionType(t.type) === 'expense' &&
        !('public_expense_amount' in t && t.public_expense_amount),
    )
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  const publicExpenseTransactions = sortedTransactions
    .filter((t) => 'public_expense_amount' in t && t.public_expense_amount)
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  const totalPublicExpense = publicExpenseTransactions.reduce(
    (acc, t) => acc + (t.public_expense_amount || 0),
    0,
  );

  const incomePublic = Math.min(totalIncome, totalPublicExpense);
  const incomePrivate = Math.max(0, totalIncome - incomePublic);

  const barData: BarDatum[] = [
    {
      category: '支出',
      支出: totalExpense,
      繰越額: carryover,
    },
    {
      category: '収入',
      公費: incomePublic,
      収入: incomePrivate,
    },
  ];

  const barColorByKey: Record<string, string> = {
    収入: 'var(--chakra-colors-blue-400)',
    公費: 'var(--chakra-colors-purple-400)',
    支出: 'var(--chakra-colors-red-400)',
    繰越額: 'var(--chakra-colors-green-400)',
  };

  const incomeByType = calculateIncomeByType(transactions);
  const incomeChartData = Object.entries(incomeByType).map(([type, total]) => ({
    id: type,
    label: type,
    value: total,
  }));

  const expenseChartData = calculateExpenseChartData(summary);

  const publicExpenseByType = calculatePublicExpenseByType(
    publicExpenseTransactions,
  );

  const publicExpenseChartData: ChartData[] = Object.entries(
    publicExpenseByType,
  ).map(([type, total]) => ({
    id: type,
    label: type,
    value: total as number,
  }));

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
          <Stack
            gap={6}
            align={{ base: 'stretch', md: 'start' }}
            direction={{ base: 'column', md: 'row' }}
            w="full"
          >
            <Box h={{ base: '200px', md: '200px' }} w="full">
              <ResponsiveBar
                data={barData}
                keys={['公費', '収入', '支出', '繰越額']}
                indexBy="category"
                padding={0}
                groupMode="stacked"
                colors={({ id }) =>
                  barColorByKey[String(id)] ?? 'var(--chakra-colors-gray-400)'
                }
                borderColor={{
                  from: 'color',
                  modifiers: [['darker', 1.6]],
                }}
                enableGridY={false}
                axisBottom={null}
                axisLeft={null}
                labelSkipWidth={1}
                labelSkipHeight={1}
                label={(d) => String(d.id)}
              />
            </Box>
            <Box
              minW={{ base: 'full', md: '200px' }}
              w={{ base: 'full', md: 'auto' }}
            >
              <Box
                display={{ base: 'grid', md: 'flex' }}
                gridTemplateColumns={{ base: '1fr 1fr', md: undefined }}
                gap={4}
                flexDirection={{ md: 'column' }}
                alignItems={{ md: 'flex-start' }}
              >
                <Stack gap={0}>
                  <Text fontSize="sm">収入</Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.500">
                    {formatCurrency(totalIncome)}
                  </Text>
                </Stack>
                <Stack gap={0}>
                  <Text fontSize="sm">公費</Text>
                  <Text fontSize="xl" fontWeight="bold" color="purple.500">
                    {formatCurrency(totalPublicExpense)}
                  </Text>
                </Stack>
                <Stack gap={0}>
                  <Text fontSize="sm">支出</Text>
                  <Text fontSize="xl" fontWeight="bold" color="red.500">
                    {formatCurrency(totalExpense)}
                  </Text>
                </Stack>
                <Stack gap={0}>
                  <Text fontSize="sm">繰越</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {formatCurrency(carryover)}
                  </Text>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </BoardContainer>

        {/* 収入セクション */}
        <TransactionSection
          title="収入"
          chartData={incomeChartData}
          transactions={incomeTransactions}
          badgeColorPalette="green"
          showType={true}
        />

        {/* 支出セクション */}
        <TransactionSection
          title="支出"
          chartData={expenseChartData}
          transactions={expenseTransactions}
          badgeColorPalette="red"
        />

        {/* 公費セクション */}
        <TransactionSection
          title="公費"
          chartData={publicExpenseChartData}
          transactions={publicExpenseTransactions}
          badgeColorPalette="blue"
          usePublicExpenseAmount={true}
        />
      </VStack>

      <Notice />
      <Footer />
    </Box>
  );
}
