'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { Box, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { BarDatum } from '@nivo/bar';
import { ResponsiveBar } from '@nivo/bar';
import { BoardContainer } from '@/components/BoardContainer';
import { TransactionSection } from '@/components/election-finance/TransactionSection';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import type { EfData } from '@/models/election-finance';
import { getCategoryJpName } from '@/utils/election-finance';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  });
}

export function ElectionFinanceClient({ data }: { data: EfData }) {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) return null;

  // メタデータ、ソート済みトランザクションの取得
  const metadata = data.metadata;
  const transactions = [...data.transactions].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // 収入データ
  const incomeTransactions = transactions
    .filter((t) => t.category === 'income')
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  // 支出データ
  const expenseTransactions = transactions
    .filter((t) => t.category !== 'income')
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  // 支出データ（公費のみ）
  const expensePublicTransactions = transactions
    .filter((t) => t.category !== 'income')
    .filter((t) => t.public_expense_amount)
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  // 収入総計
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.price, 0);

  // 支出総計
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.price, 0);

  // 支出合計（公費のみ）
  const totalExpensePublic = expensePublicTransactions.reduce(
    (acc, t) => acc + (t.public_expense_amount || 0),
    0,
  );

  // 繰越
  const carryover = totalIncome + totalExpensePublic - totalExpense;

  // 積み上げグラフ色設定
  const barColorByKey: Record<string, string> = {
    収入: 'var(--chakra-colors-blue-400)',
    公費: 'var(--chakra-colors-purple-400)',
    支出: 'var(--chakra-colors-red-400)',
    繰越額: 'var(--chakra-colors-green-400)',
  };

  // 積み上げグラフデータ
  const barData: BarDatum[] = [
    {
      category: '支出',
      支出: totalExpense,
      繰越: carryover,
    },
    {
      category: '収入',
      // グラフ表現は、支出に対して収入・公費がそれぞれどの程度充てられたかを表す
      収入: totalIncome, // 寄付などの収入で賄った額
      公費: totalExpensePublic, // 公費で賄った額
    },
  ];

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
                keys={['公費', '収入', '支出', '繰越']}
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
                    {formatCurrency(totalExpensePublic)}
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
                  <Text fontSize="xl" fontWeight="bold" color="green.500">
                    {formatCurrency(carryover)}
                  </Text>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </BoardContainer>

        {/* 支出セクション */}
        <TransactionSection
          title="支出目的で見る"
          transactions={expenseTransactions}
          badgeColorPalette="red"
        />

        {/* 収入セクション */}
        <TransactionSection
          title="収入で見る"
          transactions={incomeTransactions}
          badgeColorPalette="green"
          showType={true}
        />

        {/* 公費セクション */}
        <TransactionSection
          title="公費で見る"
          transactions={expenseTransactions}
          badgeColorPalette="blue"
          usePublicExpenseAmount={true}
        />
      </VStack>

      <Notice />
      <Footer />
    </Box>
  );
}
