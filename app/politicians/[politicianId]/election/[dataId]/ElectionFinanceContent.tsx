'use client';

import {
  Avatar,
  Badge,
  Box,
  Heading,
  HStack,
  NativeSelect,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { BarDatum } from '@nivo/bar';
import { ResponsiveBar } from '@nivo/bar';
import { BoardContainer } from '@/components/BoardContainer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import type { EfData } from '@/models/election-finance';
import type { ProfileList } from '@/models/type';
import { getCategoryJpName } from '@/utils/election-finance';
import { TransactionSection } from './TransactionSection';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  });
}

export function ElectionFinanceContent({
  data,
  politicianId,
  profile,
  allElectionData,
  currentDataId,
}: {
  data: EfData;
  politicianId: string;
  profile: ProfileList;
  allElectionData?: Array<{ dataId: string; data: EfData }>;
  currentDataId?: string;
}) {
  const metadata = data.metadata;
  const transactions = [...data.transactions].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const incomeTransactions = transactions
    .filter((t) => t.category === 'income')
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  const expenseTransactions = transactions
    .filter((t) => t.category !== 'income')
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  const expensePublicTransactions = transactions
    .filter((t) => t.category !== 'income')
    .filter((t) => t.public_expense_amount)
    .map((t) => ({ ...t, category: getCategoryJpName(t.category) }));

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.price, 0);
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.price, 0);
  const totalExpensePublic = expensePublicTransactions.reduce(
    (acc, t) => acc + (t.public_expense_amount || 0),
    0,
  );
  const carryover = totalIncome + totalExpensePublic - totalExpense;

  const barColorByKey: Record<string, string> = {
    収入: 'var(--chakra-colors-blue-400)',
    公費: 'var(--chakra-colors-purple-400)',
    支出: 'var(--chakra-colors-red-400)',
    繰越額: 'var(--chakra-colors-green-400)',
  };

  const barData: BarDatum[] = [
    { category: '支出', 支出: totalExpense, 繰越: carryover },
    { category: '収入', 収入: totalIncome, 公費: totalExpensePublic },
  ];

  return (
    <Box>
      <Header profileName={profile.name} />
      <Breadcrumb
        items={[
          { label: profile.name, href: `/politicians/${politicianId}` },
          { label: '選挙運動費用収支報告' },
        ]}
      />

      <VStack gap={6} align="stretch">
        <BoardContainer>
          <Box mb={10}>
            <Stack
              direction={{ base: 'column', lg: 'row' }}
              alignItems="center"
              justify="space-between"
              gap={5}
            >
              <HStack gap={5} minW="250px">
                <Avatar.Root w="80px" h="80px">
                  <Avatar.Fallback name={profile.name} />
                  <Avatar.Image src={profile.image} />
                </Avatar.Root>
                <Stack gap={0}>
                  <Text>{profile.title}</Text>
                  <Text fontWeight="bold" fontSize="2xl">
                    {profile.name}
                  </Text>
                  <HStack mt={1}>
                    {profile.party && (
                      <Badge variant="outline" colorPalette="red">
                        {profile.party}
                      </Badge>
                    )}
                    {profile.district && (
                      <Badge variant="outline">{profile.district}</Badge>
                    )}
                  </HStack>
                </Stack>
              </HStack>
              {allElectionData && currentDataId && (
                <NativeSelect.Root w="300px">
                  <NativeSelect.Field
                    value={currentDataId}
                    onChange={(e) => {
                      const selectedDataId = e.target.value;
                      window.location.href = `/politicians/${politicianId}/election/${selectedDataId}`;
                    }}
                  >
                    {allElectionData.map(({ dataId, data: efData }) => (
                      <option key={dataId} value={dataId}>
                        {efData.metadata.title}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              )}
            </Stack>
          </Box>

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
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
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

        <TransactionSection
          title="支出目的で見る"
          transactions={expenseTransactions}
          badgeColorPalette="red"
        />

        <TransactionSection
          title="収入で見る"
          transactions={incomeTransactions}
          badgeColorPalette="green"
          showType={true}
        />

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
