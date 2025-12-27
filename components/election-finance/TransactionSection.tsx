import {
  Accordion,
  Badge,
  Box,
  type BoxProps,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
import { ResponsivePie } from '@nivo/pie';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { BoardContainer } from '@/components/BoardContainer';
import { colorSchemeDefault } from '@/utils/nivoColorScheme';

type ScrollShadowBoxProps = BoxProps & {
  children: ReactNode;
  watch?: number;
};

function ScrollShadowBox({ children, watch, ...props }: ScrollShadowBoxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasTopShadow, setHasTopShadow] = useState(false);
  const [hasBottomShadow, setHasBottomShadow] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight - clientHeight > 1;
    setHasTopShadow(canScroll && scrollTop > 0);
    setHasBottomShadow(
      canScroll && scrollTop + clientHeight < scrollHeight - 1,
    );
  };

  useEffect(() => {
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
  }, [watch]);

  const shadowColor = 'var(--chakra-colors-blackAlpha-300)';
  const boxShadow = [
    hasTopShadow ? `inset 0 10px 10px -10px ${shadowColor}` : '',
    hasBottomShadow ? `inset 0 -10px 10px -10px ${shadowColor}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Box ref={ref} boxShadow={boxShadow} {...props}>
      {children}
    </Box>
  );
}

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
  title: string;
  transactions: Transaction[];
  badgeColorPalette: 'green' | 'red' | 'blue';
  showType?: boolean;
  usePublicExpenseAmount?: boolean;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  });
}

export function TransactionSection({
  title,
  transactions,
  badgeColorPalette,
  showType = false,
  usePublicExpenseAmount = false,
}: TransactionSectionProps) {
  // chartDataをtransactionsから生成
  const chartData = useMemo(() => {
    if (usePublicExpenseAmount) {
      // 公費と自費の計算
      const publicTotal = transactions.reduce(
        (sum, t) => sum + (t.public_expense_amount || 0),
        0,
      );
      const privateTotal = transactions.reduce(
        (sum, t) => sum + Math.max(0, t.price - (t.public_expense_amount || 0)),
        0,
      );
      return [
        { id: '公費', label: '公費', value: publicTotal },
        { id: '自費', label: '自費', value: privateTotal },
      ];
    }
    if (showType) {
      // typeごとに集計（収入の場合）
      const grouped = transactions.reduce(
        (acc, t) => {
          const key = t.type || t.category;
          acc[key] = (acc[key] || 0) + t.price;
          return acc;
        },
        {} as Record<string, number>,
      );
      return Object.entries(grouped).map(([id, value]) => ({
        id,
        label: id,
        value,
      }));
    }
    // categoryごとに集計（支出の場合）
    const grouped = transactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.price;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(grouped).map(([id, value]) => ({
      id,
      label: id,
      value,
    }));
  }, [transactions, usePublicExpenseAmount, showType]);

  // chartDataを値の大きい順でソート
  const sortedChartData = useMemo(
    () => [...chartData].sort((a, b) => b.value - a.value),
    [chartData],
  );

  // データidと色のマッピングを作成
  const colorMap = useMemo(
    () =>
      sortedChartData.reduce<Record<string, string>>((acc, item, idx) => {
        acc[item.id] = colorSchemeDefault[idx % colorSchemeDefault.length];
        return acc;
      }, {}),
    [sortedChartData],
  );

  const totalAmount = useMemo(
    () => sortedChartData.reduce((sum, item) => sum + item.value, 0),
    [sortedChartData],
  );

  const pieChartProps: Record<string, unknown> = {
    margin: useBreakpointValue({
      base: { top: 10, right: 10, bottom: 10, left: 10 },
      md: { top: 40, right: 80, bottom: 80, left: 80 },
    }),
    colors: ({ id }: { id: string }) => colorMap[id] || colorSchemeDefault[0],
    borderColor: {
      from: 'color',
      modifiers: [['darker', 0.6]],
    },
    innerRadius: 0.5,
    arcLabel: (datum: ChartData) => `¥${datum.value.toLocaleString('ja-JP')}`,
    arcLabelsTextColor: '#ffffff',
    arcLabelsSkipAngle: 15,
    enableArcLinkLabels: useBreakpointValue({ base: false, md: true }),
    arcLinkLabelsSkipAngle: 10,
    activeOuterRadiusOffset: 10,
    layers: [
      'arcs',
      'arcLabels',
      'arcLinkLabels',
      ({ centerX, centerY }: { centerX: number; centerY: number }) => (
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
    ],
    tooltip: ({ datum: { id, value } }: { datum: ChartData }) => (
      <Box bg="white" p={2} borderRadius="md" boxShadow="md">
        <Text fontSize="sm" fontWeight="bold">
          {id}
        </Text>
        <Text fontSize="sm">{formatCurrency(value)}</Text>
      </Box>
    ),
  };

  return (
    <BoardContainer>
      <Heading as="h2" size="lg" mb={6}>
        {title}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <Box w="100%" aspectRatio={1} overflow="visible">
          <ResponsivePie data={sortedChartData} {...pieChartProps} />
        </Box>
        <Box>
          <Stack gap={2}>
            {sortedChartData.map((item) => (
              <HStack key={item.id} justify="space-between">
                <HStack>
                  <Box w={3} h={3} borderRadius="full" bg={colorMap[item.id]} />
                  <Text>
                    {title === '支出' ? `${item.label}費` : item.label}
                  </Text>
                </HStack>
                <Badge variant="outline" colorPalette={badgeColorPalette}>
                  {formatCurrency(item.value)}
                </Badge>
              </HStack>
            ))}
          </Stack>
        </Box>
      </SimpleGrid>
      <Accordion.Root collapsible defaultValue={[]} mt={6}>
        <Accordion.Item value="details">
          <Accordion.ItemTrigger
            bg="#7C3AED"
            color="white"
            px={6}
            py={2}
            borderRadius="full"
            _hover={{ bg: '#6D28D9' }}
          >
            <HStack justify="space-between" width="full">
              <Heading as="h3" size="sm">
                詳しく見る
              </Heading>
              <Accordion.ItemIndicator />
            </HStack>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent bg="purple.50" mt={2} p={2} borderRadius="lg">
            <Box p={2} spaceY={4}>
              {(() => {
                // グループ化: 公費セクションなら「公費」「自費」で分割、それ以外はカテゴリで分ける
                const grouped: Record<string, Transaction[]> = {};
                if (usePublicExpenseAmount) {
                  // 公費セクション: トランザクションを「公費」「自費」に分割
                  // 各トランザクションは複数セクションに含まれる可能性がある
                  transactions.forEach((t) => {
                    if (
                      'public_expense_amount' in t &&
                      t.public_expense_amount &&
                      t.public_expense_amount > 0
                    ) {
                      if (!grouped.公費) grouped.公費 = [];
                      grouped.公費.push(t);
                    }
                    if (
                      !t.public_expense_amount ||
                      t.public_expense_amount < t.price
                    ) {
                      if (!grouped.自費) grouped.自費 = [];
                      grouped.自費.push(t);
                    }
                  });
                } else {
                  // 通常セクション: カテゴリで分ける
                  transactions.forEach((t) => {
                    const cat = showType ? (t.type ?? t.category) : t.category;
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push(t);
                  });
                }
                // sortedChartDataの順番に詳細を表示
                return sortedChartData.map((chartItem) => {
                  const cat = chartItem.id;
                  const records = grouped[cat] || [];
                  const total = chartItem.value;
                  return (
                    <Box key={cat}>
                      <HStack
                        mb={2}
                        pl={2}
                        pr={4}
                        gap={2}
                        alignContent="space-between"
                        justify="space-between"
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            w={3}
                            h={3}
                            borderRadius="full"
                            bg={colorMap[cat]}
                          />
                          <Text fontWeight="bold">
                            {title.includes('支出') ? `${cat}費` : cat}
                          </Text>
                        </Box>
                        <Text fontWeight="bold" color="gray.700">
                          {formatCurrency(total)}
                        </Text>
                      </HStack>
                      <ScrollShadowBox
                        watch={records.length}
                        bg="white"
                        borderRadius="lg"
                        maxH="calc(100vh - 100px)"
                        overflowY="scroll"
                        scrollbar="hidden"
                        p={2}
                      >
                        {records.map((transaction, index) => (
                          <Box
                            key={transaction.data_id}
                            p={2}
                            borderBottomWidth={
                              index === records.length - 1 ? 0 : 1
                            }
                          >
                            <VStack gap={1} align="start">
                              <Text
                                fontSize="sm"
                                color="gray.600"
                                display={{ base: 'none', md: 'block' }}
                              >
                                {transaction.date || '-'}
                              </Text>
                              <HStack
                                justify="space-between"
                                w="full"
                                alignItems="flex-start"
                              >
                                <Text fontSize="sm">
                                  {transaction.purpose || '-'}
                                </Text>
                                <Text fontWeight="bold" fontSize="sm">
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
                              </HStack>
                              {transaction.note && (
                                <Text fontSize="xs" color="gray.500">
                                  【備考】{transaction.note}
                                </Text>
                              )}
                            </VStack>
                          </Box>
                        ))}
                      </ScrollShadowBox>
                    </Box>
                  );
                });
              })()}
            </Box>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </BoardContainer>
  );
}
