'use client';

import {
  Accordion,
  Badge,
  Box,
  ColorSwatch,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ResponsivePie } from '@nivo/pie';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BoardContainer } from '@/components/BoardContainer';
import { formatCurrency } from '@/utils/format';
import { colorSchemeDefault } from '@/utils/nivoColorScheme';

type Transaction = {
  data_id: string;
  date?: string | null;
  category: string;
  purpose?: string;
  price: number;
  note?: string;
  type?: string;
  public_expense_amount?: number;
};

export type ChartData = {
  id: string;
  label: string;
  value: number;
};

interface TransactionSectionProps {
  id?: string;
  title: string;
  transactions: Transaction[];
  badgeColor: 'green' | 'red' | 'blue';
  showType?: boolean;
  usePublicExpenseAmount?: boolean;
}

function ScrollShadowBox({
  children,
  watch,
}: {
  children: ReactNode;
  watch?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasTopShadow, setHasTopShadow] = useState(false);
  const [hasBottomShadow, setHasBottomShadow] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight - clientHeight > 1;
    setHasTopShadow(canScroll && scrollTop > 0);
    setHasBottomShadow(
      canScroll && scrollTop + clientHeight < scrollHeight - 1,
    );
  }, []);

  useEffect(() => {
    // watch の変化でスクロール状態を再計算する
    void watch;
    update();
    const el = ref.current;
    if (!el) return;

    const onScroll = () => update();
    el.addEventListener('scroll', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
    };
  }, [update, watch]);

  const shadowColor = 'rgba(0, 0, 0, 0.25)';
  const boxShadow = [
    hasTopShadow ? `inset 0 10px 10px -10px ${shadowColor}` : '',
    hasBottomShadow ? `inset 0 -10px 10px -10px ${shadowColor}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Paper
      ref={ref}
      p="xs"
      style={{
        boxShadow,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      {children}
    </Paper>
  );
}

export function TransactionSection({
  id,
  title,
  transactions,
  badgeColor,
  showType = false,
  usePublicExpenseAmount = false,
}: TransactionSectionProps) {
  const { chartItems, groupedTransactions } = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    let items: ChartData[] = [];

    if (usePublicExpenseAmount) {
      let publicTotal = 0;
      let privateTotal = 0;

      transactions.forEach((t) => {
        const publicAmount = t.public_expense_amount || 0;
        const privateAmount = Math.max(0, t.price - publicAmount);

        if (publicAmount > 0) {
          if (!grouped.公費) grouped.公費 = [];
          grouped.公費.push(t);
          publicTotal += publicAmount;
        }
        if (privateAmount > 0 || (!publicAmount && t.price > 0)) {
          if (!grouped.自費) grouped.自費 = [];
          grouped.自費.push(t);
          privateTotal += privateAmount;
        }
      });

      items = [
        { id: '公費', label: '公費', value: publicTotal },
        { id: '自費', label: '自費', value: privateTotal },
      ];
    } else {
      const getKey = showType
        ? (t: Transaction) => t.type || t.category
        : (t: Transaction) => t.category;

      transactions.forEach((t) => {
        const key = getKey(t);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
      });

      items = Object.entries(grouped).map(([key, list]) => ({
        id: key,
        label: key,
        value: list.reduce((sum, t) => sum + t.price, 0),
      }));
    }

    items.sort((a, b) => b.value - a.value);

    return { chartItems: items, groupedTransactions: grouped };
  }, [transactions, usePublicExpenseAmount, showType]);

  const colorMap = useMemo(
    () =>
      chartItems.reduce<Record<string, string>>((acc, item, idx) => {
        acc[item.id] = colorSchemeDefault[idx % colorSchemeDefault.length];
        return acc;
      }, {}),
    [chartItems],
  );

  const totalAmount = useMemo(
    () => chartItems.reduce((sum, item) => sum + item.value, 0),
    [chartItems],
  );

  const isDesktop = useMediaQuery('(min-width: 62em)');
  const pieChartMargin = isDesktop
    ? { top: 40, right: 80, bottom: 80, left: 80 }
    : { top: 10, right: 10, bottom: 10, left: 10 };

  return (
    <BoardContainer id={id}>
      <Title order={2} size="h4" mb="md">
        {title}
      </Title>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
        <Box w="100%" style={{ aspectRatio: 1, overflow: 'visible' }}>
          <ResponsivePie
            data={chartItems}
            margin={pieChartMargin}
            colors={({ id }) => colorMap[String(id)] || colorSchemeDefault[0]}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 0.6]],
            }}
            innerRadius={0.5}
            arcLabel={(datum) => `¥${datum.value.toLocaleString('ja-JP')}`}
            arcLabelsTextColor="#ffffff"
            arcLabelsSkipAngle={15}
            enableArcLinkLabels={!!isDesktop}
            arcLinkLabelsSkipAngle={10}
            activeOuterRadiusOffset={10}
            layers={[
              'arcs',
              'arcLabels',
              'arcLinkLabels',
              ({ centerX, centerY }) => (
                <text
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#333"
                  style={{ fontSize: '18px', fontWeight: 'bold' }}
                >
                  ¥{totalAmount.toLocaleString('ja-JP')}
                </text>
              ),
              'legends',
            ]}
            tooltip={({ datum: { id, value } }) => (
              <Paper p="xs" shadow="md">
                <Text size="sm" fw={700}>
                  {id}
                </Text>
                <Text size="sm">{formatCurrency(value)}</Text>
              </Paper>
            )}
          />
        </Box>
        <Stack gap="xs">
          {chartItems.map((item) => (
            <Group key={item.id} justify="space-between">
              <Group gap="xs">
                <ColorSwatch color={colorMap[item.id]} size={12} />
                <Text>{item.label}</Text>
              </Group>
              <Badge variant="outline" color={badgeColor}>
                {formatCurrency(item.value)}
              </Badge>
            </Group>
          ))}
        </Stack>
      </SimpleGrid>

      <Accordion variant="contained" mt="lg">
        <Accordion.Item value="details">
          <Accordion.Control>詳しく見る</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              {chartItems.map((chartItem) => {
                const cat = chartItem.id;
                const records = groupedTransactions[cat] || [];
                const total = chartItem.value;

                return (
                  <Box key={cat}>
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <ColorSwatch color={colorMap[cat]} size={12} />
                        <Text fw={700}>
                          {title.includes('支出') ? `${cat}費` : cat}
                        </Text>
                      </Group>
                      <Text fw={700} c="dimmed">
                        {formatCurrency(total)}
                      </Text>
                    </Group>
                    <ScrollShadowBox watch={records.length}>
                      {records.map((transaction, index) => (
                        <Box
                          key={transaction.data_id}
                          p="xs"
                          style={
                            index === records.length - 1
                              ? undefined
                              : {
                                  borderBottom:
                                    '1px solid var(--mantine-color-gray-2)',
                                }
                          }
                        >
                          <Stack gap={2} align="stretch">
                            <Text size="sm" c="dimmed" visibleFrom="md">
                              {transaction.date || '-'}
                            </Text>
                            <Group
                              justify="space-between"
                              align="flex-start"
                              wrap="nowrap"
                            >
                              <Text size="sm">
                                {transaction.purpose || '-'}
                              </Text>
                              <Text size="sm" fw={700}>
                                {formatCurrency(
                                  usePublicExpenseAmount
                                    ? cat === '公費'
                                      ? transaction.public_expense_amount || 0
                                      : Math.max(
                                          0,
                                          transaction.price -
                                            (transaction.public_expense_amount ||
                                              0),
                                        )
                                    : transaction.price,
                                )}
                              </Text>
                            </Group>
                            {transaction.note && (
                              <Text size="xs" c="dimmed">
                                【備考】{transaction.note}
                              </Text>
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </ScrollShadowBox>
                  </Box>
                );
              })}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </BoardContainer>
  );
}
