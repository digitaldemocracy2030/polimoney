import { Paper, Text } from '@mantine/core';

type Props = {
  label: string;
  value: number | string;
  unit?: string;
  tone?: 'income' | 'expense';
};

const toneColors = { income: 'cyan.7', expense: 'pink.7' };

export function StatCard({ label, value, unit = '万円', tone }: Props) {
  return (
    <Paper withBorder p="md">
      <Text size="sm" fw={700} c={tone ? toneColors[tone] : undefined}>
        {label}
      </Text>
      <Text size="xl" fw={700}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        <Text component="span" size="sm" fw={700} ml={4}>
          {unit}
        </Text>
      </Text>
    </Paper>
  );
}
