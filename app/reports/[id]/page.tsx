import fs from 'node:fs';
import path from 'node:path';
import { Box } from '@chakra-ui/react';
import { notFound } from 'next/navigation';
import { BoardMetadata } from '@/components/BoardMetadata';
import { BoardSummary } from '@/components/BoardSummary';
import { BoardTransactions } from '@/components/BoardTransactions';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Notice } from '@/components/Notice';
import type { AccountingReports } from '@/models/type';

async function getAccountingReports(
  id: string,
): Promise<AccountingReports | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      'public',
      'reports',
      `${id}.json`,
    );
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error loading report data:', error);
    return null;
  }
}

export async function generateStaticParams() {
  const reportsDirectory = path.join(process.cwd(), 'public', 'reports');

  try {
    const filenames = fs.readdirSync(reportsDirectory);

    return filenames
      .filter((name) => name.endsWith('.json'))
      .map((name) => ({
        id: name.replace('.json', ''),
      }));
  } catch (error) {
    console.error('Error reading reports directory:', error);
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAccountingReports(id);

  if (!data) {
    notFound();
  }
  const reportData = data.datas.find(
    (d) => d.report.id === data.latestReportId,
  );
  if (!reportData) {
    notFound();
  }
  return (
    <Box>
      <Header />
      <BoardSummary
        profile={data.profile}
        report={reportData.report}
        otherReports={data.datas.map((d) => d.report)}
        flows={reportData.flows}
        useFixedBoardChart={true}
      />
      <BoardTransactions
        direction={'income'}
        total={reportData.report.totalIncome}
        transactions={reportData.transactions.filter(
          (t) => t.direction === 'income',
        )}
        showPurpose={true}
        showDate={true}
      />
      <BoardTransactions
        direction={'expense'}
        total={reportData.report.totalExpense}
        transactions={reportData.transactions.filter(
          (t) => t.direction === 'expense',
        )}
        showPurpose={true}
        showDate={true}
      />
      <BoardMetadata report={reportData.report} />
      <Notice />
      <Footer />
    </Box>
  );
}
