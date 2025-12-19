import {
  Accordion,
  Badge,
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Table,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ResponsivePie } from '@nivo/pie';
import { useMemo } from 'react';
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
  chartData: ChartData[];
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
  chartData,
  transactions,
  badgeColorPalette,
  showType = false,
  usePublicExpenseAmount = false,
}: TransactionSectionProps) {
  const totalAmount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData],
  );

  const pieChartProps: Record<string, unknown> = {
    margin: useBreakpointValue({
      base: { top: 10, right: 10, bottom: 10, left: 10 },
      md: { top: 40, right: 80, bottom: 80, left: 80 },
    }),
    colors: colorSchemeDefault,
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

  // chartDataを値の大きい順でソート
  const sortedChartData = useMemo(
    () => [...chartData].sort((a, b) => b.value - a.value),
    [chartData],
  );

  // データidと色のマッピングを作成
  const colorMap = sortedChartData.reduce<Record<string, string>>(
    (acc, item, idx) => {
      acc[item.id] = colorSchemeDefault[idx % colorSchemeDefault.length];
      return acc;
    },
    {},
  );

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
                  <Text>{item.label}</Text>
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
            px={4}
            py={3}
            borderRadius="md"
            _hover={{ bg: '#6D28D9' }}
          >
            <HStack justify="space-between" width="full">
              <Heading as="h3" size="md">
                {title}詳細一覧
              </Heading>
              <Accordion.ItemIndicator />
            </HStack>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Box overflowX="auto" pt={4}>
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
                  {transactions.map((transaction) => (
                    <Table.Row key={transaction.data_id}>
                      <Table.Cell>{transaction.date || '-'}</Table.Cell>
                      <Table.Cell>
                        <Badge size="sm">
                          {showType ? transaction.type : transaction.category}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{transaction.purpose || '-'}</Table.Cell>
                      <Table.Cell textAlign="right" fontWeight="bold">
                        {formatCurrency(
                          usePublicExpenseAmount
                            ? transaction.public_expense_amount || 0
                            : transaction.price,
                        )}
                      </Table.Cell>
                      <Table.Cell fontSize="xs">
                        {transaction.note || '-'}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </BoardContainer>
  );
}
