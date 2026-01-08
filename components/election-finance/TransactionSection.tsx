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
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BoardContainer } from '@/components/BoardContainer';
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
  title: string;
  transactions: Transaction[];
  badgeColorPalette: 'green' | 'red' | 'blue';
  showType?: boolean;
  usePublicExpenseAmount?: boolean;
}

type ScrollShadowBoxProps = BoxProps & {
  children: ReactNode;
  watch?: number;
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  });
}

function ScrollShadowBox({ children, watch, ...props }: ScrollShadowBoxProps) {
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
  }, [update]);

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

export function TransactionSection({
  title,
  transactions,
  badgeColorPalette,
  showType = false,
  usePublicExpenseAmount = false,
}: TransactionSectionProps) {
  // グラフ用データと詳細リスト用データを生成
  const { chartItems, groupedTransactions } = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    let items: ChartData[] = [];

    if (usePublicExpenseAmount) {
      // 公費・自費の振り分け
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
      // 通常のグルーピング
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

    // 値の大きい順にソート
    items.sort((a, b) => b.value - a.value);

    return { chartItems: items, groupedTransactions: grouped };
  }, [transactions, usePublicExpenseAmount, showType]);

  // 色のマッピング
  const colorMap = useMemo(
    () =>
      chartItems.reduce<Record<string, string>>((acc, item, idx) => {
        acc[item.id] = colorSchemeDefault[idx % colorSchemeDefault.length];
        return acc;
      }, {}),
    [chartItems],
  );

  // 合計金額
  const totalAmount = useMemo(
    () => chartItems.reduce((sum, item) => sum + item.value, 0),
    [chartItems],
  );

  const pieChartMargin = useBreakpointValue({
    base: { top: 10, right: 10, bottom: 10, left: 10 },
    md: { top: 40, right: 80, bottom: 80, left: 80 },
  });

  const enableArcLinkLabels = useBreakpointValue({ base: false, md: true });

  return (
    <BoardContainer>
      <Heading as="h2" size="lg" mb={6}>
        {title}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
        <Box w="100%" aspectRatio={1} overflow="visible">
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
            enableArcLinkLabels={enableArcLinkLabels}
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
              <Box bg="white" p={2} borderRadius="md" boxShadow="md">
                <Text fontSize="sm" fontWeight="bold">
                  {id}
                </Text>
                <Text fontSize="sm">{formatCurrency(value)}</Text>
              </Box>
            )}
          />
        </Box>
        <Stack gap={2}>
          {chartItems.map((item) => (
            <HStack key={item.id} justify="space-between">
              <HStack>
                <Box w={3} h={3} borderRadius="full" bg={colorMap[item.id]} />
                <Text>{item.label}</Text>
              </HStack>
              <Badge variant="outline" colorPalette={badgeColorPalette}>
                {formatCurrency(item.value)}
              </Badge>
            </HStack>
          ))}
        </Stack>
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
              {chartItems.map((chartItem) => {
                const cat = chartItem.id;
                const records = groupedTransactions[cat] || [];
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
                      maxH={{ base: 'calc(100vh - 100px)', md: 'none' }}
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
              })}
            </Box>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </BoardContainer>
  );
}
