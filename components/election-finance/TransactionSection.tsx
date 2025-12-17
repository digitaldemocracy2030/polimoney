import {
  Badge,
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react';
import { ResponsivePie } from '@nivo/pie';
import { BoardContainer } from '@/components/BoardContainer';

type Transaction = {
  data_id: string;
  date?: string;
  category: string;
  purpose?: string;
  price: number;
  note?: string;
  type?: string;
  public_expense_amount?: number;
};

type ChartData = {
  id: string;
  label: string;
  value: number;
};

interface TransactionSectionProps {
  title: string;
  chartData: ChartData[];
  summaryData: Record<string, number>;
  transactions: Transaction[];
  colorScheme: string;
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

function getCategoryJpName(category: string): string {
  const map: Record<string, string> = {
    income: '収入',
    expense: '支出',
    public_expense: '公費',
  };
  return map[category] || category;
}

export function TransactionSection({
  title,
  chartData,
  summaryData,
  transactions,
  colorScheme,
  badgeColorPalette,
  showType = false,
  usePublicExpenseAmount = false,
}: TransactionSectionProps) {
  const summaryLabel =
    title === '収入'
      ? '収入（タイプ別）'
      : title === '支出'
        ? '支出（カテゴリー別）'
        : '公費（カテゴリー別）';

  const tableLabel =
    title === '収入'
      ? 'タイプ'
      : title === '支出'
        ? 'カテゴリー'
        : 'カテゴリー';

  const detailsLabel =
    title === '収入'
      ? '収入詳細一覧'
      : title === '支出'
        ? '支出詳細一覧'
        : '公費詳細一覧';

  return (
    <BoardContainer>
      <Heading as="h2" size="lg" mb={6}>
        {title}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <Box h="400px">
          <ResponsivePie
            data={chartData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            sortByValue
            colors={{ scheme: colorScheme }}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 0.6]],
            }}
            arcLabelsSkipAngle={10}
            arcLinkLabelsSkipAngle={10}
            activeOuterRadiusOffset={10}
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
        <Box>
          <Heading as="h3" size="md" mb={4}>
            {summaryLabel}
          </Heading>
          <Stack gap={2}>
            {Object.entries(summaryData)
              .sort(([, a], [, b]) => b - a)
              .map(([key, total]) => (
                <HStack key={key} justify="space-between">
                  <Text>{getCategoryJpName(key)}</Text>
                  <Badge variant="outline" colorPalette={badgeColorPalette}>
                    {formatCurrency(total)}
                  </Badge>
                </HStack>
              ))}
          </Stack>
        </Box>
      </SimpleGrid>
      <Box mt={6}>
        <Heading as="h3" size="md" mb={4}>
          {detailsLabel}
        </Heading>
        <Box overflowX="auto">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>日付</Table.ColumnHeader>
                <Table.ColumnHeader>{tableLabel}</Table.ColumnHeader>
                <Table.ColumnHeader>目的</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right">金額</Table.ColumnHeader>
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
      </Box>
    </BoardContainer>
  );
}
