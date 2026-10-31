'use client';

import { Button, Flex, Group, NativeSelect, SimpleGrid } from '@mantine/core';
import html2canvas from 'html2canvas';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { BoardChart } from '@/components/BoardChart';
import { BoardContainer } from '@/components/BoardContainer';
import { ProfileHeader } from '@/components/ProfileHeader';
import { SectionHeading } from '@/components/SectionHeading';
import { StatCard } from '@/components/StatCard';
import type { Category } from '@/data/common';
import type { Profile, Report, Transaction } from '@/models/type';
import { generateFlowsFromTransactions } from '@/utils/flowGenerator';

type Props = {
  profile: Profile;
  report: Report;
  otherReports: Report[];
  transactions: Transaction[];
  categories?: {
    income: Category[];
    expense: Category[];
  };
  reportPathPrefix: string;
};

export function BoardSummary({
  profile,
  report,
  otherReports,
  transactions,
  categories,
  reportPathPrefix,
}: Props) {
  const [copied, setCopied] = useState(false);
  const flows = categories
    ? generateFlowsFromTransactions(transactions, categories)
    : [];

  const allReports = [
    report,
    ...otherReports.filter((r) => r.id !== report.id),
  ];
  const sortedReports = [...allReports].sort((a, b) => b.year - a.year);

  const handleCopyImage = async () => {
    const button = document.getElementById('copy-image-btn');
    if (button) button.style.display = 'none';
    const element = document.getElementById('summary');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 3 });
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch (_e) {
          alert('コピーに失敗しました');
        }
      }
      if (button) button.style.display = '';
    });
  };

  return (
    <BoardContainer id="summary">
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align="center"
        justify="space-between"
        gap="md"
        mb="xl"
      >
        <ProfileHeader profile={profile} />
        <NativeSelect
          w={300}
          value={report.id}
          onChange={(e) => {
            window.location.href = `${reportPathPrefix}/${e.currentTarget.value}`;
          }}
          data={sortedReports.map((r) => ({
            value: r.id,
            label: `${r.year}年 ${r.orgName}`,
          }))}
        />
      </Flex>

      <SectionHeading>収支の流れ</SectionHeading>
      <SimpleGrid cols={{ base: 1, lg: 3 }} mb="md">
        <StatCard
          label="収入総額"
          value={Math.round(report.totalIncome / 10000)}
          tone="income"
        />
        <StatCard
          label="支出総額"
          value={Math.round(report.totalExpense / 10000)}
          tone="expense"
        />
        <StatCard
          label="年間収支"
          value={Math.round(report.totalBalance / 10000)}
        />
      </SimpleGrid>

      <BoardChart flows={flows} />

      <Group justify="flex-end" mt="sm" visibleFrom="md">
        <Button
          id="copy-image-btn"
          variant="default"
          leftSection={
            copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />
          }
          onClick={handleCopyImage}
        >
          {copied ? 'コピーしました' : '画像としてコピー'}
        </Button>
      </Group>
    </BoardContainer>
  );
}
