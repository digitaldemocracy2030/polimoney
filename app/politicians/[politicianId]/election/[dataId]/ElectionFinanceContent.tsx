'use client';

import {
  Box,
  Flex,
  Group,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { BarDatum } from '@nivo/bar';
import { ResponsiveBar } from '@nivo/bar';
import { BoardContainer } from '@/components/BoardContainer';
import { PageLayout } from '@/components/PageLayout';
import { ProfileHeader } from '@/components/ProfileHeader';
import type { EfData } from '@/models/election-finance';
import type { ProfileList } from '@/models/type';
import { getCategoryJpName } from '@/utils/election-finance';
import { formatCurrency } from '@/utils/format';
import { TransactionSection } from './TransactionSection';

// Mantine の blue.4 / violet.4 / red.4 / green.4 / gray.4 と同じ値
// （Nivo が色演算するため hex 直書き）
const barColorByKey: Record<string, string> = {
  収入: '#4dabf7',
  公費: '#9775fa',
  支出: '#ff8787',
  繰越額: '#69db7c',
};

function SummaryStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Stack gap={0}>
      <Text size="sm">{label}</Text>
      <Text size="xl" fw={700} c={color}>
        {formatCurrency(value)}
      </Text>
    </Stack>
  );
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

  const barData: BarDatum[] = [
    { category: '支出', 支出: totalExpense, 繰越: carryover },
    { category: '収入', 収入: totalIncome, 公費: totalExpensePublic },
  ];

  return (
    <PageLayout
      profileName={profile.name}
      breadcrumb={[
        { label: profile.name, href: `/politicians/${politicianId}` },
        { label: '選挙運動費用収支報告' },
      ]}
    >
      <BoardContainer>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="space-between"
          gap="md"
          mb="xl"
        >
          <ProfileHeader profile={profile} />
          {allElectionData && currentDataId && (
            <NativeSelect
              w={300}
              value={currentDataId}
              onChange={(e) => {
                window.location.href = `/politicians/${politicianId}/election/${e.currentTarget.value}`;
              }}
              data={allElectionData.map(({ dataId, data: efData }) => ({
                value: dataId,
                label: efData.metadata.title,
              }))}
            />
          )}
        </Flex>

        <Title order={2} size="h3" mb="md">
          選挙運動費用収支報告
        </Title>
        <Stack gap="xs" mb="md">
          <Group gap="xs" align="flex-start">
            <Text fw={700} w={80}>
              対象
            </Text>
            <Text>{metadata.title}</Text>
          </Group>
          <Group gap="xs" align="flex-start">
            <Text fw={700} w={80}>
              執行
            </Text>
            <Text>{metadata.date}</Text>
          </Group>
          <Group gap="xs" align="flex-start">
            <Text fw={700} w={80}>
              候補者
            </Text>
            <Text>{metadata.name}</Text>
          </Group>
        </Stack>

        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'flex-start' }}
          gap="lg"
        >
          <Box h={200} w="100%">
            <ResponsiveBar
              data={barData}
              keys={['公費', '収入', '支出', '繰越']}
              indexBy="category"
              padding={0}
              groupMode="stacked"
              colors={({ id }) => barColorByKey[String(id)] ?? '#ced4da'}
              borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              enableGridY={false}
              axisBottom={null}
              axisLeft={null}
              labelSkipWidth={1}
              labelSkipHeight={1}
              label={(d) => String(d.id)}
            />
          </Box>
          <SimpleGrid cols={{ base: 2, md: 1 }} miw={200}>
            <SummaryStat label="収入" value={totalIncome} color="blue.6" />
            <SummaryStat
              label="公費"
              value={totalExpensePublic}
              color="violet.6"
            />
            <SummaryStat label="支出" value={totalExpense} color="red.6" />
            <SummaryStat label="繰越" value={carryover} color="green.6" />
          </SimpleGrid>
        </Flex>
      </BoardContainer>

      <TransactionSection
        id="expense"
        title="支出目的で見る"
        transactions={expenseTransactions}
        badgeColor="red"
      />

      <TransactionSection
        id="income"
        title="収入で見る"
        transactions={incomeTransactions}
        badgeColor="green"
        showType={true}
      />

      <TransactionSection
        id="public"
        title="公費で見る"
        transactions={expenseTransactions}
        badgeColor="blue"
        usePublicExpenseAmount={true}
      />
    </PageLayout>
  );
}
